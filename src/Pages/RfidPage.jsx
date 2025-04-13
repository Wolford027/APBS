import React, { useState, useEffect, useRef } from 'react';
import { Avatar, Box, Paper, Grid, TextField } from '@mui/material';
import axios from 'axios';
import { useDialogs } from '@toolpad/core';

export default function RfidPage() {
  const [attendanceData, setAttendanceData] = useState({
    f_name: '',
    l_name: '',
    m_name: '',
    emp_id: '',
    image: ''
  });
  const [rfidId, setRfidId] = useState('');
  const dialogs = useDialogs();
  const rfidInputRef = useRef(null);

  useEffect(() => {
    // Focus on the TextField only on component mount or after an error
    if (rfidInputRef.current) {
      rfidInputRef.current.focus();
    }
  }, []);

  const fetchScanData = async (rfid) => {
    try {
      const response = await axios.get(`http://localhost:8800/scan/${rfid}`);
      if (response.status === 200 && response.data) {
        setAttendanceData(response.data);
        setRfidId('');
  
        const now = new Date();
        const FormattedTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const FormattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const timeStamp = `${FormattedDate} ${FormattedTime}`;
  
        const SaveResponse = await axios.post('http://localhost:8800/attendance-time-in', {
          emp_id: response.data.emp_id,
          time: timeStamp,
          date: FormattedDate,
        });
  
        if (SaveResponse.status === 200) {
          dialogs.alert(SaveResponse.data.message, { title: 'Action' });
        }
      }
    } catch (error) {
      handleApiError(error);
    }
  };  

  const handleApiError = (error) => {
    if (error.response) {
      const status = error.response.status;
      let message = 'An error occurred.';
      if (status === 500) {
        message = 'An internal server error occurred. Please try again later.';
        setRfidId('');
      } else if (status === 400) {
        message = 'You have to Time-in first.';
        setRfidId('');
      } else if (status === 404) {
        message = 'The scanned RFID is not Registered.';
        setAttendanceData({
          f_name: '',
          l_name: '',
          m_name: '',
          emp_id: '',
          image: ''
        });
        setRfidId('');
      } else {
        showErrorDialog();
      }
      dialogs.alert(message, { title: 'Rfid Error' });
    }
  };

  const showErrorDialog = () => {
    dialogs.alert('The scanned RFID is unregistered or not found in the database.', { title: 'Error Occurred' });
  };

  const handleRfidInputChange = (event) => {
    const Rfid = event.target.value;
    setRfidId(Rfid);
    if (Rfid.length === 10) {
      fetchScanData(Rfid);
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
              sx={{ width: '150px', height: '150px' }}
              src={attendanceData.image}
            />
            <TextField sx={{ marginTop: 10 }} value={`${attendanceData.f_name || ''} ${attendanceData.m_name || ''} ${attendanceData.l_name || ''}`.trim()} label="Employee Name" variant='standard' fullWidth InputProps={{readOnly: true}} />
            <TextField sx={{ marginTop: 2, marginBottom: 3 }} value={attendanceData.emp_id || ''} label="Employee ID"  variant='standard' fullWidth InputProps={{readOnly: true}} />
            <TextField
              label="RFID Id No."
              inputRef={rfidInputRef}
              value={rfidId}
              onChange={handleRfidInputChange}
              fullWidth
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}