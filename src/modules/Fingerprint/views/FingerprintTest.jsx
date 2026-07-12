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
            <Box sx={{ flex: 1, p: 3, borderRight: { sm: 1 }, borderBottom: { xs: 1, sm: 0 }, borderColor: 'divider' }}>
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
