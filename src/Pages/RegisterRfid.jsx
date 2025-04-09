import React, { useState, useEffect } from 'react';
import { Box, Paper, Grid, TextField, Button, Autocomplete, Avatar } from '@mui/material';
import Logo from '../assets/Logo.png';
import axios from 'axios';

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
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Grid container spacing={2} justifyContent="center">
        <img src={Logo} alt="Logo" style={{ width: '500px', marginBottom: '20px' }} />
        <Grid item xs={12} sm={8} md={6} lg={4}>
          <Paper elevation={3} sx={{ padding: 5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
            />
            <Box sx={{ marginTop: 2 }}>
              <Button
                variant="contained"
                onClick={RegisterRfid}  // Call RegisterRfid without parameters
              >
                Register RFID
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
