import React, { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import axios from 'axios'
import { Button, Modal, TextField, Autocomplete, Snackbar, Alert, Portal } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import Tooltip from '@mui/material/Tooltip';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';  // Import date-fns for formatting


const drawerWidth = 240;

export default function AddEmpLoans({ onOpen, onClose, openListEarnings }) {
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

  const [openModal, setOpenModal] = useState(false);
  // State to hold the selected values (multiple selections) and selected date
  const [selectedDate, setSelectedDate] = useState(null); // State for Date Hired
  const [input, setInput] = useState([]);
 
  const handleRemoveCompanyLoans = (index) => {
    const newInput1 = input1.filter((_, i) => i !== index); // Remove entry by index
    setInput1(newInput1);
  };

  const handleInputChange1 = (index, field, value) => {
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

  };

  const handleCloseModal = () => {
    if (
      (selectedEmployees && selectedEmployees.length > 0) ||
      (startDate && startDate !== '') ||
      (endDate && endDate !== '') ||
      values.riceSubsidy !== '0.00' ||
      values.clothingAllowance !== '0.00' ||
      values.laundryAllowance !== '0.00' ||
      values.medicalAllowance !== '0.00' ||
      values.medicalAssistant !== '0.00' ||
      values.achivementAwards !== '0.00'
    ) {
      setConfirmClose(true); // Show confirmation snackbar
    } else {
      resetForm(); // Reset the form
      onClose(); // Close the modal
    }
  };

  const handleConfirmClose = (confirm) => {
    if (confirm) {
      resetForm();
      onClose();
    }
    setConfirmClose(false); // Close the confirmation dialog

  };

  const handleChange1 = (field, value) => {
    setValues((prevValues) => ({
      ...prevValues,
      [field]: value,
    }));
  };

  const [governmentNames, setGovernmentNames] = useState([]);
  const [loanTypes, setLoanTypes] = useState([]);
  const [statusLoans, setStatusLoans] = useState([]);
  const [loans, setLoans] = useState([{ governmentName: '', loanType: '', loanAmount: '', monthlyPayment: '', paymentTerms: '', interest: '', penalty: '', totalLoans: '', totalpayments: '' }]);
  const [selectedGovernment, setSelectedGovernment] = useState(null);
  const [selectedLoanType, setSelectedLoanType] = useState(null);
  const [selectedStatusLoan, setSelectedStatusLoan] = useState(null);
  const [selectedStatusLoan1, setSelectedStatusLoan1] = useState(null);
  //useState({ emp_status_loans_name: "Active", });

  useEffect(() => {
    // Fetch Government Names
    axios.get("http://localhost:8800/gov-name")
      .then((response) => setGovernmentNames(response.data))
      .catch((error) => console.error("Error fetching government names:", error));

    // Fetch Loan Types
    axios.get("http://localhost:8800/loan-type")
      .then((response) => setLoanTypes(response.data))
      .catch((error) => console.error("Error fetching loan types:", error));

    // Fetch Status Loans
    axios.get("http://localhost:8800/status-loans")
      .then((response) => setStatusLoans(response.data))
      .catch((error) => console.error("Error fetching status loans:", error));

  }, []);

  const [companyNames, setCompanyName] = useState([]); // Store loan names
  const [companyLoanTypes, setCompanyLoanTypes] = useState([]); // Store loan types
  const [selectedCompanyName, setSelectedCompanyName] = useState(null);
  const [selectedCompanyLoanType, setSelectedCompanyLoanType] = useState(null);
  const [input1, setInput1] = useState([{ companyName: '', companyLoanType: '', loanAmountc: '', monthlyPaymentc: '', paymentTermsc: '', interestc: '', penaltyc: '', totalLoansc: '', totalpaymentsc: '' }]);


  useEffect(() => {
    // Fetch Company Loan Names
    axios.get("http://localhost:8800/com-name")
      .then((response) => {
        setCompanyName(response.data); // Set the loan names
      })
      .catch((error) => {
        console.error("Error fetching loan names:", error);
      });

    // Fetch Company Loan Types
    axios.get("http://localhost:8800/company-loan-type")
      .then((response) => {
        setCompanyLoanTypes(response.data); // Set the loan types
      })
      .catch((error) => {
        console.error("Error fetching loan types:", error);
      });
  }, []); // Empty dependency array means this runs once after the initial render


  // Handle LOANS GOVERMENT
  const handleAddGovermentLoans = () => {
    setLoans([...loans, { governmentName: '', loanType: '', loanAmount: '', monthlyPayment: '', paymentTerms: '', interest: '', penalty: '', totalLoans: '', totalpayments: '' }]); // Add new entry
  };
  const handleAddCompanyLoans = () => {
    setInput1([...input1, { ComapanyName: '', ComapanyLoanType: '', loanAmount: '', monthlyPayment: '', paymentTerms: '', interest: '', penalty: '', totalLoans: '', totalpayments: '' }]); // Add new entry
  };

  const handleInputChange = (index, field, value) => {
    const updatedLoans = [...loans];
    updatedLoans[index][field] = value;
    setLoans(updatedLoans);
  };
  const handleRemoveGovementLoans = (index) => {
    const updatedLoans = loans.filter((_, i) => i !== index);
    setLoans(updatedLoans);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedEmployees.length === 0) {
      console.error("Please select at least one employee.");
      setSnackbarMessage("Please fill in all fields.");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return; // Exit if no employees are selected
    }

    try {
      // Fetch existing loan records to prevent duplicates
      const existingLoansResponse = await axios.get("http://localhost:8800/ViewGovernmentLoans");
      const existingLoans = existingLoansResponse.data;

      // Fetch employee statuses to check if employees are 'Active'
      const employeeStatusResponse = await axios.get("http://localhost:8800/ViewGovernmentLoans");
      const employeeStatuses = employeeStatusResponse.data;

      // Check for duplicates and status of employees
      const duplicateLoans = selectedEmployees.filter((employee) => {
        // Check if the employee's status is 'Active'
        const isActive = employeeStatuses.some((status) => status.emp_id === employee.emp_id && status.status === 'Active');
        if (!isActive) {
          console.log(`Employee ${employee.emp_id} is not Active. Skipping.`);
          return false; // Skip this employee if not active
        }

        // Check for existing loan records for the active employee
        return existingLoans.some((existingLoan) => {
          const governmentId = selectedGovernment?.emp_government_id;
          const loanTypeId = selectedLoanType?.loan_type_id;

          // Compare Government ID, Loan Type ID, and Emp ID to check for duplicates
          const governmentIdMatch = existingLoan.government_id === governmentId;
          const loanTypeIdMatch = existingLoan.loan_type_id === loanTypeId;

          return existingLoan.emp_id === employee.emp_id && governmentIdMatch && loanTypeIdMatch;
        });
      });

      if (duplicateLoans.length > 0) {
        setSnackbarMessage("Employee already has a government loan record.");
        setSnackbarSeverity("warning");
        setSnackbarOpen(true);
        return; // Exit if duplicate loan is found
      }

      // Prepare and send the loan data for government loans (if present)
      const loanRequests = loans.length > 0 ? selectedEmployees.map((employee) => {
        const loanPayload = loans.map((loan) => ({
          emp_id: employee.emp_id,
          government_id: selectedGovernment?.emp_government_id,
          government_name: selectedGovernment?.emp_government_name,
          loan_type_id: selectedLoanType?.loan_type_id,
          loan_type_name: selectedLoanType?.loan_type_name,
          loan_amount: loan.loanAmount,
          loan_interest_per_month: loan.interest,
          loan_monthly_payment: loan.monthlyPayment,
          status: selectedStatusLoan?.emp_status_loans_name,
          payment_terms: loan.paymentTerms,
          payment_terms_remains: loan.paymentTerms,
        }));

        console.log("Government Loan Payload:", loanPayload);
        return axios.post("http://localhost:8800/AddGovernmentLoans", loanPayload);
      }) : [];

      // Proceed with all loan requests
      const loanResponses = await Promise.allSettled(loanRequests);
      const failedRequests = loanResponses.filter((res) => res.status === 'rejected');

      if (failedRequests.length > 0) {
        console.error("Some loan requests failed:", failedRequests);
        setSnackbarMessage("Some loan requests failed. Please check the console for details.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }

      console.log("Loan data saved successfully:", loanResponses);

      // Prepare loan data for company loans
      const companyLoanRequests = selectedEmployees.map((employee) => {
        // Check if input1 contains valid data
        if (input1.length === 0) {
          console.error("Input1 is empty. Please add at least one loan.");
          setSnackbarMessage("Please add at least one loan.");
          setSnackbarSeverity("warning");
          setSnackbarOpen(true);
          return;
        }

        const companyLoanData = input1.map((item) => ({
          emp_id: employee.emp_id,
          company_loan_name: selectedCompanyName?.company_loan_name,
          company_loan_type: selectedCompanyLoanType?.loan_type_name,
          status: selectedStatusLoan1?.emp_status_loans_name,
          payment_terms: item.PaymentTerms,
          payment_terms_remains: item.PaymentTerms,
          loan_amount: item.LoanAmount,
          interest_per_month: item.IntPerMonth,
          loan_monthly_payment: item.MonthlyPayment,
        }));

        console.log("Company Loan Payload:", companyLoanData);

        // Send request to the backend
        return axios.post("http://localhost:8800/AddCompanyLoans", companyLoanData);
      });

      // Handle company loan requests
      const loanResponses1 = await Promise.allSettled(companyLoanRequests);
      const failedRequests1 = loanResponses1.filter((res) => res.status === 'rejected');

      if (failedRequests1.length > 0) {
        console.error("Some company loan requests failed:", failedRequests1);
        setSnackbarMessage("Some loan requests failed. Please check the console for details.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }

      console.log("Loan data saved successfully:", loanResponses1);

      setSnackbarMessage("Employee Government and Company Loans Added Successfully");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      resetForm();

    } catch (error) {
      console.error("Error saving data:", error);
      setSnackbarMessage("Unexpected error occurred. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };


  const [snackbarOpen, setSnackbarOpen] = useState(false); // For controlling snackbar visibility
  const [snackbarMessage, setSnackbarMessage] = useState(""); // For storing the snackbar message
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // For storing snackbar severity (e.g., 'warning', 'success', 'error')

  const [confirmClose, setConfirmClose] = useState(false); // For controlling the confirmation dialog state

  // Function to trigger a snackbar message with a specific severity
  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
    // Optionally, you can close the snackbar after a delay
    setTimeout(() => setSnackbarOpen(false), severity === 'warning' || severity === 'success' ? 3000 : 6000);
  };

  const [selectedOption, setSelectedOption] = useState('Government');
  
  const handleButtonClick = (option) => {
    // Only change the selected option if it's not already selected
    if (selectedOption !== option) {
      setSelectedOption(option);
      reset(); // Reset the form when switching options
    }
  };
  const reset = () => {
    setSelectedGovernment(null); // Reset selected government
    setSelectedLoanType(null); // Reset selected loan type
    setSelectedCompanyName(null); // Reset selected company name
    setSelectedCompanyLoanType(null); // Reset selected company loan type
  
    // Reset all government loans
    setLoans((prevLoans) =>
      prevLoans.map(() => ({
        governmentName: '',
        loanType: '',
        loanAmount: '',
        monthlyPayment: '',
        paymentTerms: '',
        interest: '',
        penalty: '',
        totalLoans: '',
        totalpayments: '',
      }))
    );
  
    // Reset all company loans
    setInput1((prevCompanyLoans) =>
      prevCompanyLoans.map(() => ({
        companyName: '',
        companyLoanType: '',
        loanAmountc: '',
        monthlyPaymentc: '',
        paymentTermsc: '',
        interestc: '',
        penaltyc: '',
        totalLoansc: '',
        totalpaymentsc: '',
      }))
    );
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
              width: { xs: '80%', sm: '80%', md: '80%' },
              height: { xs: '80%', sm: '50%', md: '70%' },
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
              Add Loans
            </Typography>
            <Box sx={{ overscrollBehavior: 'contain' }}>

              <Box sx={{ display: 'flex', flexDirection: 'column', marginTop: 1, alignItems: 'center' }}>
                <Box sx={{ width: '60%' }}>
                  <Autocomplete

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
                      sx={{ width: '50%' }}
                      label="Date Start Point"
                      value={startDate}
                      onChange={(newValue) => setStartDate(newValue)}
                      renderInput={(params) => <TextField {...params} />}
                    />
                    <DatePicker
                      sx={{ width: '50%' }}
                      label="Date End Point"
                      value={endDate}
                      onChange={(newValue) => setEndDate(newValue)}
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </LocalizationProvider>
                </Box>
              </Box>

              <Box sx={{ marginTop: 2, display: 'flex', gap: 2, flexDirection: 'row', justifyContent: 'center', width: '100%' }}>
                <Button
                  variant={selectedOption === 'Government' ? 'contained' : 'outlined'}
                  color="primary"
                  onClick={() => handleButtonClick('Government')}
                  sx={{ marginLeft: 1, width: '25%' }}
                >
                  Government
                </Button>
                <Button
                  variant={selectedOption === 'Company' ? 'contained' : 'outlined'}
                  color="primary"
                  onClick={() => handleButtonClick('Company')}
                  sx={{ marginLeft: 1, width: '25%' }}
                >
                  Company
                </Button>
              </Box>
              {selectedOption === 'Government' && (
                <Box sx={{ width: '100%' }}>
                  <Box display="flex" sx={{ width: '100%', marginBottom: 1, marginTop: 2 }}>
                    <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                      Government Loans
                    </Typography>
                  </Box>

                  <Box sx={{ marginTop: 2, display: 'flex', gap: 2, flexDirection: 'column', justifyContent: 'center', width: '100%' }}>
                    {loans.map((item, index) => (
                      <Box key={index} sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
                          <Autocomplete
                            value={selectedGovernment}
                            onChange={(event, newValue) => {
                              setSelectedGovernment(newValue);
                              if (selectedLoanType && selectedLoanType.emp_government_id !== newValue?.emp_government_id) {
                                setSelectedLoanType(null);
                              }
                            }}
                            options={governmentNames}
                            getOptionLabel={(option) => option.emp_government_name || ""}
                            isOptionEqualToValue={(option, value) => option.emp_government_id === value.emp_government_id}
                            renderInput={(params) => (
                              <TextField {...params} label="Government Name" />
                            )}
                            sx={{ marginLeft: 1, width: '40%' }}
                          />

                          <Autocomplete
                            value={selectedLoanType}
                            onChange={(event, newValue) => {
                              handleInputChange(index, 'loanType', newValue);
                              setSelectedLoanType(newValue);
                            }}
                            options={loanTypes.filter(
                              (loan) => loan.emp_government_id === selectedGovernment?.emp_government_id
                            )}
                            getOptionLabel={(option) => option.loan_type_name || ""}
                            isOptionEqualToValue={(option, value) => option.loan_type_id === value.loan_type_id}
                            renderInput={(params) => (
                              <TextField {...params} label="Loan Type" />
                            )}
                            sx={{ marginLeft: 1, width: '40%' }}
                          />
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%' }}>
                          <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1, width: '100%' }}>
                            <TextField
                              label="Loan Amount"
                              placeholder="e.g. 10,000.00"
                              value={item.loanAmount}
                              onChange={(e) => handleInputChange(index, 'loanAmount', e.target.value)}
                              sx={{ marginTop: 1, marginLeft: 1, width: '40%' }}
                            />
                            <TextField
                              label="Monthly Payment / Monthly Amortization"
                              placeholder="e.g. 1,800"
                              value={item.monthlyPayment}
                              onChange={(e) => handleInputChange(index, 'monthlyPayment', e.target.value)}
                              sx={{ marginTop: 1, marginLeft: 1, width: '40%' }}
                            />
                          </Box>

                          <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1, width: '100%' }}>
                            <TextField
                              label="Months of Deduction / Payment Terms"
                              placeholder="e.g. 24"
                              value={item.paymentTerms}
                              onChange={(e) => handleInputChange(index, 'paymentTerms', e.target.value)}
                              sx={{ marginTop: 1, marginLeft: 1, width: '40%' }}
                            />
                            <TextField
                              label="Interest"
                              placeholder="e.g. 41.5"
                              value={item.interest}
                              onChange={(e) => handleInputChange(index, 'interest', e.target.value)}
                              sx={{ marginTop: 1, marginLeft: 1, width: '40%' }}
                            />
                          </Box>

                          <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1, width: '100%' }}>
                            <TextField
                              label="Penalty"
                              placeholder="e.g. 41.5"
                              onChange={(e) => handleInputChange(index, 'penalty', e.target.value)}
                              sx={{ marginTop: 1, marginLeft: 1, width: '40%' }}
                            />
                            <TextField
                              label="Total Loan"
                              placeholder="e.g. 12,000"
                              onChange={(e) => handleInputChange(index, 'totalLoans', e.target.value)}
                              sx={{ marginTop: 1, marginLeft: 1, width: '40%' }}
                            />
                          </Box>

                          <TextField
                            label="Total Payments"
                            placeholder="e.g. 12,000"
                            onChange={(e) => handleInputChange(index, 'totalpayments', e.target.value)}
                            sx={{ marginTop: 1, marginLeft: 1, width: '40%' }}
                          />

                          
                        </Box>
                        <Button
                            variant="contained"
                            onClick={() => handleRemoveGovementLoans(index)}
                            sx={{ marginLeft: 1, width: '25%' }}
                          >
                            Remove
                          </Button>
                      </Box>
                    ))}

                    <Button
                      variant="contained"
                      onClick={handleAddGovermentLoans}
                      sx={{ marginLeft: 1, width: '50%', marginBottom: 3 }}
                    >
                      Add Government Loans
                    </Button>
                  </Box>
                </Box>
              )}



              {selectedOption === 'Company' && (
                <Box>
                  <Box display="flex" sx={{ width: '100%', marginBottom: 1, marginTop: 2 }}>
                    <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                      Company Loans
                    </Typography>
                  </Box>

                  <Box sx={{ marginTop: 2, display: 'flex', gap: 2, flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                    {input1.map((item, index) => (
                      <Box key={index} sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
                          <Autocomplete
                            value={item.companyName}
                            onChange={(event, newValue) => {
                              handleInputChange1(index, 'companyName', newValue);
                              setSelectedCompanyName(newValue);
                            }}
                            options={companyNames}
                            getOptionLabel={(option) => option.company_loan_name || ""}
                            renderInput={(params) => <TextField {...params} label="Loan Name" />}
                            sx={{ marginLeft: 1, width: '40%' }}
                          />

                          <Autocomplete
                            value={item.companyLoanType}
                            onChange={(event, newValue) => {
                              handleInputChange1(index, 'companyLoanType', newValue);
                              setSelectedCompanyLoanType(newValue);
                            }}
                            options={companyLoanTypes}
                            getOptionLabel={(option) => option.loan_type_name || ""}
                            renderInput={(params) => <TextField {...params} label="Loan Type" />}
                            sx={{ marginLeft: 1, width: '40%' }}
                          />
                          </Box>
                          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%' }}>

                            <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1, width: '100%' }}>
                              <TextField
                                label="Loan Amount"
                                placeholder="e.g. 10,000.00"
                                value={item.loanAmount}
                                onChange={(e) => handleInputChange1(index, 'loanAmountc', e.target.value)}
                                sx={{ marginTop: 1, marginLeft: 1, width: '40%' }}
                              />
                              <TextField
                                label="Monthly Payment / Monthly Amortization"
                                placeholder="e.g. 1,800"
                                value={item.monthlyPayment}
                                onChange={(e) => handleInputChange1(index, 'monthlyPaymentc', e.target.value)}
                                sx={{ marginTop: 1, marginLeft: 1, width: '40%' }}
                              />
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1, width: '100%' }}>
                              <TextField
                                label="Months of Deduction / Payment Terms"
                                placeholder="e.g. 24"
                                value={item.paymentTerms}
                                onChange={(e) => handleInputChange1(index, 'paymentTermsc', e.target.value)}
                                sx={{ marginTop: 1, marginLeft: 1, width: '40%' }}
                              />
                              <TextField
                                label="Interest"
                                placeholder="e.g. 41.5"
                                value={item.interest}
                                onChange={(e) => handleInputChange1(index, 'interestc', e.target.value)}
                                sx={{ marginTop: 1, marginLeft: 1, width: '40%' }}
                              />
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1, width: '100%' }}>
                              <TextField
                                label="Penalty"
                                placeholder="e.g. 41.5"
                                onChange={(e) => handleInputChange1(index, 'penaltyc', e.target.value)}
                                sx={{ marginTop: 1, marginLeft: 1, width: '40%' }}
                              />
                              <TextField
                                label="Total Loan"
                                placeholder="e.g. 12,000"
                                onChange={(e) => handleInputChange1(index, 'totalLoansc', e.target.value)}
                                sx={{ marginTop: 1, marginLeft: 1, width: '40%' }}
                              />
                            </Box>

                            <TextField
                              label="Total Payments"
                              placeholder="e.g. 12,000"
                              onChange={(e) => handleInputChange1(index, 'totalpaymentsc', e.target.value)}
                              sx={{ marginTop: 1, marginLeft: 1, width: '40%' }}
                            />
                          </Box>

                          <Button
                            variant="contained"
                            onClick={() => handleRemoveCompanyLoans(index)}
                            sx={{ marginLeft: 1, width: '20%', width: '25%' }}
                          >
                            Remove
                          </Button>
                        
                      </Box>
                    ))}

                    <Button
                      variant="contained"
                      onClick={handleAddCompanyLoans}
                      sx={{ marginLeft: 1, width: '50%', marginBottom: 3 }}
                    >
                      Add Company Loans
                    </Button>
                  </Box>
                </Box>
              )}





              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button variant="contained" sx={{ fontSize: 12, fontWeight: 'bold' }} onClick={handleSubmit} >  Save  </Button>
                <Button variant="contained" sx={{ fontSize: 12, fontWeight: 'bold' }}>Cancel</Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Modal>

      {confirmClose && (
        <Portal>
          <Snackbar
            open={confirmClose}
            autoHideDuration={3000}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            sx={{
              zIndex: 1301,  // Ensures it appears on top
            }}
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
        </Portal>
      )}

      {/* Main Snackbar */}
      <Portal>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={snackbarSeverity === 'warning' || snackbarSeverity === 'success' ? 3000 : 6000} // Set duration based on severity
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          sx={{
            zIndex: 1301,  // Ensures it appears on top
          }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={snackbarSeverity}
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Portal>


    </>
  )
}
