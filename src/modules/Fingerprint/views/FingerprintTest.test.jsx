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
