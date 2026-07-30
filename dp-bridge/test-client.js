"use strict";
const https = require("https");
const http = require("http");
const WebSocket = require("ws");
const { SRPClient } = require("./srp.js");

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

function getConnection() {
  return new Promise((resolve, reject) => {
    https.get(
      "https://127.0.0.1:52181/get_connection",
      { rejectUnauthorized: false }, // simulates the user having accepted the cert once
      (res) => {
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => resolve(JSON.parse(body)));
      }
    ).on("error", reject);
  });
}

function connect(username, A) {
  return new Promise((resolve, reject) => {
    // Match the real bundle's XHR helper exactly: encodeURIComponent'd
    // key=value pairs, joined with &, sent as the raw body (no JSON).
    const body = [
      `username=${encodeURIComponent(username)}`,
      `A=${encodeURIComponent(A.toString(16))}`,
    ].join("&");
    const req = http.request(
      { hostname: "127.0.0.1", port: 52182, path: "/connect", method: "POST" },
      (res) => {
        let resBody = "";
        res.on("data", (c) => (resBody += c));
        res.on("end", () => resolve(JSON.parse(resBody)));
      }
    );
    req.on("error", reject);
    req.end(body);
  });
}

async function main() {
  const { endpoint } = await getConnection();
  console.log("[test-client] discovery endpoint:", endpoint);
  const u = new URL(endpoint);
  const username = u.searchParams.get("web_sdk_username");
  const passwordHex = u.searchParams.get("web_sdk_password");
  const saltHex = u.searchParams.get("web_sdk_salt");
  const port = u.searchParams.get("web_sdk_port");

  const srp = new SRPClient(username, passwordHex, 1024, "sha-1");
  let a;
  do { a = srp.srpRandom(); } while (!srp.canCalculateA(a));
  const A = srp.calculateA(a);

  const { B: bHex } = await connect(username, A);
  const B = new (require("./srp.js").BigInteger)(bHex, 16);

  const uVal = srp.calculateU(A, B);
  const S = srp.calculateS(B, saltHex, uVal, a);
  const K = srp.calculateK(S);
  const M1 = srp.calculateM1(A, B, K, saltHex).toString(16);

  const wsUrl = `ws://127.0.0.1:${port}/fingerprints?username=${encodeURIComponent(username)}&M1=${M1}&sessionId=test&version=2`;
  console.log("[test-client] connecting WS:", wsUrl);
  const ws = new WebSocket(wsUrl);

  const sendCommand = (method, parameters) => {
    const command = { Method: method };
    if (parameters) command.Parameters = utf8ToB64Url(JSON.stringify(parameters));
    const inner = utf8ToB64Url(JSON.stringify(command));
    const outer = Buffer.from(inner, "utf8").toString("base64");
    ws.send(outer);
  };

  ws.on("open", () => {
    console.log("[test-client] WS open (SRP handshake accepted!)");
    console.log("[test-client] sending StartAcquisition...");
    sendCommand(3, { DeviceID: "00000000-0000-0000-0000-000000000000", SampleType: 5 });
  });

  ws.on("message", (raw) => {
    const outerDecoded = Buffer.from(raw.toString(), "base64").toString("utf8");
    const envelope = JSON.parse(b64UrlToUtf8(outerDecoded));
    if (envelope.Type === 0) {
      const resp = JSON.parse(b64UrlToUtf8(envelope.Data));
      console.log("[test-client] Response:", resp);
    } else if (envelope.Type === 1) {
      const notif = JSON.parse(b64UrlToUtf8(envelope.Data));
      const decodedInner = notif.Data ? JSON.parse(b64UrlToUtf8(notif.Data)) : undefined;
      console.log("[test-client] Notification event", notif.Event, decodedInner ? Object.keys(decodedInner) : "");
      if (notif.Event === 0) {
        // Completed -> mirror sdk_mod.js's samplesAcquired()
        const samples = JSON.parse(decodedInner.Samples);
        const pngBytes = Buffer.from(samples[0].replace(/-/g, "+").replace(/_/g, "/"), "base64");
        console.log("[test-client] SUCCESS: got", pngBytes.length, "byte PNG, magic:", pngBytes.slice(0, 8).toString("hex"));
        ws.close();
        process.exit(0);
      }
    }
  });

  ws.on("close", (code, reason) => console.log("[test-client] closed", code, reason.toString()));
  ws.on("error", (e) => { console.error("[test-client] error", e); process.exit(1); });
}

main().catch((e) => { console.error(e); process.exit(1); });