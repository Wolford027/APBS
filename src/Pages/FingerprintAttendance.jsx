import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, Grid } from '@mui/material';
import { FingerprintSdk } from '../_FingerPrintReader/api/sdk_mod';
import './app.css';
import axios from 'axios';

const App = () => {
  const [deviceId, setDeviceId] = useState('');
  const [fingerprint, setFingerprint] = useState(null);
  const [fingerprintTemplate, setFingerprintTemplate] = useState(null);

  useEffect(() => {
    const fingerprintInstance = new FingerprintSdk();
    setFingerprint(fingerprintInstance);

    fingerprintInstance.getDeviceList().then(
      (devices) => {
        setDeviceId(devices[0]);
        if (devices[0]) {
          // Automatically start the capture after device is connected
          startCapturing(fingerprintInstance);
        }
      },
      (error) => console.log(error)
    );

    // Cleanup function to stop capturing if the component unmounts
    return () => {
      fingerprintInstance.stopCapture();
    };
  }, []);

  const clearImage = () => {
    const vDiv = document.getElementById('imagediv');
    vDiv.innerHTML = '';
    localStorage.setItem('imageSrc', '');
    setFingerprintTemplate(null); // Clear the template as well
  };

  const startCapturing = (fingerprintInstance) => {
    fingerprintInstance.startCapture();
  };

  const stopCapturing = () => {
    if (fingerprint) {
      fingerprint.stopCapture();
    } else {
      console.warn('Fingerprint instance is not available.');
    }
  };

  const getInfo = () => {
    fingerprint.getDeviceList().then(
      (devices) => setDeviceId(devices[0]),
      (error) => console.log(error)
    );
  };

  const onImageSave = async () => {
    const imageSrc = localStorage.getItem('imageSrc');

    if (!imageSrc || document.getElementById('imagediv').innerHTML === '') {
        alert('No fingerprint image to save');
        return;
    }

    try {
        // Generate the fingerprint template from the image source
        const template = await fingerprint.generateTemplate(imageSrc);
        console.log('Generated Template:', template); // Log the generated template

        if (!template) {
            alert('Failed to generate fingerprint template');
            return;
        }

        // Stringify the template to prepare it for sending
        const templateString = JSON.stringify(template);

        // Create a Blob from the template string
        const blob = new Blob([templateString], { type: 'application/json' });

        // Prepare FormData to send the fingerprint template
        const formData = new FormData();
        formData.append('fingerprint_template', blob, 'fingerprint_template.json');

        // Send the template to the backend
        const res = await axios.post('http://localhost:8800/finger-print', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        alert(res.data.message);
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
            <Button
              variant="contained"
              color="secondary"
              onClick={onImageSave}
              sx={{ marginBottom: 2 }}
            >
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
            >
              {/* The captured fingerprint image will appear here */}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default App;
