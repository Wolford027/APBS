import React, { useState, useEffect } from 'react';
import { Box, Modal, TextField, Typography, Button, Snackbar, Alert, Autocomplete } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

export default function AddEarningsDeductions({ onOpen, onClose, reload }) {
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [payrollTypeOptions, setPayrollTypeOptions] = useState([]);
  const [cycleTypeOptions, setCycleTypeOptions] = useState([]);
  const [cycleType, setCycleType] = useState(null);
  const [payrollType, setPayrollType] = useState(null);
  const [filteredCycleOptions, setFilteredCycleOptions] = useState([]);
  const [selectedCycleType, setSelectedCycleType] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [existingEntries, setExistingEntries] = useState([]);  // To store existing combinations
  const [confirmClose, setConfirmClose] = useState(false);

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
    
    // Clear selected cycle type if payroll type is removed
    if (!newValue) {
      setSelectedCycleType(null); // Clear the selected cycle type when payroll type is removed
      setFilteredCycleOptions([]); // Optionally clear the filtered cycle options
    } else {
      const filteredOptions = cycleTypeOptions
        .filter(item => item.payroll_type === newValue)
        .map(item => item.cycle_type);
      setFilteredCycleOptions(filteredOptions); // Update the filtered cycle options
    }
  };

  const resetForm = () => {
    setSelectedMonth(null);
    setSelectedYear(null);
    setPayrollType(null);
    setSelectedCycleType(null); 
  };

  const handleCloseModal = () => {
    if (selectedMonth || selectedYear || payrollType || selectedCycleType) {
      setConfirmClose(true); // Show confirmation prompt
    } else {
      resetForm();
      onClose();
    }
  };

  const handleConfirmClose = (confirm) => {
    if (confirm) {
      resetForm();
      onClose();
    }
    setConfirmClose(false); // Hide the confirmation prompt
  };

  const handleSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = () => {
    if (!selectedYear || !selectedMonth || !payrollType || !selectedCycleType) {
      setErrorMessage('Please fill in all the required fields.');
      return;
    }
  
    axios
      .get('http://localhost:8800/onetimeEarnDeduct')
      .then((response) => {
        const existingEntries = response.data;
  
        console.log('Existing Entries:', existingEntries);
        console.log('Selected Data:', {
          year: selectedYear,
          month: selectedMonth,
          payroll_type: payrollType,
          cycle_type: selectedCycleType,
        });
  
        // Normalize data for comparison
        const entryExists = existingEntries.some((entry) =>
          String(entry.year) === String(selectedYear) &&
          String(entry.month) === String(selectedMonth) &&
          String(entry.payroll_type) === String(payrollType) &&
          String(entry.cycle_type) === String(selectedCycleType)
        );
  
        if (entryExists) {
          setErrorMessage('Year, Month, Payroll type, and Cycle Type already exist.');
          return;
        }
  
        const payload = {
          year: selectedYear,
          month: selectedMonth,
          payroll_type: payrollType,
          cycle_type: selectedCycleType,
        };
  
        axios
          .post('http://localhost:8800/onetimeEarnDeduct', payload)
          .then((response) => {
            setExistingEntries([...existingEntries, payload]);
            setSuccessMessage('Earnings/Deductions added successfully!');
            resetForm();
            reload(); // Reload the parent component
          })
          .catch((error) => {
            setErrorMessage('Error saving data. Please try again.');
            console.error('Error saving data:', error);
          });
      })
      .catch((error) => {
        setErrorMessage('Error fetching existing data. Please try again.');
        console.error('Error fetching existing data:', error);
      });
  };
  

  return (
    <>
      <Modal open={onOpen} onClose={handleCloseModal} closeAfterTransition>
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
              width: { xs: '100%', sm: '100%', md: '55%' },
              boxShadow: 24,
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              overflowY: 'auto',
            }}
          >
            <CloseIcon onClick={handleCloseModal} sx={{ cursor: 'pointer', marginLeft: '96%' }} />
            <Typography variant="h4" component="h2" sx={{ marginBottom: 2, fontWeight: 'bold' }}>
              Add Employee Earnings/Deductions
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1, width: '100%', justifyContent: 'center' }}>
              <Autocomplete
                sx={{ width: '30%', marginLeft: 1 }}
                options={Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 1 + i)}
                value={selectedYear}
                onChange={(event, newValue) => setSelectedYear(newValue)}
                renderInput={(params) => <TextField {...params} label="Year" placeholder="Select Year" />}
              />
              <Autocomplete
                sx={{ width: '30%', marginLeft: 1 }}
                options={[
                  'January', 'February', 'March', 'April', 'May',
                  'June', 'July', 'August', 'September', 'October',
                  'November', 'December',
                ]}
                value={selectedMonth}
                onChange={(event, newValue) => setSelectedMonth(newValue)}
                renderInput={(params) => <TextField {...params} label="Month" placeholder="Select Month" />}
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1, width: '100%', justifyContent: 'center' }}>
            <Autocomplete
  sx={{ width: '30%', marginLeft: 1 }}
  options={payrollTypeOptions}
  value={payrollType} // Bound to the state variable `payrollType`
  onChange={handlePayrollTypeChange}
  renderInput={(params) => <TextField {...params} label="Payroll Type" />}
/>

<Autocomplete
  sx={{ width: '30%', marginLeft: 1 }}
  options={filteredCycleOptions}
  value={selectedCycleType} // Bound to the state variable `selectedCycleType`
  onChange={(event, value) => {
    setSelectedCycleType(value); // Update state with selected value
    console.log("Selected cycle type:", value); // Log for debugging
  }}
  renderInput={(params) => <TextField {...params} label="Cycle Type" />}
/>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%', marginTop: 2 }}>
              <Button
                sx={{ borderRadius: 3, marginRight: 2, marginRight: '10%' }}
                color="primary"
                variant="contained"
                onClick={handleSubmit}
              >
                Generate
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      {confirmClose && (
        <Snackbar open={confirmClose} onClose={() => setConfirmClose(false)} autoHideDuration={6000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert
            severity="warning"
            action={
              <>
                <Button color="inherit" size="small" onClick={() => handleConfirmClose(true)}>
                  Yes
                </Button>
                <Button color="inherit" size="small" onClick={() => handleConfirmClose(false)}>
                  No
                </Button>
              </>
            }
          >
            Are you sure you want to close this? Unsaved data will be lost.
          </Alert>
        </Snackbar>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Success and Error Notifications */}
      {successMessage && (
        <Snackbar
          open={!!successMessage}
          autoHideDuration={3000}
          onClose={() => setSuccessMessage('')}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={() => setSuccessMessage('')} severity="success">
            {successMessage}
          </Alert>
        </Snackbar>
      )}

      {errorMessage && (
        <Snackbar
          open={!!errorMessage}
          autoHideDuration={3000}
          onClose={() => setErrorMessage('')}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={() => setErrorMessage('')} severity="error">
            {errorMessage}
          </Alert>
        </Snackbar>
      )}
    </>
  );
}
