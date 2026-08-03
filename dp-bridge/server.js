"use strict";
/**
 * dp-bridge: a Linux-native stand-in for the DigitalPersona "WebSdk Agent".
 *
 * It speaks the exact same protocol that public/websdk.client.bundle.min.js
 * and public/fingerprint.sdk.min.js already expect, so those two files (and
 * your src/fingerprint_reader/api/sdk_mod.js) run completely unmodified on
 * Linux. There is nothing to change in the frontend.
 *
 * Protocol (reverse-engineered from the uploaded bundle, verified against it
 * in srp-harness.js):
 *   1. Browser does GET https://127.0.0.1:52181/get_connection (hardcoded
 *      in the bundle). We answer with an `endpoint` URL carrying SRP
 *      credentials as query params.
 *   2. Browser does SRP-6a login (1024-bit RFC5054 group, SHA-1 -- this is
 *      hardcoded client-side, see srp.js) via POST <endpoint>/connect.
 *   3. Browser opens a WebSocket to ws://host:port/fingerprints with the
 *      SRP proof (M1) in the query string.
 *   4. From then on it's a small JSON-RPC protocol, double base64-encoded
 *      (outer: WebChannel transport layer, plain base64; inner: the SDK's
 *      own base64url encoding of the JSON payload and of nested
 *      Parameters/Data fields).
 *
 * Wire it up to real hardware by replacing `captureFingerprint()` below with
 * a libfprint or fprintd call that returns PNG bytes.
 */

const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const crypto = require("crypto");
const { execFileSync } = require("child_process");
const { WebSocketServer } = require("ws");
const { SRPClient, BigInteger } = require("./srp.js");

const DISCOVERY_PORT = 52181; // hardcoded in websdk.client.bundle.min.js, cannot change
const AGENT_PORT = 52182; // ours to choose -- reported back via web_sdk_port
const CLIENT_PATH = "fingerprints"; // matches new WebSdk.WebChannelClient("fingerprints")

// ---------- base64 / base64url helpers (mirroring fingerprint.sdk.min.js) ----------
const b64UrlToB64 = (s) => {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = s.length % 4;
  if (pad === 2) s += "==";
  else if (pad === 3) s += "=";
  return s;
};
const b64ToB64Url = (s) => s.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
const utf8ToB64Url = (s) => b64ToB64Url(Buffer.from(s, "utf8").toString("base64"));
const b64UrlToUtf8 = (s) => Buffer.from(b64UrlToB64(s), "base64").toString("utf8");

// ---------- one-time cert + SRP credential bootstrap ----------
const CERT_DIR = path.join(__dirname, "certs");
function ensureCert() {
  const keyPath = path.join(CERT_DIR, "key.pem");
  const certPath = path.join(CERT_DIR, "cert.pem");
  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    return { key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) };
  }
  fs.mkdirSync(CERT_DIR, { recursive: true });
  try {
    execFileSync("openssl", [
      "req", "-x509", "-newkey", "rsa:2048", "-nodes",
      "-keyout", keyPath, "-out", certPath,
      "-days", "3650", "-subj", "/CN=127.0.0.1",
    ]);
  } catch (e) {
    console.error("Could not generate a self-signed cert (is openssl installed?).", e.message);
    process.exit(1);
  }
  return { key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) };
}

// SRP identity for this agent instance. Regenerated on every start -- it's
// only used to authenticate the local browser tab to the local daemon, not
// a real account, so there's nothing worth persisting.
// SRP identity for this agent instance. Persisted to disk (not just
// generated fresh each start) because the bundle's Configurator class
// caches whatever username/password/salt it's given in sessionStorage and
// will keep reusing them across page reloads without re-fetching
// /get_connection. If we handed out a new random identity on every
// restart, any browser tab that already loaded the page once would be
// stuck proving against credentials that no longer exist -> "SRP proof
// mismatch". Keeping the identity stable means restarting the daemon
// during dev doesn't strand already-open tabs.
function ensureSrpIdentity() {
  const credPath = path.join(CERT_DIR, "srp-identity.json");
  if (fs.existsSync(credPath)) {
    return JSON.parse(fs.readFileSync(credPath, "utf8"));
  }
  const identity = {
    username: "dp-bridge",
    passwordHex: crypto.randomBytes(16).toString("hex"),
    saltHex: crypto.randomBytes(16).toString("hex"),
  };
  fs.mkdirSync(CERT_DIR, { recursive: true });
  fs.writeFileSync(credPath, JSON.stringify(identity));
  return identity;
}
const { username: srpUsername, passwordHex: srpPasswordHex, saltHex: srpSaltHex } = ensureSrpIdentity();
const serverSrp = new SRPClient(srpUsername, srpPasswordHex, 1024, "sha-1");
const verifier = serverSrp.calculateV(srpSaltHex);

// in-flight handshakes, keyed by username (single-agent, so effectively one at a time)
const pendingHandshakes = new Map();

// ---------- 1. discovery endpoint (https://127.0.0.1:52181/get_connection) ----------
const { key, cert } = ensureCert();
const discoveryServer = https.createServer({ key, cert }, (req, res) => {
  if (req.method === "GET" && req.url === "/get_connection") {
    const endpoint =
      `http://127.0.0.1:${AGENT_PORT}/` +
      `?web_sdk_port=${AGENT_PORT}` +
      `&web_sdk_secure=false` +
      `&web_sdk_username=${encodeURIComponent(srpUsername)}` +
      `&web_sdk_password=${encodeURIComponent(srpPasswordHex)}` +
      `&web_sdk_salt=${encodeURIComponent(srpSaltHex)}`;
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    });
    res.end(JSON.stringify({ endpoint }));
    return;
  }
  res.writeHead(404);
  res.end();
});
discoveryServer.listen(DISCOVERY_PORT, "127.0.0.1", () => {
  console.log(`[dp-bridge] discovery listening on https://127.0.0.1:${DISCOVERY_PORT}`);
  console.log(`[dp-bridge] first run: open https://127.0.0.1:${DISCOVERY_PORT}/get_connection`);
  console.log(`[dp-bridge] in your browser once and accept the self-signed cert warning.`);
});

// ---------- 2. agent server (http + ws on 52182) ----------
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": process.env.DP_BRIDGE_CORS_ORIGIN || "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const agentServer = http.createServer((req, res) => {
  if (req.method === "OPTIONS") {
    // CORS preflight -- the browser sends this before the real POST /connect
    // because it carries a Content-Type: application/json body. Without this,
    // the preflight 404s and the browser never sends the actual request.
    res.writeHead(204, CORS_HEADERS);
    res.end();
    return;
  }
  if (req.method === "POST" && req.url === "/connect") {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      try {
        // websdk.client.bundle.min.js's XHR helper (`h`) posts bodies as
        // "key=value&key2=value2" via encodeURIComponent -- classic
        // application/x-www-form-urlencoded, never JSON. Parse it that way.
        const params = new URLSearchParams(body);
        const username = params.get("username");
        const aHex = params.get("A");
        if (!username || !aHex) throw new Error("missing username or A");
        if (username !== srpUsername) throw new Error("unknown user");
        const A = new BigInteger(aHex, 16);
        const b = serverSrp.srpRandom();
        const B = serverSrp.calculateB(b, verifier);
        pendingHandshakes.set(username, { A, B, b });
        res.writeHead(200, { "Content-Type": "application/json", ...CORS_HEADERS });
        res.end(JSON.stringify({ B: B.toString(16) }));
      } catch (e) {
        console.error("[dp-bridge] /connect failed:", e.message || e);
        res.writeHead(400, CORS_HEADERS);
        res.end(JSON.stringify({ error: String(e.message || e) }));
      }
    });
    return;
  }
  res.writeHead(404, CORS_HEADERS);
  res.end();
});

const wss = new WebSocketServer({ server: agentServer, path: `/${CLIENT_PATH}` });

wss.on("connection", (ws, req) => {
  const url = new URL(req.url, "http://127.0.0.1");
  const username = url.searchParams.get("username");
  const m1FromClient = url.searchParams.get("M1");
  const pending = pendingHandshakes.get(username);

  if (!pending || !m1FromClient) {
    ws.close(4001, "no pending handshake");
    return;
  }
  const { A, B, b } = pending;
  const u = serverSrp.calculateU(A, B);
  const S = serverSrp.calculateServerS(A, verifier, u, b);
  const K = serverSrp.calculateK(S);
  const expectedM1 = serverSrp.calculateM1(A, B, K, srpSaltHex).toString(16);

  if (expectedM1 !== m1FromClient) {
    console.error("[dp-bridge] SRP proof mismatch, rejecting connection");
    ws.close(4003, "auth failed");
    return;
  }
  pendingHandshakes.delete(username);
  console.log("[dp-bridge] browser authenticated, WebChannel open");

  const deviceId = "00000000-0000-0000-0000-000000000001";
  let connected = false;

  const sendEnvelope = (obj) => {
    // inner layer: SDK's own base64url of the JSON envelope
    const inner = utf8ToB64Url(JSON.stringify(obj));
    // outer layer: WebChannel transport, plain base64 (see websdk bundle's `l` codec)
    const outer = Buffer.from(inner, "utf8").toString("base64");
    ws.send(outer);
  };

  const sendResponse = (method, result, data) => {
    sendEnvelope({
      Type: 0, // Response
      Data: utf8ToB64Url(JSON.stringify({ Method: method, Result: result, Data: data })),
    });
  };

  const sendNotification = (event, data) => {
    sendEnvelope({
      Type: 1, // Notification
      Data: utf8ToB64Url(
        JSON.stringify({ Event: event, Device: deviceId, Data: utf8ToB64Url(JSON.stringify(data)) })
      ),
    });
  };

  ws.on("message", async (raw) => {
    let cmd;
    try {
      const rawText = raw.toString();
      if (!rawText) {
        return;
      }
      const outerDecoded = Buffer.from(rawText, "base64").toString("utf8");
      if (!outerDecoded) {
        return;
      }
      cmd = JSON.parse(b64UrlToUtf8(outerDecoded));
    } catch (e) {
      console.error("[dp-bridge] bad frame", e);
      return;
    }

    switch (cmd.Method) {
      case 1: // EnumerateDevices
        sendResponse(1, 0, utf8ToB64Url(JSON.stringify({ DeviceIDs: JSON.stringify([deviceId]) })));
        break;

      case 2: // GetDeviceInfo
        sendResponse(
          2,
          0,
          utf8ToB64Url(
            JSON.stringify({
              DeviceID: deviceId,
              DeviceTech: 1, // Optical
              DeviceModality: 2, // Area
            })
          )
        );
        break;

      case 3: // StartAcquisition
        sendResponse(3, 0);
        if (!connected) {
          connected = true;
          sendNotification(3, {}); // Connected
        }
        captureFingerprint()
          .then((pngBuffer) => {
            const b64urlPng = pngBuffer.toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
            sendNotification(0, {
              // Completed
              SampleFormat: 5, // PngImage
              Samples: JSON.stringify([b64urlPng]),
            });
          })
          .catch((err) => {
            sendNotification(1, { uError: 1 }); // Error
            console.error("[dp-bridge] capture failed:", err);
          });
        break;

      case 4: // StopAcquisition
        sendResponse(4, 0);
        break;

      default:
        console.error("[dp-bridge] unknown method", cmd.Method);
    }
  });

  ws.on("close", () => {
    console.log("[dp-bridge] WebChannel closed");
  });
});

agentServer.listen(AGENT_PORT, "127.0.0.1", () => {
  console.log(`[dp-bridge] agent listening on ws://127.0.0.1:${AGENT_PORT}/${CLIENT_PATH}`);
});

// ---------- capture ----------
// This stub returns a placeholder 1x1 PNG so the protocol layer (SRP +
// WebSocket + JSON-RPC framing) can be proven end-to-end without hardware --
// which is what the bundled test-client.js does.
//
// To wire up the real URU4500, replace the body with a call to capture.py
// (see that file for why fprintd isn't used here):
//
//   const { execFile } = require("child_process");
//   function captureFingerprint() {
//     return new Promise((resolve, reject) => {
//       execFile("python3", [path.join(__dirname, "capture.py")], { encoding: "buffer", maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
//         if (err) return reject(new Error(stderr.toString() || err.message));
//         resolve(stdout);
//       });
//     });
//   }
function captureFingerprint() {
  const onePixelPng = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
    "base64"
  );
  return new Promise((resolve) => setTimeout(() => resolve(onePixelPng), 300));
}

module.exports = { captureFingerprint };
