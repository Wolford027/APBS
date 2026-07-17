import React, { useState, useEffect, useRef } from 'react';
import { Avatar, Box, Paper, TextField, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import ContactlessOutlinedIcon from '@mui/icons-material/ContactlessOutlined';
import { motion } from 'motion/react';
import { fadeInUp } from '../../../shared/animations';
import Logo from '../../../assets/Logo.png';
import axios from 'axios';
import { useDialogs } from '@toolpad/core';

const PRIMARY = '#2563EB';

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

        const SaveResponse = await axios.post('http://localhost:8800/attendance-scan', {
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
      } else if (status === 409) {
        message = 'You have already Timed in.';
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
      setTimeout(() => {
        setAttendanceData({
          f_name: '',
          l_name: '',
          m_name: '',
          emp_id: '',
          image: ''
        });
        setRfidId('');
        if (rfidInputRef.current) {
          rfidInputRef.current.focus();
        }
      }, 3000)
    }
  };

  const fullName = `${attendanceData.f_name || ''} ${attendanceData.m_name || ''} ${attendanceData.l_name || ''}`
    .replace(/\s+/g, ' ')
    .trim();
  const hasEmployee = Boolean(attendanceData.emp_id);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        px: 2,
        py: 4,
        background: `radial-gradient(1100px 520px at 50% -10%, ${alpha(PRIMARY, 0.08)}, transparent 60%), #F6F8FB`,
      }}
    >
      <img src={Logo} alt="APBS Logo" style={{ width: 180, maxWidth: '60vw', marginBottom: 24 }} />

      <Paper
        component={motion.div}
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 420,
          p: { xs: 3, sm: 4 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '16px',
          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04), 0 12px 32px rgba(15, 23, 42, 0.08)',
        }}
      >
        <Typography sx={{ fontSize: 20, fontWeight: 700 }}>Attendance Scanner</Typography>
        <Typography sx={{ fontSize: 13.5, color: 'text.secondary', mt: 0.5, mb: 3 }}>
          Tap your RFID card on the reader to time in or out.
        </Typography>

        <Avatar
          src={attendanceData.image || undefined}
          sx={{
            width: 120,
            height: 120,
            mb: 2,
            bgcolor: hasEmployee ? alpha(PRIMARY, 0.1) : '#F1F5F9',
            color: hasEmployee ? PRIMARY : '#94A3B8',
            border: '3px solid',
            borderColor: hasEmployee ? alpha(PRIMARY, 0.35) : '#E2E8F0',
            transition: 'border-color 200ms ease, background-color 200ms ease',
          }}
        >
          <ContactlessOutlinedIcon sx={{ fontSize: 48 }} />
        </Avatar>

        <Box sx={{ minHeight: 56, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
          {hasEmployee ? (
            <>
              <Typography sx={{ fontSize: 17, fontWeight: 700 }}>{fullName}</Typography>
              <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.25 }}>
                Employee ID · {attendanceData.emp_id}
              </Typography>
            </>
          ) : (
            <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
              Waiting for a card scan…
            </Typography>
          )}
        </Box>

        <TextField
          label="RFID Id No."
          inputRef={rfidInputRef}
          value={rfidId}
          onChange={handleRfidInputChange}
          fullWidth
          autoComplete="off"
        />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2.5 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: '#22C55E',
              '@keyframes scannerPulse': {
                '0%': { boxShadow: '0 0 0 0 rgba(34, 197, 94, 0.45)' },
                '70%': { boxShadow: '0 0 0 7px rgba(34, 197, 94, 0)' },
                '100%': { boxShadow: '0 0 0 0 rgba(34, 197, 94, 0)' },
              },
              animation: 'scannerPulse 2s ease-out infinite',
            }}
          />
          <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>Scanner ready</Typography>
        </Box>
      </Paper>
    </Box>
  );
}
