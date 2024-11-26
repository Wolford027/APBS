import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, Grid, CircularProgress } from '@mui/material';
import axios from 'axios';
import { FingerprintSdk } from '../_FingerPrintReader/api/sdk_mod';

const App = () => {
  const [deviceId, setDeviceId] = useState('');
  const [fingerprint, setFingerprint] = useState(null);
  const [imageQuality, setImageQuality] = useState(null);
  const [empId, setEmpId] = useState('');
  const [loading, setLoading] = useState(false);
  const [employeeData, setEmployeeData] = useState(null);
  const [error, setError] = useState('');

  const StartCapturing = (FingerprintInstance) => {
    FingerprintInstance.startCapture();
  };

  const StopCapturing = () => {
    if (fingerprint) {
      fingerprint.stopCapture();
    }
  };

  const FetchEmployeeData = async (template) => {
    setLoading(true);
    setError('');
    setEmployeeData(null);

    try {
      const response = await axios.post('http://localhost:8800/identify-fingerprint', {
        fingerprint_template: JSON.stringify(template), // Debug the format
      });      
      if (response.data.success) {
        setEmployeeData(response.data.employee);
      } else {
        setError('No matching fingerprint found.');
      }
    } catch (error) {
      console.error('Error fetching employee data:', error);
      setError('Error matching fingerprint.');
    } finally {
      setLoading(false);
    }
  };

  const GenerateTemplate = async () => {
    if (!fingerprint || !empId) {
      setError('Scanner not initialized or Employee ID missing.');
      return;
    }

    try {
      const imageSrc = localStorage.getItem('imageSrc');
      if (!imageSrc) {
        setError('No fingerprint scanned. Please try again.');
        return;
      }

      const template = await fingerprint.generateTemplate(imageSrc);
      FetchEmployeeData(template);
    } catch (error) {
      console.error('Error generating template:', error);
      setError('Failed to generate fingerprint template.');
    }
  };

  useEffect(() => {
    const FingerprintInstance = new FingerprintSdk();
    setFingerprint(FingerprintInstance);

    FingerprintInstance.getDeviceList().then(
      (devices) => {
        if (devices[0]) {
          setDeviceId(devices[0]);
          StartCapturing(FingerprintInstance);
        } else {
          console.error('No Fingerprint Scanner found.');
        }
      },
      (error) => console.error('Error fetching the Scanner:', error)
    );

    return () => StopCapturing(); // Cleanup on component unmount
  }, []);

  const connected = deviceId ? `Connected to ${deviceId}` : 'No Device is connected';

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f6f8' }}>
      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={12} sm={8} md={6} lg={4}>
          <Paper elevation={3} sx={{ padding: 4, textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom>Fingerprint Reader</Typography>
            <Typography variant="subtitle1" sx={{ marginBottom: 2 }}>{connected}</Typography>
            <Box sx={{ marginBottom: 2 }}>
              <Typography variant="subtitle2">Enter Employee ID:</Typography>
              <input
                type="text"
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
                placeholder="Employee ID"
              />
            </Box>
            {imageQuality && (
              <Typography variant="body1" sx={{ marginBottom: 2 }}>
                Image Quality: {imageQuality} (Higher is better)
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
            {loading ? (
              <CircularProgress sx={{ marginTop: 2 }} />
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 2 }}>
                <Button variant="contained" color="primary" onClick={GenerateTemplate}>Scan & Fetch</Button>
                <Button variant="contained" color="error" onClick={StopCapturing}>Stop Capture</Button>
              </Box>
            )}
            {employeeData && (
              <Box sx={{ marginTop: 2, textAlign: 'left' }}>
                <Typography variant="h6">Employee Details:</Typography>
                <Typography variant="body1">ID: {employeeData.emp_id}</Typography>
                <Typography variant="body1">Name: {employeeData.name}</Typography>
                {/* Add more details as needed */}
              </Box>
            )}
            {error && <Typography color="error" sx={{ marginTop: 2 }}>{error}</Typography>}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default App;
