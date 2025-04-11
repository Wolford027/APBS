import React, { useState, useEffect, useRef } from 'react';
import { Avatar, Box, Paper, Grid, TextField, Typography, Button } from '@mui/material';
import axios from 'axios';
import { useDialogs } from '@toolpad/core';

// Define mode constants
const MODES = {
  TIME_IN: 'time-in',
  BREAK_IN: 'break-in',
  BREAK_OUT: 'break-out',
  TIME_OUT: 'time-out',
};

export default function RfidPage() {
  const [attendanceData, setAttendanceData] = useState({
    f_name: '',
    l_name: '',
    m_name: '',
    emp_id: '',
    image: ''
  });
  const [rfidId, setRfidId] = useState('');
  const [mode, setMode] = useState(MODES.TIME_IN);
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
          mode: mode,
        });
        console.log(SaveResponse);
  
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
      } else if (status === 400) {
        message = 'You have to Time-in first.';
      } else if (status === 404) {
        message = 'The scanned RFID is not Registered.';
      } else if(status === `(failed)net::ERR_FAILED`) {
        message = 'Network error. Please check your connection.'; 
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
      if (mode) {
        fetchScanData(Rfid);
      }
    }
  };

  const handleModeChange = (selectedMode) => {
    setMode(selectedMode);
    if (rfidInputRef.current) {
      rfidInputRef.current.focus();
    }
    console.log(`Mode changed to: ${selectedMode}`);
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
            <Typography sx={{ marginTop: 10 }}>
              {`${attendanceData.f_name || ''} ${attendanceData.m_name || ''} ${attendanceData.l_name || ''}`.trim() || 'Employee Name'}
            </Typography>
            <Typography>{attendanceData.emp_id || 'Employee Id'}</Typography>
            <TextField
              label="RFID Id No."
              inputRef={rfidInputRef}
              value={rfidId}
              onChange={handleRfidInputChange}
              fullWidth
            />
            {/* Add spacing between buttons */}
            <Box sx={{ marginTop: 2, display: 'flex', flexDirection: 'row', gap: 2 }}>
              <Button
                variant='contained'
                disabled={mode === MODES.TIME_IN}
                onClick={() => handleModeChange(MODES.TIME_IN)}
                aria-label="Time In"
              >
                Time In
              </Button>
              <Button
                variant='contained'
                disabled={mode === MODES.BREAK_IN}
                onClick={() => handleModeChange(MODES.BREAK_IN)}
                aria-label="Break In"
              >
                Break In
              </Button>
              <Button
                variant='contained'
                disabled={mode === MODES.BREAK_OUT}
                onClick={() => handleModeChange(MODES.BREAK_OUT)}
                aria-label="Break Out"
              >
                Break Out
              </Button>
              <Button
                variant='contained'
                disabled={mode === MODES.TIME_OUT}
                onClick={() => handleModeChange(MODES.TIME_OUT)}
                aria-label="Time Out"
              >
                Time Out
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}