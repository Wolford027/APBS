# Fingerprint Scanner Test Page — Design

**Date:** 2026-07-13
**Status:** Approved

## Purpose

A standalone diagnostic page to verify the DigitalPersona fingerprint reader works
end-to-end before the scanner is wired into attendance/enrollment: device detected →
finger scanned → captured image displayed with a quality verdict.

## Context

- The DigitalPersona WebSDK is already loaded globally in `public/index.html`
  (`fingerprint.sdk.min.js` + `websdk.client.bundle.min.js`), exposing `window.Fingerprint`.
- `src/_FingerPrintReader/api/sdk_mod.js` wraps the SDK but its capture callback
  injects an `<img>` into `document.getElementById('imagediv')` and writes to
  `localStorage` — incompatible with React state. This page bypasses that wrapper
  and talks to `window.Fingerprint.WebApi` directly. `sdk_mod.js` is left untouched.
- Hardware-test pages already exist as standalone public routes (`/scan-rfid`,
  `/register-rfid`) under `src/modules/Rfid/views/`. This feature mirrors that pattern.

## Architecture

New module `src/modules/Fingerprint/`:

### `hooks/useFingerprintReader.js`

React hook owning all SDK interaction. No component touches `window.Fingerprint` directly.

**Exposed state:**
- `sdkAvailable` — false when `window.Fingerprint` is missing (script not loaded).
- `devices` — array of reader UIDs from `enumerateDevices()`.
- `status` — `'no-reader' | 'ready' | 'scanning' | 'captured' | 'error'`.
- `capturedImage` — data-URL PNG of the last scan (null until a scan lands).
- `quality` — `'Good' | 'TooLight' | 'TooDark' | 'LowContrast'` computed from the
  captured image using the same average-brightness thresholds as `sdk_mod.js`
  (>200 Good, >180 TooLight, <50 TooDark, else LowContrast) so verdicts match the
  future enrollment flow.
- `error` — human-readable message for the current failure, if any.

**Exposed actions:** `refreshDevices()`, `startCapture()`, `stopCapture()`.

**Behavior:**
- On mount: enumerate devices; subscribe to `onDeviceConnected` / `onDeviceDisconnected`
  (re-enumerate) and `onSamplesAcquired` (decode sample via `Fingerprint.b64UrlTo64`,
  set image + quality, transition to `captured`, stop acquisition).
- On unmount: stop acquisition and detach callbacks.
- All SDK promise rejections map to `status: 'error'` with a readable message.

### `views/FingerprintTest.jsx`

Standalone full-screen page (no SideNav — public route), styled with the app design
system (theme tokens, `shared/animations` motion variants, ambient brand glows like
the post-login Loading screen).

Layout: centered bordered card, two panels —
- **Reader panel:** connection status chip (green "Reader connected" / red "No reader
  found"), device UID, Refresh devices button.
- **Scan panel:** large circular scan zone — fingerprint icon idle, pulsing while
  scanning, replaced by the captured fingerprint image on success — with a
  color-coded quality chip (Good → success, others → warning) and contextual
  actions: Start scan / Stop / Scan again.
- Three-step hint strip (Connect reader → Start scan → Place finger) and a
  "Back to home" link, mirroring the login page affordance.

### Route

`src/App.js`: public `<Route path="/fingerprint-test" element={<FingerprintTest />} />`,
declared alongside `/scan-rfid`.

## Error handling

- SDK script missing → full-card notice ("Fingerprint SDK not loaded") — no crash.
- No reader connected → `no-reader` state with retry via Refresh devices.
- Capture/communication failure → `error` state with the SDK message and Try again.

## Out of scope

- Enrollment, matching, or storing fingerprints (future work; this page is read-only).
- Changes to `sdk_mod.js` or backend endpoints.

## Testing

- Lint + compile clean; page exercised in the served app.
- Physical scans require the hardware; the no-reader and SDK-missing states are
  verifiable without it.
