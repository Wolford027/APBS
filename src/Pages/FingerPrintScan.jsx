import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Button, Typography, Paper, Grid } from '@mui/material';
import { FingerprintSdk } from '../_FingerPrintReader/api/sdk_mod';

const FingerprintMatch = () => {
  const [deviceId, setDeviceId] = useState('');
  const [fingerprintImage, setFingerprintImage] = useState(null);
  const [Fingerprint, setFingerprintSdk] = useState(null);
  const [isMatching, setIsMatching] = useState(false);
  const [userData, setUserData] = useState(null); // Matched user data

  // Initialize the Fingerprint SDK on component mount
  useEffect(() => {
    const sdk = new FingerprintSdk();
    setFingerprintSdk(sdk);

    sdk.getDeviceList().then((devices) => {
      if (devices.length > 0) {
        setDeviceId(devices[0]);
        sdk.startCapture(); // Start capturing when a device is found

        // Capture fingerprint and set image
        sdk.onCapture((image) => {
          setFingerprintImage(image); // Set the captured fingerprint image
        });
      }
    }).catch((error) => console.log(error));

    return () => {
      if (Fingerprint) {
        Fingerprint.stopCapture(); // Stop capturing on component unmount
      }
    };
  }, []);
  

  const matchFingerprint = async () => {
    if (fingerprintImage) {
        try {
            // Generate a fingerprint template from the image
            const fingerprintTemplate = await Fingerprint.generateTemplate(fingerprintImage);
            
            // Ensure the template is correctly generated
            if (!fingerprintTemplate) {
                alert('Failed to generate fingerprint template');
                return;
            }
  
            // Send the fingerprint template to the backend for matching
            const response = await axios.post('http://localhost:8800/match-fingerprint', {
                fingerprint_template: fingerprintTemplate, // Send the template
            });
  
            console.log('Backend Response:', response.data); // Log the backend response
  
            // Check if matching was successful and handle user data
            if (response.data.success) {
                setIsMatching(true);
                setUserData(response.data.employee || {}); // Assuming the response contains employee data
                alert('Fingerprint matched successfully!');
            } else {
                setIsMatching(false);
                setUserData(null); // Reset user data on no match
                alert('Fingerprint did not match.');
            }
        } catch (error) {
            console.error('Error matching fingerprint:', error);
            alert('Failed to match fingerprint. Please try again.');
        }
    } else {
        alert('No fingerprint image to match');
    }
};

  

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
              Fingerprint Matcher
            </Typography>
            <Typography variant="subtitle1" sx={{ marginBottom: 2 }}>
              {deviceId ? `Connected to ${deviceId}` : 'No Device is connected'}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, marginBottom: 2 }}>
              <Button variant="contained" color="primary" onClick={matchFingerprint}>
                Match Fingerprint
              </Button>
            </Box>
            <Box
              id="imagediv"
              sx={{
                border: '1px solid #ccc',
                borderRadius: '4px',
                marginTop: 2,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '200px',
              }}
            >
              {fingerprintImage && (
                <img
                  src={fingerprintImage}
                  alt="Fingerprint"
                  style={{ maxHeight: '100%', maxWidth: '100%', height: '200px', width: 'auto' }}
                />
              )}
            </Box>
            {isMatching && userData && (
              <Box sx={{ marginTop: 2 }}>
                <Typography variant="h6">User Data:</Typography>
                <Typography>Name: {userData.name}</Typography> {/* Adjust according to your user data structure */}
                <Typography>Email: {userData.email}</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FingerprintMatch;