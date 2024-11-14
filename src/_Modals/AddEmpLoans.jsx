import React, { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import axios from 'axios'
import { Button, Modal, TextField, Autocomplete, Snackbar, Alert } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import Tooltip from '@mui/material/Tooltip';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';  // Import date-fns for formatting


const drawerWidth = 240;

export default function AddEmpBenifitsAllowance({ onOpen, onClose, openListEarnings }) {
  //CURRENCY INADD EMP ALLOWANCE
  const CurrencyDisplay = ({ amount, label }) => {
    const formattedAmount = new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);

    return (
      <Typography
        sx={{
          width: '100%',
          display: 'flex',
          fontWeight: 'bold',
          fontStyle: 'italic',
          color: 'red',
        }}
      >
        <span style={{ color: 'red', fontWeight: 'bold' }}>*</span>
        {formattedAmount} {label}
      </Typography>
    );
  };
  // AUTO ERASE WHEN WILL TYPE IN TEXT FILED IN EMP ADD ALLOWANCE

  // State to track input values
  const [values, setValues] = useState({
    riceSubsidy: '0.00',
    clothingAllowance: '0.00',
    laundryAllowance: '0.00',
    medicalAllowance: '0.00',
    medicalAssistant: '0.00',
    achivementAwards: '0.00',
  });

  // Function to handle input change
  const handleChange = (field, newValue) => {
    const regex = /^[0-9]*[.]?[0-9]*$/; // Validate input to allow only numbers and one decimal point

    if (regex.test(newValue)) {
      setValues((prevValues) => ({
        ...prevValues,
        [field]: newValue,
      }));
    }
  };

  // Ensure value has two decimal places onBlur (focus out)
  const handleFocus = (field) => {
    setValues((prevValues) => ({
      ...prevValues,
      [field]: prevValues[field] === '0.00' ? '' : prevValues[field], // Clear '0.00' when focused
    }));
  };

  const handleBlur = (field) => {
    setValues((prevValues) => {
      let updatedValue = prevValues[field];

      // If the value is empty, set it back to '0.00'
      if (updatedValue === '') {
        updatedValue = '0.00';
      } else if (!updatedValue.includes('.')) {
        // Ensure two decimal places
        updatedValue = `${updatedValue}.00`;
      } else {
        // Truncate the decimal to two places
        const [integerPart, decimalPart] = updatedValue.split('.');
        updatedValue = `${integerPart}.${decimalPart.substring(0, 2)}`;
      }

      return {
        ...prevValues,
        [field]: updatedValue,
      };
    });
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  // Closing the modal

  const handleCloseModal = () => {
    if (
      selectedEmployees !== null ||
      startDate !== null ||
      endDate !== null 
  ) {
      setConfirmClose(true); // Show confirmation snackbar
  } else {
    setOpenModal(false);
      resetForm(); // Reset the form
      onClose(); // Close the modal
  }
};

  const [openModal, setOpenModal] = useState(false);
  // State to hold the selected values (multiple selections) and selected date
  const [selectedDate, setSelectedDate] = useState(null); // State for Date Hired
  const [input1, setInput1] = useState([]);

  // Handle adding a new allowance/benefit entry
  const handleAddBenefitsAllowance = () => {
    setInput1([...input1, { name: '', value: '' }]); // Add new entry
  };


  // Handle removing an allowance/benefit entry
  const handleRemoveBenefitsAllowance = (index) => {
    const newInput1 = input1.filter((_, i) => i !== index); // Remove entry by index
    setInput1(newInput1);
  };

  // Handle change in input fields for name or value
  const handleInputChange = (index, field, value) => {
    const newInput1 = [...input1]; // Create a copy of the state
    newInput1[index] = { ...newInput1[index], [field]: value }; // Update the specific field
    setInput1(newInput1); // Update the state with the new array
  };
  // fetch EMP
  const [startDate, setStartDate] = useState(null);   // Start date for filtering
  const [endDate, setEndDate] = useState(null);       // End date for filtering
  const [options, setOptions] = useState([]);         // All employees for selection
  const [selectedEmployees, setSelectedEmployees] = useState([]); // Selected employees based on date range

  // Fetch all employees for the autocomplete options
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get('http://localhost:8800/emp_list');
        const formattedOptions = res.data.map(employee => ({
          label: `${employee.emp_id} - ${employee.f_name} ${employee.l_name}`,
          ...employee
        }));
        setOptions(formattedOptions);
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };

    fetchEmployees();
  }, []);

  // Fetch employees within the date range when endDate changes
  const fetchEmployeesByDate = async () => {
    try {
      // Format the start and end dates to 'YYYY-MM-DD' format
      const formattedStartDate = startDate ? format(startDate, 'yyyy-MM-dd') : '';
      const formattedEndDate = endDate ? format(endDate, 'yyyy-MM-dd') : '';

      if (formattedStartDate && formattedEndDate) {
        // Fetch employees by date range
        const res = await axios.get('http://localhost:8800/emp_list_by_date', {
          params: { startDate: formattedStartDate, endDate: formattedEndDate }
        });

        const formattedOptions = res.data.map((employee) => ({
          label: `${employee.emp_id} - ${employee.f_name} ${employee.l_name}`,
          ...employee
        }));

        setOptions(formattedOptions); // Update the options list with the fetched data
        setSelectedEmployees(formattedOptions); // Automatically select employees within date range
      }
    } catch (error) {
      console.error('Error fetching employees by date range:', error);
    }
  };

  // useEffect to fetch employees when either startDate or endDate changes
  useEffect(() => {
    fetchEmployeesByDate();
  }, [startDate, endDate]); // Run when the date range changes

  const resetForm = () => {
    setInput1([]);
    setEndDate(null);
    setStartDate(null);
    setSelectedEmployees([]);
    
    // Reset form values to default when closing the modal
    setValues({
      riceSubsidy: '0.00',
      clothingAllowance: '0.00',
      laundryAllowance: '0.00',
      medicalAllowance: '0.00',
      medicalAssistant: '0.00',
      achivementAwards: '0.00',
    });
};


  const [snackbarOpen, setSnackbarOpen] = useState(false); // For controlling snackbar visibility
  const [snackbarMessage, setSnackbarMessage] = useState(""); // For storing the snackbar message
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // For storing snackbar severity (e.g., 'warning', 'success', 'error')
  
  const [confirmClose, setConfirmClose] = useState(false); // For controlling the confirmation dialog state
  
  // Function to trigger confirmation dialog
  const handleConfirmClose = (confirm) => {
    if (confirm) {
      setOpenModal(false);
      resetForm();
      onClose();
    }
    setConfirmClose(false); // Close the confirmation dialog
  };
  
  // Function to trigger a snackbar message with a specific severity
  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
    // Optionally, you can close the snackbar after a delay
    setTimeout(() => setSnackbarOpen(false), severity === 'warning' || severity === 'success' ? 3000 : 6000);
  };

  return (
    <>
      {/* ADD EMP BENIFITS OR ALLOWANCES  */}
      <Modal
        open={onOpen}
        onClose={handleCloseModal}
        closeAfterTransition
      >
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
              width: { xs: '80%', sm: '80%', md: '60%' },
              height: { xs: '80%', sm: '60%', md: '80%' },
              boxShadow: 24,
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              overflowY: 'auto',

            }}
          >
            <CloseIcon onClick={handleCloseModal} sx={{ cursor: 'pointer', marginLeft: '96%' }} />
            <Typography variant="h4" component="h2" sx={{ marginBottom: 2, fontWeight: 'bold', textAlign: 'center', }}>
              Add Employee Loans
            </Typography>
            <Box sx={{ overscrollBehavior: 'contain' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', marginTop: 1, alignItems: 'center' }}>
                <Box sx={{ width: '60%' }}>
                  <Autocomplete
                    multiple
                    value={selectedEmployees}
                    onChange={(event, newValue) => setSelectedEmployees(newValue)} // Allow manual selection
                    options={options} // Options for all employees
                    getOptionLabel={(option) => option.label}
                    renderInput={(params) => <TextField {...params} label="Select Employee" />}
                    sx={{ width: '100%' }}
                  />
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: 2, gap: 2, width: '60%' }}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Date Start Point"
                      value={startDate}
                      onChange={(newValue) => setStartDate(newValue)}
                      renderInput={(params) => <TextField {...params} sx={{ width: '50%' }} />}
                    />
                    <DatePicker
                      label="Date End Point"
                      value={endDate}
                      onChange={(newValue) => setEndDate(newValue)}
                      renderInput={(params) => <TextField {...params} sx={{ width: '50%' }} />}
                    />
                  </LocalizationProvider>
                </Box>

              </Box>


              <Box display="flex" sx={{ width: '100%', marginBottom: 1, marginTop: 2 }}>
                <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                  De Minimis Benefits
                </Typography>
              </Box>

              <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', fontStyle: 'italic', color: 'red', textAlign: 'left', width: '100%' }} >
                *Limit for Non-Taxable
              </Typography>

              <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', fontStyle: 'italic', textAlign: 'left', width: '100%', marginTop: 1 }} >
                Monthly
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1, justifyContent: 'center' }}>

                <Box sx={{ display: 'flex', flexDirection: 'column', marginLeft: 1, width: '23%' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                    <CurrencyDisplay amount={2000} label="Monthly" />
                    <Tooltip title="Rice subsidy (no more than Php 2,000 per month)" arrow placement="top">
                      <InfoOutlinedIcon sx={{ color: 'gray', marginLeft: 1, cursor: 'pointer', fontSize: 18, marginTop: 0.6 }} />
                    </Tooltip>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 1 }}>
                    <TextField
                      label="Rice Subsidy"
                      value={values.riceSubsidy}
                      onChange={(e) => handleChange('riceSubsidy', e.target.value)}
                      onFocus={() => handleFocus('riceSubsidy')}
                      onBlur={() => handleBlur('riceSubsidy')}
                      sx={{ width: '100%' }}
                    />
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', marginLeft: 1, width: '23%' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                    <CurrencyDisplay amount={500} label="Monthly" />
                    <Tooltip title="Uniform and clothing allowance (no more than Php 6,000 per year)" arrow placement="top">
                      <InfoOutlinedIcon sx={{ color: 'gray', marginLeft: 1, cursor: 'pointer', fontSize: 18, marginTop: 0.6 }} />
                    </Tooltip>
                  </Box>

                  <TextField
                    label="Uniform or Clothing Allowance"
                    value={values.clothingAllowance}
                    onChange={(e) => handleChange('clothingAllowance', e.target.value)}
                    onFocus={() => handleFocus('clothingAllowance')}
                    onBlur={() => handleBlur('clothingAllowance')}
                    sx={{ width: '100%', marginTop: 1 }}
                  />
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', marginLeft: 1, width: '22%' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                    <CurrencyDisplay amount={300} label="Monthly" />
                    <Tooltip title="Laundry allowance (no more than Php 300 per month)" arrow placement="top">
                      <InfoOutlinedIcon sx={{ color: 'gray', marginLeft: 1, cursor: 'pointer', fontSize: 18, marginTop: 0.6 }} />
                    </Tooltip>
                  </Box>

                  <TextField
                    label="Laundry Allowance"
                    value={values.laundryAllowance}
                    onChange={(e) => handleChange('laundryAllowance', e.target.value)}
                    onFocus={() => handleFocus('laundryAllowance')}
                    onBlur={() => handleBlur('laundryAllowance')}
                    sx={{ width: '100%', marginTop: 1 }}
                  />
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', marginLeft: 1, width: '22%' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                    <CurrencyDisplay amount={250} label="Monthly" />
                    <Tooltip title="Medical cash allowance to dependents (no more than Php 250 per month)" arrow placement="top">
                      <InfoOutlinedIcon sx={{ color: 'gray', marginLeft: 1, cursor: 'pointer', fontSize: 18, marginTop: 0.6 }} />
                    </Tooltip>
                  </Box>

                  <TextField
                    label="Medical Cash Allowance"
                    value={values.medicalAllowance}
                    onChange={(e) => handleChange('medicalAllowance', e.target.value)}
                    onFocus={() => handleFocus('medicalAllowance')}
                    onBlur={() => handleBlur('medicalAllowance')}
                    sx={{ width: '100%', marginTop: 1 }}
                  />
                </Box>
              </Box>

              <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', fontStyle: 'italic', textAlign: 'left', width: '100%', marginTop: 1 }} >
                Annually
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1, justifyContent: 'center' }}>

                <Box sx={{ display: 'flex', flexDirection: 'column', marginLeft: 1, width: '46%' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                    <CurrencyDisplay amount={10000} label="Annual" />
                    <Tooltip title="Actual medical assistance, such as maternity assistance and other medical and healthcare needs (no more than Php 10,000 per year)" arrow placement="top">
                      <InfoOutlinedIcon sx={{ color: 'gray', marginLeft: 1, cursor: 'pointer', fontSize: 18, marginTop: 0.6 }} />
                    </Tooltip>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 1 }}>
                    <TextField
                      label="Achivement Awards"
                      value={values.medicalAssistant}
                      onChange={(e) => handleChange('medicalAssistant', e.target.value)}
                      onFocus={() => handleFocus('medicalAssistant')}
                      onBlur={() => handleBlur('medicalAssistant')}
                      sx={{ width: '100%' }}
                    />
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', marginLeft: 1, width: '46%' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                    <CurrencyDisplay amount={10000} label="Annual" />
                    <Tooltip title="Employees’ achievement awards (no more than Php 10,000 in annual monetary value under an established written plan; not favoring highly-paid employees)" arrow placement="top">
                      <InfoOutlinedIcon sx={{ color: 'gray', marginLeft: 1, cursor: 'pointer', fontSize: 18, marginTop: 0.6 }} />
                    </Tooltip>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 1 }}>
                    <TextField
                      label="Actual Medical Assistance"
                      value={values.achivementAwards}
                      onChange={(e) => handleChange('achivementAwards', e.target.value)}
                      onFocus={() => handleFocus('achivementAwards')}
                      onBlur={() => handleBlur('achivementAwards')}
                      sx={{ width: '100%' }}
                    />
                  </Box>

                </Box>
              </Box>

              <Box display="flex" sx={{ width: '100%', marginBottom: 1, marginTop: 2 }}>
                <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                  Additonal Benefits or Allowance
                </Typography>
              </Box>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', fontStyle: 'italic', color: 'red', textAlign: 'left' }} >
                *Adding Benifits or Allowance is Taxable
              </Typography>

              <Box sx={{ marginTop: 2, display: 'flex', gap: 2, flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                {input1.map((item, index1) => (
                  <Box key={index1} sx={{ display: 'flex', flexDirection: 'row' }}>
                    <TextField
                      label="Allowance or Benefits Names"
                      placeholder="e.g. Transport Allowance"
                      value={item.name}
                      onChange={(e) => handleInputChange(index1, 'name', e.target.value)} // Handle name input change
                      sx={{ marginLeft: 1, width: '45%' }}
                    />
                    <TextField
                      label="Value"
                      placeholder="e.g. 1,000.00"
                      value={item.value}
                      onChange={(e) => handleInputChange(index1, 'value', e.target.value)} // Handle value input change
                      sx={{ marginLeft: 1, width: '25%' }}
                    />

                    <Autocomplete
                      // value={filter} 
                      // onChange={handleFilterChange} 
                      options={['Monthly', 'Annually']}
                      renderInput={(params) => (
                        <TextField {...params} label="Allowance Type" />
                      )}
                      sx={{ marginLeft: 1, width: '25%' }} // Style the Autocomplete input
                    />

                    <Button
                      variant="contained"
                      onClick={() => handleRemoveBenefitsAllowance(index1)}
                      sx={{ marginLeft: 1, width: '20' }}
                    >
                      Remove
                    </Button>
                  </Box>
                ))}
                <Button
                  variant="contained"
                  onClick={handleAddBenefitsAllowance}
                  sx={{ marginLeft: 1, width: '50%', marginBottom: 3 }}
                >
                  Add Benefits or Allowance
                </Button>
              </Box>
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button variant="contained" sx={{ fontSize: 12, fontWeight: 'bold' }}>Save</Button>
                <Button variant="contained" sx={{ fontSize: 12, fontWeight: 'bold' }}>Cancel</Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Modal>

      {confirmClose && (
                <Snackbar
                    open={confirmClose}
                    autoHideDuration={3000}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                    
                >
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
                        Are you sure you want to close this? The data filled will not be saved.
                    </Alert>
                </Snackbar>
            )}

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={snackbarSeverity === 'warning' || snackbarSeverity === 'success' ? 3000 : 6000} // Set duration based on severity
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbarOpen(false)}
                    severity={snackbarSeverity} // Use the severity state
                    sx={{ width: '100%' }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
            
    </>
  )
}
