import React, { useState } from 'react'
import { Avatar, Box, Paper, Grid, TextField, Typography } from '@mui/material'
import axios from 'axios'
import { useDialogs } from '@toolpad/core'

export default function AttendancePage() {
  const [attendanceData, setAttendanceData] = useState({
    f_name: '',
    l_name: '',
    m_name: '',
    emp_id: '',
    image: ''
  });
  const [rfidId, setRfidId] = useState('');
  const dialogs = useDialogs();

  const fetchScanData = async (rfid) => {
    try {
      const response = await axios.get(`http://localhost:8800/scan/${rfid}`);
      if (response.status === 200 && response.data) {
        setAttendanceData(response.data);
  
        // Format the current time in 24-hour military format
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const formattedTime = `${hours}:${minutes}`;
  
        // Send time-in or time-out data to the server
        const timeInResponse = await axios.post('http://localhost:8800/time-in', {
          emp_id: response.data.emp_id,
          time_in: formattedTime, // Used for both time-in and time-out
        });
  
        if (timeInResponse.status === 200) {
          const message = timeInResponse.data.message;
          if (message.includes('Time-out')) {
            dialogs.alert('Time-out recorded successfully.', { title: 'Time-Out' });
          } else {
            dialogs.alert('Time-in recorded successfully.', { title: 'Time-In' });
          }
        }
      }
  
      setRfidId('');
    } catch (error) {
      if (error.response && error.response.status === 500) {
        dialogs.alert('You must wait at least 1 hour before clocking out.', { title: 'Time-Out Error' });
      } else {
        console.error('Error scanning attendance data:', error);
        showErrorDialog();
      }
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

  const showAlreadyScannedDialog = () => {
    const options = {
      title: 'RFID Already Scanned',
    };
    dialogs.alert('This RFID has already been scanned today.', options);
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
              src={attendanceData.image || ''}
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
