import React, { useState, useEffect } from 'react';
import SideNav from '../Components/SideNav';
import { Box, Modal, TextField, Typography, Button, Tooltip, Autocomplete } from '@mui/material'
import Table from '@mui/joy/Table';
import axios from 'axios';
import CloseIcon from '@mui/icons-material/Close';
import AddEmpBenifitsAllowance from '../_Modals/AddEmpBenifitsAllowance';
import ViewListEmpEarning from '../_Modals/ViewListEmpEarning';

const drawerWidth = 240;

export default function ViewListsEarnings({ onOpen, onClose, openListEarnings }) {

  const [openModal1, setOpenModal1] = useState(false);

  const handleCloseModal1 = () => {
    setOpenModal1(false);  // Close the modal
  };
  const [selectedMonth, setSelectedMonth] = useState(null);

  const months = [
    'January', 'February', 'March', 'April', 'May',
    'June', 'July', 'August', 'September', 'October',
    'November', 'December'
  ];

  const [selectedYear, setSelectedYear] = useState(null);

  // Generate a list of years from the current year to 20 years into the future
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 1 + i);

  const [payrollTypeOptions, setPayrollTypeOptions] = useState([]);
  const [cycleTypeOptions, setCycleTypeOptions] = useState([]);
  const [payrollType, setPayrollType] = useState(null);
  const [filteredCycleOptions, setFilteredCycleOptions] = useState([]);

  // Fetch options from the backend
  useEffect(() => {
    axios.get('http://localhost:8800/date_cycle')
      .then(response => {
        const data = response.data;
        const payrollTypes = [...new Set(data.map(item => item.payroll_type))];
        setPayrollTypeOptions(payrollTypes);
        setCycleTypeOptions(data);
      })
      .catch(error => {
        console.error('Error fetching options:', error);
      });
  }, []);

  // Update cycle options dynamically based on selected payroll type
  const handlePayrollTypeChange = (event, newValue) => {
    setPayrollType(newValue);
    const filteredOptions = cycleTypeOptions
      .filter(item => item.payroll_type === newValue)
      .map(item => item.cycle_type);
    setFilteredCycleOptions(filteredOptions);
  };

  return (
    <>
      {/* LIST EARNINGS */}
      <Modal open={onOpen} onClose={handleCloseModal1} closeAfterTransition >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            p: 2,
          }}
        >
          <Box
            sx={{
              backgroundColor: 'white',
              padding: 4,
              width: { xs: '100%', sm: '100%', md: '60%' },
              boxShadow: 24,
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              overflow: 'hidden',
              overflowY: 'auto',
            }}
          >
            <CloseIcon onClick={onClose} sx={{ cursor: 'pointer', marginLeft: '96%' }} />
            <Typography variant="h4" component="h2" sx={{ marginBottom: 2, fontWeight: 'bold' }}>
              Add Employee Earnings/Deductions
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
              <Autocomplete
                sx={{ width: '25%', marginLeft: 1 }}
                options={years}
                value={selectedYear}
                onChange={(event, newValue) => setSelectedYear(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Year"
                    placeholder="Select Year"
                  />
                )}
                getOptionLabel={(option) => option.toString()} // Convert numbers to strings for display
                isOptionEqualToValue={(option, value) => option === value}
                disablePortal // Ensures dropdown opens within the container
              />
              <Autocomplete
                sx={{ width: '25%', marginLeft: 1 }}
                options={months}
                value={selectedMonth}
                onChange={(event, newValue) => setSelectedMonth(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Month"
                    placeholder="Select Month"
                  />
                )}
                disablePortal // Ensures dropdown opens within the container
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1 , width: '100%', justifyContent: 'center', alignItems: 'center' }}>
              <Autocomplete
                sx={{ width: '25%', marginLeft: 1 }}
                options={payrollTypeOptions}
                value={payrollType}
                onChange={handlePayrollTypeChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Payroll Type"
                    placeholder="Select Payroll Type"

                  />
                )}
              />
              <Autocomplete
                sx={{ width: '25%', marginLeft: 1 }}
                options={filteredCycleOptions}
                disabled={!payrollType} // Disable if no Payroll Type is selected
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Cycle Type"
                    placeholder="Select Cycle Type"

                  />
                )}
              />
            </Box>
                
          </Box>
        </Box>
      </Modal>
    </>
  );
}
