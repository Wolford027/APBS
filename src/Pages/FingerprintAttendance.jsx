import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, Grid } from '@mui/material';
import axios from 'axios';
import './app.css';
import { FingerprintSdk } from '../_FingerPrintReader/api/sdk_mod';

const App = () => {
  const [deviceId, setDeviceId] = useState('');
  const [fingerprint, setFingerprint] = useState(null);
  const [fingerprintTemplates, setFingerprintTemplates] = useState([]); // Pool of FMDs
  const [imageQuality, setImageQuality] = useState(null);
  const [empId, setEmpId] = useState('');
  const [enrollmentCompleted, setEnrollmentCompleted] = useState(false);

  const MIN_FMD_COUNT = 3; // Minimum number of FMDs for enrollment

  const StartCapturing = (FingerprintInstance) => {
    FingerprintInstance.startCapture();
  };

  const StopCapturing = (FingerprintInstance) => {
    console.log("The scanner has stopped capturing.");
    fingerprint?.stopCapture();
  };

  const CaptureAndGenerateFMD = async () => {
    try {
      const imageSrc = localStorage.getItem('imageSrc');
      if (!imageSrc) {
        console.log('No image source found. Please scan your fingerprint.');
        return;
      }

      // Generate the FMD from the scanned fingerprint
      const template = await fingerprint.generateTemplate(imageSrc);
      const minutiaePoints = template?.minutiaePoints || [];
      const imageQuality = localStorage.getItem('imageQuality'); // Assuming quality is saved

      if (minutiaePoints.length === 0) {
        console.log('No minutiae detected. Please try again.');
        return;
      }

      // Create an FMD
      const fmd = {
        minutiaePoints,
        quality: imageQuality,
        timestamp: new Date().toISOString(),
      };

      // Add the FMD to the pool
      setFingerprintTemplates((prev) => [...prev, fmd]);
      console.log('FMD added:', fmd);

      // Check if enrollment is complete
      if (fingerprintTemplates.length + 1 >= MIN_FMD_COUNT) {
        CompleteEnrollment();
      }
    } catch (error) {
      console.log('Error generating FMD:', error);
    }
  };

  const CompleteEnrollment = async () => {
    try {
      // Select the best FMD based on quality
      const bestFMD = fingerprintTemplates.reduce((best, current) =>
        current.quality > best.quality ? current : best
      );

      console.log('Best FMD selected for enrollment:', bestFMD);

      // Send the best FMD to the backend for enrollment
      await axios.post('http://localhost:8800/finger-enrollment', {
        emp_id: empId,
        fingerprint_template: JSON.stringify(bestFMD),
      });

      setEnrollmentCompleted(true);
      console.log('Enrollment completed successfully.');
    } catch (error) {
      console.log('Error completing enrollment:', error);
    }
  };

  useEffect(() => {
    const FingerprintInstance = new FingerprintSdk();
    setFingerprint(FingerprintInstance);

    FingerprintInstance.getDeviceList().then(
      (devices) => {
        if (devices[0]) {
          console.log('Device Connected:', devices[0]);
          setDeviceId(devices[0]);
          StartCapturing(FingerprintInstance);
        } else {
          console.log('No Fingerprint Scanner found.');
        }
      },
      (error) => console.error('Error fetching the Scanner.', error)
    );
  }, []);

  const connected = deviceId ? `Connected to ${deviceId}` : 'No Device is connected';

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f4f6f8',
      }}
    >
      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={12} sm={8} md={6} lg={4}>
          <Paper elevation={3} sx={{ padding: 4, textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom>
              Fingerprint Enrollment
            </Typography>
            <Typography variant="subtitle1" sx={{ marginBottom: 2 }}>
              {connected}
            </Typography>
            <Box sx={{ marginBottom: 2 }}>
              <Typography variant="subtitle2">Enter Employee ID:</Typography>
              <input
                type="text"
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
                placeholder="Employee ID"
              />
            </Box>
            {imageQuality !== null && (
              <Typography variant="body1" sx={{ marginBottom: 2 }}>
                Image Quality: {imageQuality.toFixed(2)} (Higher is better)
              </Typography>
            )}
            <Box
              id="imagediv"
              sx={{
                border: '1px solid #ccc',
                borderRadius: '4px',
                marginTop: 2,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 2 }}>
              {!enrollmentCompleted ? (
                <>
                  <Button variant="contained" color="primary" onClick={CaptureAndGenerateFMD}>
                    Capture Fingerprint
                  </Button>
                  <Button variant="contained" color="error" onClick={StopCapturing}>
                    Stop Capture
                  </Button>
                </>
              ) : (
                <Typography variant="h6" color="success.main">
                  Enrollment Completed!
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default App;
