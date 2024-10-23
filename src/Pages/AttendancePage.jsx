import React, { useState } from 'react';
import { Avatar, Box, Paper, Grid, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { useDialogs } from '@toolpad/core';

export default function AttendancePage() {
  const [attendanceData, setAttendanceData] = useState({
    f_name: '',
    l_name: '',
    m_name: '',
    emp_id: '',
    image: '' // Ensure image is included in the state
  });
  const [rfidId, setRfidId] = useState('');
  const dialogs = useDialogs();

  const fetchScanData = async (rfid) => {
    try {
      const response = await axios.get(`http://localhost:8800/scan/${rfid}`);
      if (response.status === 200 && response.data) {
        setAttendanceData(response.data); // This will now include the image URL
        setRfidId('');
      } else {
        setAttendanceData({
          f_name: '',
          l_name: '',
          m_name: '',
          emp_id: '',
          image: '', // Reset the image
        });
        showErrorDialog();
        setRfidId('');
      }
    } catch (error) {
      console.error('Error scanning attendance data:', error);
      setAttendanceData({
        f_name: '',
        l_name: '',
        m_name: '',
        emp_id: '',
        image: '', // Reset the image
      });
      showErrorDialog();
      setRfidId('');
    }
  };

  const showErrorDialog = () => {
    const options = {
      title: 'Error Occurred',
    };
    dialogs.alert('The scanned RFID is unregistered or not found in the database.', options);
  };

  const handleRfidInputChange = (event) => {
    const rfid = event.target.value;
    setRfidId(rfid);

    if (rfid.length === 10) {
      fetchScanData(rfid);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={12} sm={8} md={6} lg={4}>
          <Paper
            elevation={3}
            sx={{
              padding: 5,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              height: '80vh',
            }}
          >
            <Avatar
              sx={{
                width: '150px',
                height: '150px',
              }}
              src={attendanceData.image || ''} // Use the image URL from attendanceData
            />
            <Typography sx={{ marginTop: 10 }}>
              {attendanceData.f_name + " " + attendanceData.m_name + " " + attendanceData.l_name || 'Employee Name'}
            </Typography>
            <Typography>{attendanceData.emp_id || 'Employee Id'}</Typography>
            <TextField
              label="RFID Id No."
              autoFocus
              value={rfidId}
              onChange={handleRfidInputChange}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
