import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, Grid } from '@mui/material';
import { FingerprintSdk } from '../_FingerPrintReader/api/sdk_mod';
import './app.css';
import axios from 'axios';

const App = () => {
  const [deviceId, setDeviceId] = useState('');
  const [fingerprint, setFingerprint] = useState(null);
  const [fingerprintTemplates, setFingerprintTemplates] = useState([]);

  useEffect(() => {
    const fingerprintInstance = new FingerprintSdk();
    setFingerprint(fingerprintInstance);

    fingerprintInstance.getDeviceList().then(
      (devices) => {
        if (devices[0]) {
          setDeviceId(devices[0]);
          startCapturing(fingerprintInstance);
        }
      },
      (error) => console.log('Error fetching device list:', error)
    );

    return () => fingerprintInstance.stopCapture();
  }, []);

  const clearImage = () => {
    const vDiv = document.getElementById('imagediv');
    vDiv.innerHTML = '';
    localStorage.removeItem('imageSrc');
    setFingerprintTemplates([]);
  };

  const startCapturing = (fingerprintInstance) => {
    fingerprintInstance.startCapture();
  };

  const stopCapturing = () => {
    fingerprint?.stopCapture();
  };

  const onImageSave = async () => {
    const imageSrc = localStorage.getItem('imageSrc');
    if (!imageSrc || document.getElementById('imagediv').innerHTML === '') {
      alert('No fingerprint image to save');
      return;
    }
  
    try {
      const template = await fingerprint.generateTemplate(imageSrc);
  
      if (!template) {
        alert('Failed to generate fingerprint template');
        return;
      }
  
      if (fingerprintTemplates.length < 2) {
        setFingerprintTemplates((prev) => [...prev, template]);
      }
  
      if (fingerprintTemplates.length + 1 === 2) {
        // Ensure that templates are properly prepared as a JSON string
        const templatesToSave = JSON.stringify([...fingerprintTemplates, template]);
  
        // Validate JSON formatting
        if (!templatesToSave) {
          alert('Error preparing fingerprint templates for saving.');
          return;
        }
  
        const formData = new FormData();
        formData.append('emp_id', '1');
        formData.append('fingerprints', templatesToSave);
  
        const res = await axios.post('http://localhost:8800/finger-print', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
  
        alert(res.data.message);
        clearImage();
      } else {
        alert('Please scan the second fingerprint');
      }
    } catch (error) {
      console.error('Error saving fingerprint:', error);
      alert('Error saving fingerprint: ' + (error.response?.data?.message || error.message));
    }
  };
  

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
              Fingerprint Reader
            </Typography>
            <Typography variant="subtitle1" sx={{ marginBottom: 2 }}>
              {connected}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, marginBottom: 2 }}>
              <Button variant="contained" color="primary" onClick={clearImage}>
                Delete Fingerprint
              </Button>
              <Button variant="contained" color="error" onClick={stopCapturing}>
                Stop Capture
              </Button>
            </Box>
            <Button variant="contained" color="secondary" onClick={onImageSave} sx={{ marginBottom: 2 }}>
              Save Template
            </Button>
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
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default App;
