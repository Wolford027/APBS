import { renderHook, act, waitFor } from '@testing-library/react';
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
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.sdkAvailable).toBe(true);
    expect(result.current.devices).toEqual(['reader-uid-1']);
  });

  it('reports no-reader when enumeration is empty', async () => {
    mockDevices = [];
    const { result } = renderHook(() => useFingerprintReader());
    await waitFor(() => expect(result.current.status).toBe('no-reader'));
    expect(result.current.devices).toEqual([]);
  });

  it('transitions to scanning when capture starts', async () => {
    const { result } = renderHook(() => useFingerprintReader());
    await waitFor(() => expect(result.current.status).toBe('ready'));
    act(() => {
      result.current.startCapture();
    });
    await waitFor(() => expect(result.current.status).toBe('scanning'));
  });

  it('reports sdkAvailable false without window.Fingerprint', () => {
    delete window.Fingerprint;
    const { result } = renderHook(() => useFingerprintReader());
    expect(result.current.sdkAvailable).toBe(false);
    expect(result.current.status).toBe('no-reader');
  });
});
