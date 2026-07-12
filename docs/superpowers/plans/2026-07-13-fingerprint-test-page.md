# Fingerprint Scanner Test Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A public `/fingerprint-test` page that proves the DigitalPersona reader works: device detected → finger scanned → captured image shown with a quality verdict.

**Architecture:** A `useFingerprintReader` hook owns all `window.Fingerprint.WebApi` interaction (device enumeration, acquisition lifecycle, sample decoding, quality verdict); a standalone `FingerprintTest` view renders it with the app design system; one public route in `App.js`. The legacy `src/_FingerPrintReader/api/sdk_mod.js` is bypassed (its capture callback DOM-injects into `#imagediv`) and left untouched.

**Tech Stack:** React 18 (CRA), MUI 5 (`sx` + theme tokens from `src/shared/theme.js`), `motion/react` variants from `src/shared/animations.js`, DigitalPersona WebSDK already loaded globally in `public/index.html` (`window.Fingerprint`), Jest + React Testing Library 13 (`renderHook` available; jsdom shims live in `src/setupTests.js`).

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-13-fingerprint-test-page-design.md`.
- Do not modify `src/_FingerPrintReader/api/sdk_mod.js` or any backend file.
- Quality thresholds must match `sdk_mod.js`: avg brightness >200 `Good`, >180 `TooLight`, <50 `TooDark`, else `LowContrast`.
- Status values are exactly: `'no-reader' | 'ready' | 'scanning' | 'captured' | 'error'`.
- Styling: theme tokens only (no hardcoded off-brand hex; the brand gradient `linear-gradient(160deg, #0F172A 0%, #1E3A8A 60%, #2563EB 100%)` and primary/secondary glow pattern from `Login.jsx`/`Loading.jsx` are the approved exceptions).
- The page must render a clear notice (not crash) when `window.Fingerprint` is undefined.

---

### Task 1: `useFingerprintReader` hook

**Files:**
- Create: `src/modules/Fingerprint/hooks/useFingerprintReader.js`
- Test: `src/modules/Fingerprint/hooks/useFingerprintReader.test.js`

**Interfaces:**
- Consumes: `window.Fingerprint` global (`WebApi`, `SampleFormat.PngImage`, `b64UrlTo64`).
- Produces (used by Task 2):
  - default export `useFingerprintReader()` returning `{ sdkAvailable: boolean, devices: string[], status: 'no-reader'|'ready'|'scanning'|'captured'|'error', capturedImage: string|null, quality: 'Good'|'TooLight'|'TooDark'|'LowContrast'|null, error: string, refreshDevices(): void, startCapture(): void, stopCapture(): void }`
  - named export `qualityFromBrightness(avgBrightness: number): string`
  - named export `QUALITY_LABELS: Record<string, string>` (`Good: 'Good'`, `TooLight: 'Too light'`, `TooDark: 'Too dark'`, `LowContrast: 'Low contrast'`)

- [ ] **Step 1: Write the failing tests**

```js
// src/modules/Fingerprint/hooks/useFingerprintReader.test.js
import { renderHook, act } from '@testing-library/react';
import useFingerprintReader, { qualityFromBrightness } from './useFingerprintReader';

let mockDevices;

class MockWebApi {
  enumerateDevices = jest.fn(() => Promise.resolve(mockDevices));
  startAcquisition = jest.fn(() => Promise.resolve());
  stopAcquisition = jest.fn(() => Promise.resolve());
}

beforeEach(() => {
  mockDevices = ['reader-uid-1'];
  window.Fingerprint = {
    WebApi: MockWebApi,
    SampleFormat: { PngImage: 5 },
    b64UrlTo64: (s) => s,
  };
});

afterEach(() => {
  delete window.Fingerprint;
});

describe('qualityFromBrightness', () => {
  it('maps brightness to the sdk_mod thresholds', () => {
    expect(qualityFromBrightness(210)).toBe('Good');
    expect(qualityFromBrightness(190)).toBe('TooLight');
    expect(qualityFromBrightness(30)).toBe('TooDark');
    expect(qualityFromBrightness(120)).toBe('LowContrast');
  });
});

describe('useFingerprintReader', () => {
  it('reports ready when a reader is found', async () => {
    const { result } = renderHook(() => useFingerprintReader());
    await act(async () => {});
    expect(result.current.sdkAvailable).toBe(true);
    expect(result.current.devices).toEqual(['reader-uid-1']);
    expect(result.current.status).toBe('ready');
  });

  it('reports no-reader when enumeration is empty', async () => {
    mockDevices = [];
    const { result } = renderHook(() => useFingerprintReader());
    await act(async () => {});
    expect(result.current.status).toBe('no-reader');
  });

  it('transitions to scanning when capture starts', async () => {
    const { result } = renderHook(() => useFingerprintReader());
    await act(async () => {});
    await act(async () => {
      result.current.startCapture();
    });
    expect(result.current.status).toBe('scanning');
  });

  it('reports sdkAvailable false without window.Fingerprint', async () => {
    delete window.Fingerprint;
    const { result } = renderHook(() => useFingerprintReader());
    await act(async () => {});
    expect(result.current.sdkAvailable).toBe(false);
    expect(result.current.status).toBe('no-reader');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `CI=true npx react-scripts test --watchAll=false src/modules/Fingerprint`
Expected: FAIL — cannot resolve `./useFingerprintReader`.

- [ ] **Step 3: Implement the hook**

```js
// src/modules/Fingerprint/hooks/useFingerprintReader.js
import { useCallback, useEffect, useRef, useState } from 'react';

// Same thresholds as src/_FingerPrintReader/api/sdk_mod.js so this page's
// verdicts match what the future enrollment flow will report.
export function qualityFromBrightness(avgBrightness) {
  if (avgBrightness > 200) return 'Good';
  if (avgBrightness > 180) return 'TooLight';
  if (avgBrightness < 50) return 'TooDark';
  return 'LowContrast';
}

export const QUALITY_LABELS = {
  Good: 'Good',
  TooLight: 'Too light',
  TooDark: 'Too dark',
  LowContrast: 'Low contrast',
};

function readableError(err) {
  if (!err) return 'Unknown fingerprint reader error.';
  return err.message || String(err);
}

function computeImageQuality(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let total = 0;
        const pixels = canvas.width * canvas.height;
        for (let i = 0; i < pixels; i++) {
          total += 0.2126 * data[i * 4] + 0.7152 * data[i * 4 + 1] + 0.0722 * data[i * 4 + 2];
        }
        resolve(qualityFromBrightness(total / pixels));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error('Failed to load captured image.'));
    img.src = dataUrl;
  });
}

export default function useFingerprintReader() {
  const sdkAvailable = typeof window !== 'undefined' && Boolean(window.Fingerprint);
  const readerRef = useRef(null);
  const [devices, setDevices] = useState([]);
  const [status, setStatus] = useState('no-reader');
  const [capturedImage, setCapturedImage] = useState(null);
  const [quality, setQuality] = useState(null);
  const [error, setError] = useState('');

  const refreshDevices = useCallback(() => {
    const reader = readerRef.current;
    if (!reader) return;
    reader.enumerateDevices().then(
      (list) => {
        const found = list || [];
        setDevices(found);
        setStatus((prev) =>
          prev === 'scanning' || prev === 'captured'
            ? prev
            : found.length > 0 ? 'ready' : 'no-reader'
        );
      },
      (err) => {
        setError(readableError(err));
        setStatus('error');
      }
    );
  }, []);

  const startCapture = useCallback(() => {
    const reader = readerRef.current;
    if (!reader) return;
    setError('');
    setCapturedImage(null);
    setQuality(null);
    reader.startAcquisition(window.Fingerprint.SampleFormat.PngImage).then(
      () => setStatus('scanning'),
      (err) => {
        setError(readableError(err));
        setStatus('error');
      }
    );
  }, []);

  const stopCapture = useCallback(() => {
    const reader = readerRef.current;
    if (!reader) return;
    reader.stopAcquisition().then(
      () => setStatus((prev) => (prev === 'scanning' ? 'ready' : prev)),
      (err) => {
        setError(readableError(err));
        setStatus('error');
      }
    );
  }, []);

  useEffect(() => {
    if (!sdkAvailable) return undefined;
    const reader = new window.Fingerprint.WebApi();
    readerRef.current = reader;

    reader.onDeviceConnected = () => refreshDevices();
    reader.onDeviceDisconnected = () => refreshDevices();
    reader.onCommunicationFailed = () => {
      setError('Lost communication with the fingerprint service.');
      setStatus('error');
    };
    reader.onSamplesAcquired = (s) => {
      try {
        const samples = JSON.parse(s.samples);
        const src = 'data:image/png;base64,' + window.Fingerprint.b64UrlTo64(samples[0]);
        setCapturedImage(src);
        setStatus('captured');
        reader.stopAcquisition().catch?.(() => {});
        computeImageQuality(src)
          .then(setQuality)
          .catch(() => setQuality(null));
      } catch (err) {
        setError(readableError(err));
        setStatus('error');
      }
    };

    refreshDevices();

    return () => {
      reader.onDeviceConnected = null;
      reader.onDeviceDisconnected = null;
      reader.onCommunicationFailed = null;
      reader.onSamplesAcquired = null;
      const stop = reader.stopAcquisition();
      if (stop && typeof stop.catch === 'function') stop.catch(() => {});
      readerRef.current = null;
    };
  }, [sdkAvailable, refreshDevices]);

  return {
    sdkAvailable,
    devices,
    status,
    capturedImage,
    quality,
    error,
    refreshDevices,
    startCapture,
    stopCapture,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `CI=true npx react-scripts test --watchAll=false src/modules/Fingerprint`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/modules/Fingerprint/hooks/
git commit -m "feat: add useFingerprintReader hook for DigitalPersona SDK"
```

---

### Task 2: `FingerprintTest` view + route

**Files:**
- Create: `src/modules/Fingerprint/views/FingerprintTest.jsx`
- Modify: `src/App.js` (import near line 31; route next to `/scan-rfid` near line 54)
- Test: `src/modules/Fingerprint/views/FingerprintTest.test.jsx`

**Interfaces:**
- Consumes: `useFingerprintReader()` and `QUALITY_LABELS` from `../hooks/useFingerprintReader` (exact shape defined in Task 1).
- Produces: default export `FingerprintTest` React component, routed at `/fingerprint-test`.

- [ ] **Step 1: Write the failing test**

```jsx
// src/modules/Fingerprint/views/FingerprintTest.test.jsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import FingerprintTest from './FingerprintTest';
import useFingerprintReader from '../hooks/useFingerprintReader';

jest.mock('../hooks/useFingerprintReader', () => ({
  __esModule: true,
  default: jest.fn(),
  QUALITY_LABELS: {
    Good: 'Good',
    TooLight: 'Too light',
    TooDark: 'Too dark',
    LowContrast: 'Low contrast',
  },
}));

const baseState = {
  sdkAvailable: true,
  devices: [],
  status: 'no-reader',
  capturedImage: null,
  quality: null,
  error: '',
  refreshDevices: jest.fn(),
  startCapture: jest.fn(),
  stopCapture: jest.fn(),
};

function renderPage(overrides = {}) {
  useFingerprintReader.mockReturnValue({ ...baseState, ...overrides });
  return render(
    <MemoryRouter>
      <FingerprintTest />
    </MemoryRouter>
  );
}

it('shows the no-reader state', () => {
  renderPage();
  expect(screen.getByText(/no reader found/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /start scan/i })).toBeDisabled();
});

it('enables scanning when a reader is connected', () => {
  renderPage({ devices: ['reader-uid-1'], status: 'ready' });
  expect(screen.getByText(/reader connected/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /start scan/i })).toBeEnabled();
});

it('shows the captured image and quality verdict', () => {
  renderPage({
    devices: ['reader-uid-1'],
    status: 'captured',
    capturedImage: 'data:image/png;base64,abc',
    quality: 'Good',
  });
  expect(screen.getByAltText(/captured fingerprint/i)).toBeInTheDocument();
  expect(screen.getByText('Good')).toBeInTheDocument();
});

it('shows a notice when the SDK is missing', () => {
  renderPage({ sdkAvailable: false });
  expect(screen.getByText(/fingerprint sdk not loaded/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `CI=true npx react-scripts test --watchAll=false src/modules/Fingerprint/views`
Expected: FAIL — cannot resolve `./FingerprintTest`.

- [ ] **Step 3: Implement the view**

Standalone full-screen page: brand ambient glows (Loading-screen pattern), centered bordered `Paper` with a gradient header strip, two-column body (reader panel / scan zone), steps strip, back-home link. Complete component:

```jsx
// src/modules/Fingerprint/views/FingerprintTest.jsx
import React from 'react';
import { Box, Button, Chip, Link, Paper, Typography, alpha } from '@mui/material';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import UsbIcon from '@mui/icons-material/Usb';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'motion/react';
import { fadeInUp } from '../../../shared/animations';
import Logo from '../../../assets/Logo.png';
import useFingerprintReader, { QUALITY_LABELS } from '../hooks/useFingerprintReader';

const STEPS = [
  { n: 1, label: 'Connect the reader', hint: 'Plug the DigitalPersona scanner into USB' },
  { n: 2, label: 'Start the scan', hint: 'Press Start scan below' },
  { n: 3, label: 'Place your finger', hint: 'Hold until the image appears' },
];

function ScanZone({ status, capturedImage, error }) {
  if (status === 'captured' && capturedImage) {
    return (
      <Box
        component="img"
        src={capturedImage}
        alt="Captured fingerprint"
        sx={{
          width: 180,
          height: 180,
          objectFit: 'contain',
          borderRadius: 3,
          border: 1,
          borderColor: 'divider',
          bgcolor: '#fff',
        }}
      />
    );
  }
  if (status === 'error') {
    return (
      <Box sx={{ textAlign: 'center', color: 'error.main', px: 2 }}>
        <ErrorOutlineIcon sx={{ fontSize: 44 }} />
        <Typography variant="body2" sx={{ mt: 1 }}>{error}</Typography>
      </Box>
    );
  }
  return (
    <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {status === 'scanning' && (
        <Box
          component={motion.div}
          animate={{ scale: [1, 1.35], opacity: [0.5, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
          sx={{
            position: 'absolute',
            width: 150,
            height: 150,
            borderRadius: '50%',
            border: 2,
            borderColor: 'primary.main',
          }}
        />
      )}
      <Box
        component={motion.div}
        animate={status === 'scanning' ? { opacity: [1, 0.45, 1] } : { opacity: 1 }}
        transition={{ duration: 1.6, repeat: status === 'scanning' ? Infinity : 0, ease: 'easeInOut' }}
        sx={{ display: 'flex' }}
      >
        <FingerprintIcon sx={{ fontSize: 110, color: status === 'scanning' ? 'primary.main' : 'text.secondary' }} />
      </Box>
    </Box>
  );
}

export default function FingerprintTest() {
  const {
    sdkAvailable, devices, status, capturedImage, quality, error,
    refreshDevices, startCapture, stopCapture,
  } = useFingerprintReader();

  const readerFound = devices.length > 0;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, sm: 4 },
      }}
    >
      <Box sx={{ position: 'absolute', width: 480, height: 480, borderRadius: '50%', top: -160, right: -140, pointerEvents: 'none', background: (t) => `radial-gradient(circle, ${alpha(t.palette.primary.main, 0.14)} 0%, transparent 70%)` }} />
      <Box sx={{ position: 'absolute', width: 420, height: 420, borderRadius: '50%', bottom: -140, left: -100, pointerEvents: 'none', background: (t) => `radial-gradient(circle, ${alpha(t.palette.secondary.main, 0.12)} 0%, transparent 70%)` }} />

      <Paper
        component={motion.div}
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        elevation={0}
        sx={{ width: '100%', maxWidth: 760, border: 1, borderColor: 'divider', overflow: 'hidden', position: 'relative' }}
      >
        <Box sx={{ px: 3, py: 2.5, color: '#fff', background: 'linear-gradient(160deg, #0F172A 0%, #1E3A8A 60%, #2563EB 100%)', display: 'flex', alignItems: 'center', gap: 2 }}>
          <FingerprintIcon />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6">Fingerprint Scanner Test</Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.72)' }}>
              Verify the reader is detected and captures a usable print
            </Typography>
          </Box>
          <Box component="img" src={Logo} alt="APBS" sx={{ height: 34, bgcolor: '#fff', borderRadius: 1, px: 0.75, py: 0.25 }} />
        </Box>

        {!sdkAvailable ? (
          <Box sx={{ p: 5, textAlign: 'center' }}>
            <ErrorOutlineIcon sx={{ fontSize: 44, color: 'error.main' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 1 }}>Fingerprint SDK not loaded</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              fingerprint.sdk.min.js is missing from the page. Check public/index.html.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
            <Box sx={{ flex: 1, p: 3, borderRight: { sm: 1 }, borderBottom: { xs: 1, sm: 0 }, borderColor: { xs: 'divider', sm: 'divider' } }}>
              <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: '0.08em' }}>Reader</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <UsbIcon fontSize="small" sx={{ color: readerFound ? 'success.main' : 'text.disabled' }} />
                <Chip
                  size="small"
                  label={readerFound ? 'Reader connected' : 'No reader found'}
                  color={readerFound ? 'success' : 'error'}
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              </Box>
              {readerFound && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, wordBreak: 'break-all' }}>
                  {devices[0]}
                </Typography>
              )}
              {!readerFound && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Connect the scanner, then refresh.
                </Typography>
              )}
              <Button size="small" variant="outlined" startIcon={<RefreshIcon />} onClick={refreshDevices} sx={{ mt: 2 }}>
                Refresh devices
              </Button>
            </Box>

            <Box sx={{ flex: 1.4, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box sx={{ width: 220, height: 220, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed', borderColor: status === 'scanning' ? 'primary.main' : 'divider', bgcolor: (t) => alpha(t.palette.primary.main, status === 'scanning' ? 0.05 : 0.02) }}>
                <ScanZone status={status} capturedImage={capturedImage} error={error} />
              </Box>
              {status === 'captured' && quality && (
                <Chip
                  size="small"
                  label={QUALITY_LABELS[quality] || quality}
                  color={quality === 'Good' ? 'success' : 'warning'}
                  sx={{ mt: 2, fontWeight: 600 }}
                />
              )}
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, minHeight: 20 }}>
                {status === 'scanning' && 'Place your finger on the sensor…'}
                {status === 'ready' && 'Reader ready. Start a scan to test capture.'}
                {status === 'no-reader' && 'Waiting for a reader…'}
                {status === 'captured' && 'Capture complete.'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, mt: 2 }}>
                {status === 'scanning' ? (
                  <Button variant="outlined" onClick={stopCapture}>Stop</Button>
                ) : (
                  <Button variant="contained" onClick={startCapture} disabled={!readerFound}>
                    {status === 'captured' || status === 'error' ? 'Scan again' : 'Start scan'}
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        )}

        <Box sx={{ display: 'flex', borderTop: 1, borderColor: 'divider', bgcolor: (t) => alpha(t.palette.primary.main, 0.03) }}>
          {STEPS.map((step) => (
            <Box key={step.n} sx={{ flex: 1, px: 2, py: 1.5, display: 'flex', gap: 1.25, alignItems: 'flex-start' }}>
              <Box sx={{ width: 20, height: 20, borderRadius: '50%', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.main', bgcolor: (t) => alpha(t.palette.primary.main, 0.1), flexShrink: 0, mt: 0.25 }}>
                {step.n}
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>{step.label}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' } }}>{step.hint}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Paper>

      <Link component={RouterLink} to="/" underline="hover" sx={{ mt: 3, display: 'inline-flex', alignItems: 'center', gap: 0.5, fontSize: 14 }}>
        <ArrowBackIcon fontSize="small" /> Back to home
      </Link>
    </Box>
  );
}
```

- [ ] **Step 4: Add the route in `src/App.js`**

Next to the existing Rfid imports (line ~31):

```js
import FingerprintTest from './modules/Fingerprint/views/FingerprintTest';
```

Next to the `/register-rfid` route (line ~54):

```jsx
<Route path="/fingerprint-test" element={<FingerprintTest />} />
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `CI=true npx react-scripts test --watchAll=false src/modules/Fingerprint`
Expected: PASS (Task 1's 5 tests + these 4).

- [ ] **Step 6: Commit**

```bash
git add src/modules/Fingerprint/views/ src/App.js
git commit -m "feat: add /fingerprint-test scanner diagnostic page"
```

---

### Task 3: Verification in the running app

**Files:** none created; observation only.

**Interfaces:**
- Consumes: the dev server already running on port 3000 (the user's own — do not start a second one).

- [ ] **Step 1: Lint the new module**

Run: `npx eslint src/modules/Fingerprint/`
Expected: no errors (warnings acceptable only if pre-existing patterns).

- [ ] **Step 2: Confirm the page compiled into the served bundle**

Run: `curl -s http://localhost:3000/static/js/bundle.js | grep -c "Fingerprint Scanner Test"`
Expected: `1` or more (CRA only serves a fresh bundle after a successful compile).

- [ ] **Step 3: Report**

Tell the user the page is live at `http://localhost:3000/fingerprint-test`, what the no-reader state looks like, and that a physical DigitalPersona reader is needed to exercise scan capture.
