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
        const stop = reader.stopAcquisition();
        if (stop && typeof stop.catch === 'function') stop.catch(() => {});
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
