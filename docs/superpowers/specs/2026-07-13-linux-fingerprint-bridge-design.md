# Linux Fingerprint Bridge — Design

**Date:** 2026-07-13
**Status:** Approved (dev tool only)

## Problem

The APBS fingerprint pages use the DigitalPersona WebSDK (`public/fingerprint.sdk.min.js`
+ `public/websdk.client.bundle.min.js`). That SDK never touches USB: it connects to a
local "DigitalPersona Agent" at `https://127.0.0.1:52181/get_connection`, which HID ships
only for Windows (Lite Client / Workstation). On the Ubuntu dev laptop nothing listens on
52181, so `/fingerprint-test` shows "No reader found" and "Lost communication with the
fingerprint service" even though the U.are.U 4000/4000B/4500 reader (USB `05ba:000a`) is
connected and fully supported by Linux's libfprint (`fprintd-list` sees it).

## Goal

Let the fingerprint test page (and future enrollment flow) capture real prints on the
Ubuntu dev laptop, with **zero changes** to `useFingerprintReader`, `FingerprintTest.jsx`,
or `src/_FingerPrintReader/api/sdk_mod.js`. The same build must keep working unmodified on
a Windows machine running the real DigitalPersona agent.

## Non-goals

- Not a production/deployment path. No systemd unit, no TLS, no multi-user hardening.
- No enrollment/verification logic in the bridge — it only enumerates and captures images.
- No emulation of DigitalPersona's proprietary 52181 protocol.

## Architecture

```
React page → useFingerprintReader → window.Fingerprint   (interface unchanged)
                                          │
                            ┌─ bridge alive ┴─ bridge dead ─┐
                            ▼                               ▼
              BridgeFingerprint shim              real DigitalPersona SDK
                            │                        (Windows, port 52181)
               HTTP http://127.0.0.1:52182
                            ▼
        tools/fingerprint-bridge/bridge.py   (Python 3 + gi/libfprint)
                            ▼
                 U.are.U reader (USB)
```

Two new pieces:

1. **Bridge** — `tools/fingerprint-bridge/bridge.py`
2. **Shim** — `src/modules/Fingerprint/bridge/installFingerprintBridge.js`, imported at
   the top of `src/index.js` (before React renders)

## Component 1: Bridge (`tools/fingerprint-bridge/bridge.py`)

- Python 3, **stdlib + `gi` only** (GObject bindings for libfprint). No pip installs.
- One-time system prerequisite (user runs): `sudo apt install gir1.2-fprint-2.0`
  (`python3-gi` is already installed; libfprint udev rules already grant the logged-in
  user device access).
- HTTP server (`http.server.ThreadingHTTPServer`) bound to `127.0.0.1:52182`.
- CORS: `Access-Control-Allow-Origin: *` on every response; answers `OPTIONS` preflight.
- All libfprint work is funneled through a single worker thread (GObject/libfprint calls
  are serialized; HTTP handler threads submit jobs and wait).
- Started via npm script: `"fp-bridge": "python3 tools/fingerprint-bridge/bridge.py"`.
- If `gi` or the FPrint typelib is missing, exit at startup with the exact
  `sudo apt install gir1.2-fprint-2.0` instruction.

### HTTP API

| Endpoint | Behavior |
|---|---|
| `GET /health` | `200 {"ok": true, "service": "apbs-fingerprint-bridge", "version": 1}` — used by the shim probe. |
| `GET /devices` | Fresh libfprint enumeration. `200 {"devices": ["<device name>"]}` (empty array when no reader). |
| `POST /capture` | Blocks until one finger image is captured, then `200 {"samples": ["<base64url-encoded PNG>"]}`. `408` after 60 s with no finger. `409` if a capture is already in flight. `503` when no device is present. `500 {"error": "<message>"}` for device errors (e.g., busy). Client abort cancels the capture via `Gio.Cancellable`. |

### Capture path

`FPrint.Context` → first device → `open_sync` → `capture_sync(wait_for_finger=True,
cancellable)` → `close_sync`. The returned `FPrint.Image` (8-bit grayscale, width ×
height) is PNG-encoded by a small stdlib encoder (`zlib` + `struct`; grayscale color
type 0) — no Pillow dependency. The PNG bytes are base64url-encoded (`-`/`_` alphabet, no
padding differences matter since the shim converts) to match what the DigitalPersona SDK
delivers.

## Component 2: Shim (`installFingerprintBridge.js`)

Imported first in `src/index.js`, it runs at bundle evaluation:

- Saves the original `window.Fingerprint` (the DP SDK loaded from `public/index.html`),
  then synchronously replaces `window.Fingerprint` with a wrapper exposing exactly the
  surface the app uses:
  - `WebApi` class: `enumerateDevices()`, `startAcquisition(format)`,
    `stopAcquisition()`, and assignable handlers `onDeviceConnected`,
    `onDeviceDisconnected`, `onCommunicationFailed`, `onSamplesAcquired`.
  - `SampleFormat` (same constant values as the DP SDK; the bridge always returns PNG).
  - `b64UrlTo64(s)` — pure function, implemented locally.
- **Transport selection is lazy and async:** on the first `WebApi` method call, probe
  `GET http://127.0.0.1:52182/health` with an ~800 ms `AbortController` timeout, memoize
  the result.
  - Probe succeeds → all calls route to the bridge.
  - Probe fails → every method and handler delegates to an instance of the saved original
    DP `WebApi` (Windows behaves exactly as today). If no original SDK exists either, the
    methods reject and `onCommunicationFailed` fires — same UX as today's broken state.
- Bridge-mode semantics (matching the hook's expectations, see
  `useFingerprintReader.js`):
  - `enumerateDevices()` → `GET /devices` → resolves the array.
  - `startAcquisition()` → resolves immediately after issuing `POST /capture` (hook sets
    status "scanning" on resolve). When the capture response arrives, fires
    `onSamplesAcquired({samples: JSON.stringify(["<base64url PNG>"])})` — byte-compatible
    with the DP SDK shape the hook already parses. On `408` (no finger yet), silently
    re-issues the capture until stopped — mirrors DP's acquire-until-stop behavior.
  - `stopAcquisition()` → aborts the in-flight `POST /capture` and resolves.
  - Network failure while acquiring (bridge killed) → fires `onCommunicationFailed`.
  - `onDeviceConnected`/`onDeviceDisconnected` never fire in bridge mode; the page's
    "Refresh devices" button covers hotplug. Acceptable for a dev tool.

## Error handling summary

| Situation | Result on the page |
|---|---|
| Bridge not started on Linux | Shim falls back to DP SDK → today's error state. Bridge README documents "run `npm run fp-bridge` first". |
| Reader unplugged | `/devices` → `[]` → "No reader found"; Refresh re-enumerates. |
| Bridge dies mid-scan | `onCommunicationFailed` → existing error UI. |
| No finger within 60 s | Shim re-issues capture; scanning state persists until Stop. |
| Device busy (e.g., fprintd enrolling) | `500` → shim fires `onCommunicationFailed` → the page's standard error state; the detailed cause appears in the bridge's terminal log and HTTP response body. |

## Testing

- **Jest (shim):** mocked `fetch` — probe success routes to bridge; probe failure
  delegates to the saved DP SDK; `startAcquisition` delivers the exact
  `{samples: "<json string>"}` shape; `stopAcquisition` aborts; network error fires
  `onCommunicationFailed`.
- **Regression:** existing `useFingerprintReader.test.js` and `FingerprintTest.test.jsx`
  pass unmodified — that is the proof of interface parity.
- **Hardware verification (manual, on this laptop):** `curl` each endpoint; then run
  bridge + `npm start`, open `/fingerprint-test`, scan a finger, confirm image + quality
  chip render.

## Files

| File | Change |
|---|---|
| `tools/fingerprint-bridge/bridge.py` | new — HTTP bridge |
| `tools/fingerprint-bridge/README.md` | new — prereqs + usage |
| `src/modules/Fingerprint/bridge/installFingerprintBridge.js` | new — shim |
| `src/modules/Fingerprint/bridge/installFingerprintBridge.test.js` | new — jest tests |
| `src/index.js` | one import line at top |
| `package.json` | add `fp-bridge` script |
