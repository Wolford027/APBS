import React, { useState, useEffect } from 'react';
import { Box, Paper, TextField, Button, Autocomplete, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import { motion } from 'motion/react';
import { fadeInUp } from '../../../shared/animations';
import Logo from '../../../assets/Logo.png';
import axios from 'axios';

const PRIMARY = '#2563EB';

export default function AttendancePage() {
  const [employeeList, setEmployeeList] = useState([]);
  const [rfidId, setRfidId] = useState(''); // State for RFID ID
  const [selectedEmployee, setSelectedEmployee] = useState(null); // State for selected employee

  useEffect(() => {
    FetchEmployeeList();
  }, []);

  const FetchEmployeeList = async () => {
    try {
      const res = await axios.get('http://localhost:8800/fetch-emp-info');
      setEmployeeList(res.data);
      console.log(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // Handle changes in the RFID input field
  const handleRfidInputChange = (event) => {
    setRfidId(event.target.value); // Set the RFID ID
  };

  // Handle employee selection from Autocomplete
  const handleEmployeeChange = (event, newValue) => {
    setSelectedEmployee(newValue); // Set the selected employee
  };

  // Register RFID
  const RegisterRfid = async () => {
    if (!selectedEmployee) {
      alert('Please select an employee');
      return;
    }

    try {
      const payload = { rfid: rfidId, emp_id: selectedEmployee.emp_id }; // Send both RFID ID and emp_id
      const res = await axios.post('http://localhost:8800/register-rfid', payload);
      if (res.data.message === 'RFID registered successfully!') {
        alert('RFID registered successfully!');
      } else {
        alert('Failed to register RFID. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while registering RFID.');
    }
  };

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
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '16px',
          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04), 0 12px 32px rgba(15, 23, 42, 0.08)',
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(PRIMARY, 0.1),
            color: PRIMARY,
            mb: 1.5,
          }}
        >
          <BadgeOutlinedIcon sx={{ fontSize: 24 }} />
        </Box>
        <Typography sx={{ fontSize: 20, fontWeight: 700 }}>Register RFID Card</Typography>
        <Typography sx={{ fontSize: 13.5, color: 'text.secondary', mt: 0.5, mb: 3, textAlign: 'center' }}>
          Link an RFID card to an employee so they can use it for attendance.
        </Typography>

        <Autocomplete
          options={employeeList}
          getOptionLabel={(option) => `${option.f_name} ${option.l_name}`}
          onChange={handleEmployeeChange} // Handle employee selection
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search Employee"
            />
          )}
          sx={{ width: '100%', marginBottom: 2 }}
        />
        <TextField
          label="RFID Id No."
          value={rfidId}  // Bind it to the state variable
          onChange={handleRfidInputChange}  // Update the state on change
          fullWidth
          autoComplete="off"
          helperText="Tap the card on the reader or type its 10-digit ID."
        />
        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={RegisterRfid}  // Call RegisterRfid without parameters
          sx={{ mt: 3 }}
        >
          Register RFID
        </Button>
      </Paper>
    </Box>
  );
}
