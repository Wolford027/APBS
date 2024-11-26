import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, Grid } from '@mui/material';
import axios from 'axios';
import './app.css';
import { FingerprintSdk } from '../_FingerPrintReader/api/sdk_mod';

const App = () => {
  const [deviceId, setDeviceId] = useState('');
  const [fingerprint, setFingerprint] = useState(null);
  const [fingerprintTemplates, setFingerprintTemplates] = useState([]);
  const [imageQuality, setImageQuality] = useState(null);
  const [empId, setEmpId] = useState("");

  const StartCapturing = (FingerprintInstance) => {
    FingerprintInstance.startCapture();
  }

  const StopCapturing = (FingerprintInstance) => {
    console.log("The scanner has stopped capturing.");
    fingerprint?.stopCapture();
  }

  const GenerateTemplate = async (employeeId) => {
    if (fingerprint?.generateTemplate) {
      try {
        const imageSrc = localStorage.getItem("imageSrc");
        if (!imageSrc) {
          console.log("No image source found. Please scan your fingerprint.");
          return;
        }
  
        // Generate the template
        const template = await fingerprint.generateTemplate(imageSrc);
        const minutiaePoints = template?.minutiaePoints || [];
        const imageQuality = localStorage.getItem("imageQuality"); // Assuming quality is saved
  
        // Prepare the FMD structure
        const fmd = {
          minutiaePoints: minutiaePoints, // Extracted minutiae
          quality: imageQuality, // Quality of the fingerprint image
          otherMetadata: {
            timestamp: new Date().toISOString(),
            empId: employeeId,
          },
        };

        console.log(fmd)
  
        // Send FMD to the backend
        await axios.post('http://localhost:8800/finger-print', {
          emp_id: employeeId,
          fingerprint_template: JSON.stringify(fmd), // Send the full FMD as JSON
        });
  
      } catch (error) {
        console.log("Error generating template:", error);
      }
    }
  };

  useEffect(() => {
    const FingerprintInstance = new FingerprintSdk();
    setFingerprint(FingerprintInstance);

    FingerprintInstance.getDeviceList().then(
      (devices) => {
        if (devices[0]) {
          console.log("Device Connected:", devices[0]);
          setDeviceId(devices[0]);
          StartCapturing(FingerprintInstance);
        } else {
          console.log("No Fingerprint Scanner found.");
        }
      },
      (error) => console.error("Error fetching the Scanner.", error)
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
              Fingerprint Reader
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
              <Button variant="contained" color="primary" onClick={() => GenerateTemplate(empId)}>
                Generate Template
              </Button>
              <Button variant="contained" color="error" onClick={StopCapturing}>
                Stop Capture
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default App;
