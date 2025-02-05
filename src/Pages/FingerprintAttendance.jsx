import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, Grid, TextField } from '@mui/material';
import axios from 'axios';
import { FingerprintSdk } from '../_FingerPrintReader/api/sdk_mod';

const FingerprintSystem = () => {
  const [deviceId, setDeviceId] = useState('');
  const [fingerprint, setFingerprint] = useState(null);
  const [fingerprintImage, setFingerprintImage] = useState(null);
  const [fingerprintTemplates, setFingerprintTemplates] = useState([]);
  const [empId, setEmpId] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const MIN_FMD_COUNT = 4;

  useEffect(() => {
    const FingerprintInstance = new FingerprintSdk();
    setFingerprint(FingerprintInstance);

    FingerprintInstance.getDeviceList().then((devices) => {
      if (devices[0]) {
        setDeviceId(devices[0]);
        StartCapturing(FingerprintInstance);
      }
    });
  }, []);

  const StartCapturing = (FingerprintInstance) => {
    FingerprintInstance.startCapture();

    // Assuming getFingerprintImage() fetches the fingerprint image
    FingerprintInstance.getFingerprintImage().then((imageData) => {
      if (imageData) {
        localStorage.setItem('imageSrc', imageData); // Save image in local storage
        setFingerprintImage(imageData); // Update state to display the image
      }
    });
  };

  const StopCapturing = () => {
    fingerprint?.stopCapture();
  };

  const CaptureAndGenerateFMD = async () => {
    try {
      const imageSrc = localStorage.getItem('imageSrc');
      if (!imageSrc) return;

      const template = await fingerprint.generateTemplate(imageSrc);
      const fmd = { minutiaePoints: template?.minutiaePoints };

      if (fmd.minutiaePoints.length === 0) return;

      setFingerprintTemplates((prev) => [...prev, fmd]);
      if (fingerprintTemplates.length + 1 >= MIN_FMD_COUNT) CompleteEnrollment();
    } catch (error) {
      console.log('Error generating FMD:', error);
    }
  };

  const CompleteEnrollment = async () => {
    try {
      const bestFMD = fingerprintTemplates.reduce((best, current) => (current.quality > best.quality ? current : best));
      await axios.post('http://localhost:8800/finger-enrollment', { emp_id: empId, fingerprint_template: JSON.stringify(bestFMD) });
      alert('Enrollment Successful!');
    } catch (error) {
      console.log('Error completing enrollment:', error);
    }
  };

  const AuthenticateFingerprint = async () => {
    try {
      const imageSrc = localStorage.getItem('imageSrc');
      if (!imageSrc) return;

      const template = await fingerprint.generateTemplate(imageSrc);
      const response = await axios.post('http://localhost:8800/finger-authenticate', {
        fingerprint_template: JSON.stringify(template),
      });

      if (response.data.success) {
        setAuthenticated(true);
        alert('Authentication Successful!');
      } else {
        alert('Fingerprint not recognized.');
      }
    } catch (error) {
      console.log('Error authenticating fingerprint:', error);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f6f8' }}>
      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={12} sm={8} md={6} lg={4}>
          <Paper elevation={3} sx={{ padding: 4, textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom>Fingerprint System</Typography>
            <Typography variant="subtitle1">{deviceId ? `Connected to ${deviceId}` : 'No Device is connected'}</Typography>
            <TextField fullWidth label="Employee ID" value={empId} onChange={(e) => setEmpId(e.target.value)} margin="normal" />
            
            {fingerprintImage && (
              <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
                <img src={`data:image/png;base64,${fingerprintImage}`} alt="Fingerprint Scan" width="200" height="200" />
              </Box>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 2 }}>
              <Button variant="contained" color="primary" onClick={CaptureAndGenerateFMD}>Capture</Button>
              <Button variant="contained" color="secondary" onClick={AuthenticateFingerprint}>Authenticate</Button>
              <Button variant="contained" color="error" onClick={StopCapturing}>Stop</Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FingerprintSystem;
