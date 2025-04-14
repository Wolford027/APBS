import React, { useState, useMemo, useEffect } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import axios from 'axios'
import { Button, Modal, TextField, Autocomplete, Snackbar, Alert, Portal, Divider, IconButton, TableCell, TableBody, TableRow, Table, TableHead, Paper, TableContainer } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import Tooltip from '@mui/material/Tooltip';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';  // Import date-fns for formatting
import DeleteIcon from '@mui/icons-material/Delete';


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
  const [selectedEmployee, setSelectedEmployee] = useState(null); // 👈 make it a single object


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
  const formattedStartDate = startDate ? format(startDate, 'MMMM-yyyy ') : '';
  const formattedEndDate = endDate ? format(endDate, 'MMMM-yyyy ') : '';


  const handleCloseModal = () => {
    const isFormFilled1 = isCompanyFormFilled();  // Check if the Company form is filled
    const isFormFilled2 = isGovernmentFormFilled(); // Check if the Government form is filled

    if (
      isFormFilled1 || isFormFilled2
    ) {
      setConfirmClose(true); // Show confirmation snackbar
    } else {
      reset(); // Reset the form
      onClose(); // Close the modal
    }
  };

  const handleConfirmClose = (confirm) => {
    if (confirm) {
      reset();
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


  const [statusLoans, setStatusLoans] = useState([]);
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



  const handleInputChange = (index, field, value) => {
    const updatedLoans = [...loans];
    updatedLoans[index][field] = value; // Update the specific field for the loan at 'index'
    setLoans(updatedLoans); // Update the loans state
  };
  const handleRemoveGovementLoans = (index) => {
    const updatedLoans = loans.filter((_, i) => i !== index);
    setLoans(updatedLoans);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedEmployee) {
      setSnackbarMessage("Please select an employee.");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }

    try {
      if (selectedOption === 'Government') {
        let hasGovLoanFailed = false;
        // For Government
        const updatedLoans = loans.map((loan) => ({
          ...loan,
          loanAmount,
          monthlyPayment: monthlyAmortization,
          paymentTerms,
          interest,
          penalty,
          penaltyOption,
          totalLoans: totalLoan,
          totalpayments: totalPayments,
          periodOfDeduction,
          beginningBalance,
          status: 'Active' || '',
          startDate: formattedStartDate,
          endDate: formattedEndDate,
        }));

        setLoans(updatedLoans); // Optional, if you want UI to reflect the update

        for (const loan of updatedLoans) {
          const loanPayload = {
            emp_id: selectedEmployee.emp_id,
            government_id: loan.governmentName?.emp_government_id || null,
            government_name: loan.governmentName?.emp_government_name || '',
            loan_type_id: loan.loanType?.loan_type_id || null,
            loan_type_name: loan.loanType?.loan_type_name || '',
            loan_amount: loan.loanAmount || 0,
            loan_monthly_payment: loan.monthlyPayment || 0,
            payment_terms: loan.paymentTerms || 0,
            loan_interest: loan.interest || 0,
            penalty: loan.penalty || 0,
            penalty_option: loan.penaltyOption || '',
            total_loan: loan.totalLoans || 0,
            total_payments_previous_employer: loan.totalpayments || 0,
            period_of_deduction: loan.periodOfDeduction || '',
            beginning_balance: loan.beginningBalance || 0,
            status: 'Active' || '',
            startDate: formattedStartDate,
            endDate: formattedEndDate,

          };
          console.log("📤 Sending government loan:", loanPayload);
          await axios.post("http://localhost:8800/AddGovernmentLoans", loanPayload);

        }

        if (hasGovLoanFailed) {
          setSnackbarMessage("Some government loans failed to save.");
          setSnackbarSeverity("error");
        } else {
          setSnackbarMessage("Government Loan Added Successfully.");
          setSnackbarSeverity("success");
          reset();
        }

      } else if (selectedOption === 'Company') {
        if (input1.length === 0) {
          setSnackbarMessage("Please add at least one company loan.");
          setSnackbarSeverity("warning");
          setSnackbarOpen(true);
          return;
        }

        // Step 1: Inject calculated preview values into input1 array
        const updatedInput1 = input1.map(item => ({
          ...item,
          loanAmount,
          monthlyPayment: monthlyAmortization,
          paymentTerms,
          interest,
          penalty,
          penaltyOption,
          totalLoans: totalLoan,
          totalpayments: totalPayments,
          periodOfDeduction,
          beginningBalance,
          status: 'Active' || '',
          startDate: formattedStartDate,
          endDate: formattedEndDate,

        }));

        // Optional if you want to update state:
        setInput1(updatedInput1);

        const companyLoanRequests = updatedInput1.map((item) => {
          const companyLoanData = {
            emp_id: selectedEmployee.emp_id,
            company_loan_name: item.companyName?.company_loan_name || '',
            company_loan_type: item.companyLoanType?.loan_type_name || '',
            loan_amount: item.loanAmount || 0,
            loan_monthly_payment: item.monthlyPayment || 0,
            payment_terms: item.paymentTerms || 0,
            loan_interest_per_month: item.interest || 0,
            penalty: item.penalty || 0,
            penalty_option: item.penaltyOption || '',
            total_loan: item.totalLoans || 0,
            total_payments_previous_employer: item.totalpayments || 0,
            period_of_deduction: item.periodOfDeduction || '',
            beginning_balance: item.beginningBalance || 0,
            status: 'Active' || '',
            startDate: formattedStartDate,
            endDate: formattedEndDate,


          };

          console.log("📤 Sending company loan:", companyLoanData);
          return axios.post("http://localhost:8800/AddCompanyLoans", companyLoanData);
        });


        const companyResponses = await Promise.allSettled(companyLoanRequests);
        const failedCompany = companyResponses.filter((res) => res.status === 'rejected');

        if (failedCompany.length > 0) {
          setSnackbarMessage("Some company loans failed to save.");
          setSnackbarSeverity("error");
        } else {
          setSnackbarMessage("Company Loans added successfully.");
          setSnackbarSeverity("success");
          reset();
        }
      }

      setSnackbarOpen(true);
    } catch (error) {
      console.error("Unexpected error occurred:", error);
      setSnackbarMessage("Unexpected error occurred. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  useEffect(() => {
    if (selectedEmployee && options.length > 0) {
      const matched = options.find(opt => opt.emp_id === selectedEmployee.emp_id);
      if (!matched) {
        setOptions((prev) => [...prev, selectedEmployee]);
      }
    }
  }, [options, selectedEmployee]);


  const [snackbarOpen, setSnackbarOpen] = useState(false); // For controlling snackbar visibility
  const [snackbarMessage, setSnackbarMessage] = useState(""); // For storing the snackbar message
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // For storing snackbar severity (e.g., 'warning', 'success', 'error')

  const [confirmClose, setConfirmClose] = useState(false); // For controlling the confirmation dialog state

  const [companyNames, setCompanyName] = useState([]); // Store loan names
  const [companyLoanTypes, setCompanyLoanTypes] = useState([]); // Store loan types
  const [selectedCompanyName, setSelectedCompanyName] = useState(null);
  const [selectedCompanyLoanType, setSelectedCompanyLoanType] = useState(null);
  const [governmentNames, setGovernmentNames] = useState([]);
  const [loanTypes, setLoanTypes] = useState([]);
  const [loans, setLoans] = useState([{ governmentName: '', loanType: '', loanAmount: '', monthlyPayment: '', paymentTerms: '', totalpayments: '', penalty: '', interest: '', totalLoans: '', beginningBalance: '' }]);
  const [input1, setInput1] = useState([{ companyName: '', companyLoanType: '', loanAmount: '', monthlyPayment: '', paymentTerms: '', totalpayments: '', penalty: '', interest: '', totalLoans: '', beginningBalance: '' }]); // Store company loan data

  const [selectedOption, setSelectedOption] = useState('Government');

  const isGovernmentFormFilled = () => {
    return (
      selectedGovernment !== null ||
      selectedLoanType !== null ||
      hasFilledLoanFields() ||
      loans.some((loan) =>
        loan.governmentName !== null || loan.loanType !== null
      )
    );
  };

  const isCompanyFormFilled = () => {
    return (
      selectedCompanyName !== null ||
      selectedCompanyLoanType !== null ||
      hasFilledLoanFields() ||
      input1.some((loan) =>
        loan.companyName !== null || loan.companyLoanType !== null
      )
    );
  };
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  const hasFilledLoanFields = () => {
    return (
      loanAmount > 0 ||
      monthlyAmortization > 0 ||
      paymentTerms > 0 ||
      totalPayments > 0 ||
      penalty > 0 ||
      (penalty > 0 && penaltyOption !== null) ||
      periodOfDeduction !== null
    );
  };

  const handleButtonClick = (option) => {
    if (!hasUserInteracted) {

      setSelectedOption(option);
      reset();
      return;
    }

    // 👇 Actual switching confirmation
    if (option === 'Company' && isGovernmentFormFilled()) {
      setConfirmFormSwitchSnackbar(true);
    } else if (option === 'Government' && isCompanyFormFilled()) {
      setConfirmFormSwitchSnackbar(true);
    } else {
      setSelectedOption(option);
      reset();
    }
  };


  const reset = () => {
    // Clear selected employee and date pickers
    setHasUserInteracted(false);
    setSelectedEmployee(null);
    setStartDate(null);
    setEndDate(null);

    // Reset government loans
    setLoans([
      {
        governmentName: null,
        loanType: null,
        loanAmount: 0,
        monthlyPayment: 0,
        paymentTerms: 0,
        interest: 0,
        penalty: 0,
        totalLoans: 0,
        totalpayments: 0,
        periodOfDeduction: null,
        penaltyOption: null,
        beginningBalance: 0,
      },
    ]);

    // Reset local state values
    setSelectedGovernment(null);
    setSelectedLoanType(null);
    setLoanAmount(0);
    setMonthlyAmortization(0);
    setPaymentTerms(0);
    setPenalty(0);
    setPenaltyOption(null);
    setPeriodOfDeduction(null);
    setTotalPayments(0);
    setDeductions([]);
    setOpenDeductionModal(false);
    setStartDate(null);
    setEndDate(null);

    // Reset company loans
    setInput1([
      {
        companyName: null,
        companyLoanType: null,

      },
    ]);
    setSelectedCompanyName(null);
    setSelectedCompanyLoanType(null);

  };


  const [confirmDeleteSnackbar, setConfirmDeleteSnackbar] = useState(false); // For delete confirmation prompt
  const [deleteIndex, setDeleteIndex] = useState(null);  // Track the index of the loan to delete

  const handleConfirmDelete = (confirm) => {
    if (confirm && deleteIndex !== null) {
      // Remove the form at the specified index
      setLoans((prevLoans) => prevLoans.filter((_, idx) => idx !== deleteIndex));
      setInput1((prevLoans) => prevLoans.filter((_, idx) => idx !== deleteIndex));
      setSnackbarMessage('Loan removed successfully.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    }
    setConfirmDeleteSnackbar(false);  // Close the delete confirmation Snackbar
    setDeleteIndex(null);  // Clear the index after action
  };

  const [confirmFormSwitchSnackbar, setConfirmFormSwitchSnackbar] = useState(false);  // For form switch prompt
  const handleConfirmFormSwitch = (proceed) => {
    if (proceed) {
      setSelectedOption(selectedOption === 'Government' ? 'Company' : 'Government');
      reset(); // Reset form data after switching

    }
    setConfirmFormSwitchSnackbar(false); // Close the Snackbar
  };

  const [loanAmount, setLoanAmount] = useState(0);
  const [monthlyAmortization, setMonthlyAmortization] = useState(0);
  const [paymentTerms, setPaymentTerms] = useState(0);
  const [penalty, setPenalty] = useState(0);
  const [periodOfDeduction, setPeriodOfDeduction] = useState();
  const interest = useMemo(() => (monthlyAmortization * paymentTerms) - loanAmount, [monthlyAmortization, paymentTerms, loanAmount]);
  const [totalPayments, setTotalPayments] = useState(0);
  const [penaltyOption, setPenaltyOption] = useState(null);
  const [deductions, setDeductions] = useState([]);

  useEffect(() => {
    if (penalty === 0) {
      setPenaltyOption(null);
    }
  }, [penalty]);

  const totalLoan = useMemo(() => loanAmount + interest + penalty, [loanAmount, interest, penalty]);
  const beginningBalance = useMemo(() => totalLoan - totalPayments, [totalLoan, totalPayments]);

  const generateDeductions = () => {
    let balance = beginningBalance;
    let rows = [];

    let date = new Date(startDate); // 👈 Start from selected start date
    const dates = [];

    rows.push({
      count: "Beginning Balance",
      date: "",
      amortization: "",
      balance: beginningBalance.toFixed(2),
    });

    const getEndOfMonth = (year, month) => new Date(year, month + 1, 0).getDate();

    while (dates.length < paymentTerms) {
      if (periodOfDeduction === "1st") {
        dates.push(new Date(date.getFullYear(), date.getMonth(), 15));
        date.setMonth(date.getMonth() + 1);
      } else if (periodOfDeduction === "2nd") {
        const endDay = getEndOfMonth(date.getFullYear(), date.getMonth());
        dates.push(new Date(date.getFullYear(), date.getMonth(), endDay));
        date.setMonth(date.getMonth() + 1);
      } else {
        dates.push(new Date(date.getFullYear(), date.getMonth(), 15));
        const endDay = getEndOfMonth(date.getFullYear(), date.getMonth());
        dates.push(new Date(date.getFullYear(), date.getMonth(), endDay));
        date.setMonth(date.getMonth() + 1);
      }
    }

    const trimmedDates = dates.slice(0, paymentTerms);

    trimmedDates.forEach((d, i) => {
      let payment = monthlyAmortization;

      if (penaltyOption === "Distributed") {
        payment += penalty / paymentTerms;
      } else if (penaltyOption === "Add in 1st Payment" && i === 0) {
        payment += penalty;
      }

      if (balance < payment) payment = balance;
      balance -= payment;

      const deductionDate = `${d.getDate()}-${d.toLocaleString("en-US", { month: "short", year: "numeric" })}`;

      rows.push({
        count: i + 1,
        date: deductionDate,
        amortization: payment.toFixed(2),
        balance: balance.toFixed(2),
      });
    });

    // Add extra payment if using "Add Payment Terms"
    if (penaltyOption === "Add Payment Terms" && balance > 0) {
      const lastDate = dates[dates.length - 1];
      const nextDate = new Date(lastDate.getFullYear(), lastDate.getMonth() + 1, 15);
      const formattedDate = `${nextDate.getDate()}-${nextDate.toLocaleString("en-US", { month: "short", year: "numeric" })}`;

      rows.push({
        count: paymentTerms + 1,
        date: formattedDate,
        amortization: balance.toFixed(2),
        balance: "0.00",
      });
    }

    setDeductions(rows);
  };

  useEffect(() => {
    if (interest < 0) {
      setSnackbarMessage("Interest cannot be negative. Please check your loan amount and monthly amortization.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  }, [interest]);


  const totalAmortization = useMemo(() => {
    return deductions.reduce((total, row) => total + parseFloat(row.amortization || 0), 0);
  }, [deductions]);

  const [openDeductionModal, setOpenDeductionModal] = useState(false);
  const getVisibleDeductions = (deductions) => {
    const visible = [];
    for (let i = 0; i < deductions.length; i++) {
      visible.push(deductions[i]);
      if (parseFloat(deductions[i].balance) === 0) break;
    }
    return visible;
  };

  const visibleDeductions = getVisibleDeductions(deductions);
  const govPreviewLoan = async () => {
    const isGovLoanValid =
      selectedEmployee &&
      (
        loans[0].governmentName ||
        input1[0].companyName ||
        loans[0].loanType ||
        input1[0].companyLoanType
      ) &&
      loanAmount > 0 &&
      monthlyAmortization > 0 &&
      paymentTerms > 0 &&
      periodOfDeduction;

    const isPenaltyValid = penalty === 0 || (penalty > 0 && penaltyOption);

    if (!isGovLoanValid || !isPenaltyValid) {
      return false;
    }

    try {
      // Check for duplicates in all loan entries
      for (const loan of loans) {
        const res = await axios.get("http://localhost:8800/CheckDuplicateGovernmentLoan", {
          params: {
            emp_id: selectedEmployee.emp_id,
            government_id: loan.governmentName?.emp_government_id || null,
            loan_type_id: loan.loanType?.loan_type_id || null,
          }
        });

        if (res.data.exists) {
          setSnackbarMessage(`Duplicate found: ${loan.governmentName?.emp_government_name} - ${loan.loanType?.loan_type_name}`);
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
          return false;
        }
      }
    } catch (error) {
      console.error("Error checking duplicate loan:", error);
      setSnackbarMessage("Failed to check duplicates. Try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return false;
    }

    return true;
  };

  useEffect(() => {
    if (startDate && paymentTerms && periodOfDeduction) {
      let totalPeriods = paymentTerms;

      // Add 1 term if penaltyOption is "Add Payment Terms"
      if (penaltyOption === "Add Payment Terms") {
        totalPeriods += 1;
      }

      // If both (2 deductions per month), then half the months needed
      const monthsNeeded = periodOfDeduction === "both" ? Math.ceil(totalPeriods / 2) : totalPeriods;

      const newEndDate = new Date(startDate);
      newEndDate.setMonth(startDate.getMonth() + monthsNeeded - 1); // Subtract 1 because start counts as month 1

      setEndDate(newEndDate);
    }
  }, [startDate, paymentTerms, periodOfDeduction, penaltyOption]);


  return (
    <>

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
              height: { xs: '90%', sm: '50%', md: '80%' },
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
                    value={selectedEmployee}
                    onChange={(event, newValue) => setSelectedEmployee(newValue)}
                    options={options}
                    getOptionLabel={(option) => option?.label || ''} // safely handle undefined
                    isOptionEqualToValue={(option, value) => option.emp_id === value?.emp_id}
                    renderInput={(params) => <TextField {...params} label="Select Employee" />}
                    sx={{ width: '100%' }}
                  />

                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: 2, gap: 2, width: '60%' }}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      views={['year', 'month']}
                      label="Month Start Point"
                      minDate={new Date(new Date().getFullYear(), new Date().getMonth(), 1)} // 🔒 disables months before current
                      maxDate={new Date('2100-12-31')}
                      value={startDate}
                      onChange={(newValue) => setStartDate(newValue)}
                      renderInput={(params) => <TextField {...params} sx={{ width: '50%' }} />}
                    />
                    <DatePicker
                      views={['year', 'month']}
                      label="Month End Point"
                      maxDate={new Date('2100-12-31')}
                      value={endDate}
                      disabled // 👈 This locks the entire DatePicker
                      onChange={(newValue) => setEndDate(newValue)} // Will no longer trigger
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          sx={{ width: '50%' }}
                        />
                      )}
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
                    {loans.map((loan, index) => (
                      <Box
                        key={index}
                        sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}
                      >
                        {/* Add a horizontal line (Divider) before each section except the first */}
                        {index !== 0 && <Divider sx={{ my: 2 }} />}

                        <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'center', }} >
                          <Autocomplete
                            value={loan.governmentName ?? null}// Use the state for this particular loan entry
                            onChange={(event, newValue) => {
                              handleInputChange(index, 'governmentName', newValue); // Update the government name
                              setHasUserInteracted(true);
                              if (
                                selectedLoanType &&
                                selectedLoanType.emp_government_id !== newValue?.emp_government_id
                              ) {
                                setSelectedLoanType(null); // Clear the loan type if the government changes
                              }
                            }}

                            options={governmentNames}
                            getOptionLabel={(option) => option.emp_government_name || ''}
                            isOptionEqualToValue={(option, value) =>
                              option.emp_government_id === value.emp_government_id
                            }
                            renderInput={(params) => (
                              <TextField {...params} label="Government Name" />
                            )}
                            sx={{ marginLeft: 1, width: '40%' }}
                          />

                          <Autocomplete
                            value={loan.loanType ?? null} // Use the state for this particular loan entry
                            onChange={(event, newValue) => {
                              handleInputChange(index, 'loanType', newValue); // Update the loan type for this loan entry
                              setHasUserInteracted(true);
                            }}
                            options={loanTypes.filter(
                              (loanType) =>
                                loanType.emp_government_id === loan.governmentName?.emp_government_id
                            )}
                            getOptionLabel={(option) => option.loan_type_name || ''}
                            isOptionEqualToValue={(option, value) =>
                              option.loan_type_id === value.loan_type_id
                            }
                            renderInput={(params) => <TextField {...params} label="Loan Type" />}
                            sx={{ marginLeft: 1, width: '40%' }}
                          />
                        </Box>

                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            width: '100%',
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'row',
                              marginTop: 1,
                              width: '100%',
                              justifyContent: 'center',
                            }}
                          >
                            <TextField label="Loan Amount" type="number" value={loanAmount} onChange={(e) => {
                              setLoanAmount(parseFloat(e.target.value));
                              setHasUserInteracted(true); // 👈 ADD THIS
                            }}
                              sx={{ marginTop: 1, marginLeft: 1, width: '26%' }} />
                            <TextField label="Monthly Amortization" type="number" value={monthlyAmortization} onChange={(e) => setMonthlyAmortization(parseFloat(e.target.value))} sx={{ marginTop: 1, marginLeft: 1, width: '26%' }} />
                            <Autocomplete
                              sx={{ marginLeft: 1, width: '27%', marginTop: 1 }}
                              options={["1st", "2nd", "both"]}
                              value={periodOfDeduction}
                              onChange={(event, newValue) => setPeriodOfDeduction(newValue)}
                              renderInput={(params) => <TextField {...params} label="Period of Deduction" />}
                            />
                          </Box>

                          <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1, width: '100%', justifyContent: 'center' }} >
                            <TextField label="Payment Terms" type="number" value={paymentTerms} onChange={(e) => setPaymentTerms(parseInt(e.target.value))} sx={{ marginTop: 1, marginLeft: 1, width: '19.7%' }} />
                            <TextField label="Penalty" type="number" value={penalty} onChange={(e) => setPenalty(parseFloat(e.target.value))} sx={{ marginTop: 1, marginLeft: 1, width: '19.5%' }} />
                            <Autocomplete
                              sx={{ marginTop: 1, marginLeft: 1, width: '19.7%' }}
                              options={["Distributed", "Add in 1st Payment", "Add Payment Terms"]}
                              value={penaltyOption}
                              onChange={(event, newValue) => setPenaltyOption(newValue)}
                              renderInput={(params) => <TextField {...params} label="Penalty Option" />}
                              disabled={penalty === 0}
                            />
                            <TextField label="Total Payments (From Previous Employer)" type="number" value={totalPayments} onChange={(e) => setTotalPayments(parseFloat(e.target.value))} sx={{ marginTop: 1, marginLeft: 1, width: '19.5%' }} />
                          </Box>

                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'row',
                              marginTop: 1,
                              width: '100%',
                              justifyContent: 'center',

                            }}
                          >
                            <TextField
                              label="Interest"
                              value={interest.toFixed(2)}
                              InputProps={{ readOnly: true, }} variant="outlined"
                              sx={{ marginTop: 1, marginLeft: 1, width: '26%' }}
                            />

                            <TextField
                              label="Total Loan"
                              value={totalLoan.toFixed(2)}
                              InputProps={{ readOnly: true, }} variant="outlined"
                              sx={{ marginTop: 1, marginLeft: 1, width: '26%' }}
                            />

                            <TextField
                              label="Beginning Balance"
                              value={beginningBalance.toFixed(2)}
                              InputProps={{ readOnly: true, }} variant="outlined"
                              sx={{ marginTop: 1, marginLeft: 1, width: '27%' }}
                            />

                          </Box>

                        </Box>

                      </Box>
                    ))}

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

                  <Box sx={{ marginTop: 2, display: 'flex', gap: 2, flexDirection: 'column', justifyContent: 'center', width: '100%' }}>
                    {input1.map((loan, index) => (
                      <Box key={index} sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                        {index !== 0 && <Divider sx={{ my: 2 }} />}

                        <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'center' }}>
                          <Autocomplete
                            value={loan.companyName ?? null}
                            onChange={(event, newValue) => {
                              handleInputChange1(index, 'companyName', newValue);
                              setSelectedCompanyName(newValue);
                              setHasUserInteracted(true);
                            }}
                            options={companyNames}
                            getOptionLabel={(option) => option.company_loan_name || ''}
                            isOptionEqualToValue={(option, value) =>
                              option.company_loan_name === value?.company_loan_name
                            }
                            renderInput={(params) => <TextField {...params} label="Company Loan Name" />}
                            sx={{ marginLeft: 1, width: '40%' }}
                          />

                          <Autocomplete
                            value={loan.companyLoanType ?? null}
                            onChange={(event, newValue) => {
                              handleInputChange1(index, 'companyLoanType', newValue); // 👈 update the correct loan item
                              setSelectedCompanyLoanType(newValue);
                              setHasUserInteracted(true);
                            }}

                            options={companyLoanTypes}
                            getOptionLabel={(option) => option.loan_type_name || ''}
                            isOptionEqualToValue={(option, value) =>
                              option.loan_type_name === value?.loan_type_name
                            }
                            renderInput={(params) => <TextField {...params} label="Loan Type" />}
                            sx={{ marginLeft: 1, width: '40%' }}
                          />
                        </Box>

                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            width: '100%',
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'row',
                              marginTop: 1,
                              width: '100%',
                              justifyContent: 'center',
                            }}
                          >
                            <TextField label="Loan Amount" type="number" value={loanAmount} onChange={(e) => {
                              setLoanAmount(parseFloat(e.target.value));
                              setHasUserInteracted(true); // 👈 ADD THIS
                            }}
                              sx={{ marginTop: 1, marginLeft: 1, width: '26%' }} />
                            <TextField label="Monthly Amortization" type="number" value={monthlyAmortization} onChange={(e) => setMonthlyAmortization(parseFloat(e.target.value))} sx={{ marginTop: 1, marginLeft: 1, width: '26%' }} />
                            <Autocomplete
                              sx={{ marginLeft: 1, width: '27%', marginTop: 1 }}
                              options={["1st", "2nd", "both"]}
                              value={periodOfDeduction}
                              onChange={(event, newValue) => setPeriodOfDeduction(newValue)}

                              renderInput={(params) => <TextField {...params} label="Period of Deduction" />}
                            />
                          </Box>

                          <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1, width: '100%', justifyContent: 'center' }} >
                            <TextField label="Payment Terms" type="number" value={paymentTerms} onChange={(e) => setPaymentTerms(parseInt(e.target.value))} sx={{ marginTop: 1, marginLeft: 1, width: '19.7%' }} />
                            <TextField label="Penalty" type="number" value={penalty} onChange={(e) => setPenalty(parseFloat(e.target.value))} disabled={selectedOption === 'Company'} sx={{ marginTop: 1, marginLeft: 1, width: '19.5%' }} />
                            <Autocomplete
                              sx={{ marginTop: 1, marginLeft: 1, width: '19.7%' }}
                              options={["Distributed", "Add in 1st Payment", "Add Payment Terms"]}
                              value={penaltyOption}
                              onChange={(event, newValue) => setPenaltyOption(newValue)}
                              renderInput={(params) => <TextField {...params} label="Penalty Option" />}
                              disabled={penalty === 0}
                            />
                            <TextField
                              label="Total Payments (From Previous Employer)"
                              type="number"
                              value={totalPayments}
                              onChange={(e) => setTotalPayments(parseFloat(e.target.value))}
                              disabled={selectedOption === 'Company'}
                              sx={{ marginTop: 1, marginLeft: 1, width: '19.5%' }}
                            />
                          </Box>

                          <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1, width: '100%', justifyContent: 'center', }} >
                            <TextField
                              label="Interest"
                              value={interest.toFixed(2)}
                              InputProps={{ readOnly: true, }} variant="outlined"
                              sx={{ marginTop: 1, marginLeft: 1, width: '26%' }}
                            />

                            <TextField
                              label="Total Loan"
                              value={totalLoan.toFixed(2)}
                              InputProps={{ readOnly: true, }} variant="outlined"
                              sx={{ marginTop: 1, marginLeft: 1, width: '26%' }}
                            />

                            <TextField
                              label="Beginning Balance"
                              value={beginningBalance.toFixed(2)}
                              InputProps={{ readOnly: true, }} variant="outlined"
                              sx={{ marginTop: 1, marginLeft: 1, width: '27%' }}
                            />

                          </Box>

                        </Box>

                      </Box>
                    ))}
                  </Box>

                </Box>
              )}

              <Box display="flex" justifyContent="flex-end" gap={2} sx={{ marginTop: 2 }}>
                {/*<Button  variant="contained" color="primary" sx={{ fontSize: 12, fontWeight: 'bold' }}  onClick={handleSubmit}  >  Save  </Button>*/}

                <Button
                  variant="contained"
                  color="error"
                  sx={{ fontSize: 12, fontWeight: 'bold' }}
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  sx={{ fontSize: 12, fontWeight: 'bold' }}
                  onClick={async () => {
                    if (interest < 0) {
                      setSnackbarMessage("Interest cannot be negative. Please check your loan amount and monthly amortization.");
                      setSnackbarSeverity("error");
                      setSnackbarOpen(true);
                      return;
                    }

                    const isValid = await govPreviewLoan(); // 👈 Async check for validity and duplicates

                    if (!isValid) {
                      setSnackbarMessage("Please fill empty fields or check for duplicate loan.");
                      setSnackbarSeverity("warning");
                      setSnackbarOpen(true);
                      return;
                    }

                    generateDeductions();
                    setOpenDeductionModal(true);
                  }}
                >
                  Loan Preview
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Modal>

      <Modal open={openDeductionModal} onClose={() => setOpenDeductionModal(false)}>
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1300,
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: 700,
              maxHeight: '90vh',
              bgcolor: 'background.paper',
              boxShadow: 24,
              borderRadius: 2,
              p: 3,
              overflowY: 'auto',
              position: 'relative',
            }}
          >
            <IconButton
              onClick={() => setOpenDeductionModal(false)}
              sx={{ position: 'absolute', top: 10, right: 10 }}
            >
              <CloseIcon />
            </IconButton>

            <Typography variant="h4" gutterBottom><strong>Loans Preview</strong></Typography>

            <Box sx={{ mb: 2 }}>
              {selectedOption === 'Government' ? (
                loans.map((loan, index) => (
                  <Box key={index}>
                    <Typography>
                      <strong>Fullname:</strong> {selectedEmployee ? `${selectedEmployee.f_name} ${selectedEmployee.l_name}` : 'N/A'}
                    </Typography>
                    <Typography>
                      <strong>Government Name:</strong> {loan.governmentName?.emp_government_name || 'N/A'}
                    </Typography>
                    <Typography>
                      <strong>Loan Type:</strong> {loan.loanType?.loan_type_name || 'N/A'}
                    </Typography>
                  </Box>
                ))
              ) : (
                input1.map((loan, index) => (
                  <Box key={index}>
                    <Typography>
                      <strong>Fullname:</strong> {selectedEmployee ? `${selectedEmployee.f_name} ${selectedEmployee.l_name}` : 'N/A'}
                    </Typography>
                    <Typography>
                      <strong>Company Loan Name:</strong> {loan.companyName?.company_loan_name || 'N/A'}
                    </Typography>
                    <Typography>
                      <strong>Loan Type:</strong> {loan.companyLoanType?.loan_type_name || 'N/A'}
                    </Typography>
                  </Box>
                ))
              )}
              <Typography><strong>Loan Amount:</strong> ₱{loanAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Typography>
              <Typography><strong>Monthly Amortization:</strong> ₱{monthlyAmortization.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Typography>
              <Typography><strong>Period of Deduction:</strong> {periodOfDeduction}</Typography>
              <Typography><strong>Payment Terms (Months):</strong> {paymentTerms}</Typography>
              <Typography><strong>Interest:</strong> ₱{interest.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Typography>
              <Typography><strong>Penalty:</strong> ₱{(penalty || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Typography>
              <Typography><strong>Total Loan:</strong> ₱{totalLoan.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Typography>
              <Typography><strong>Total Payments(From Previous Employer):</strong> ₱{totalPayments.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Typography>
              <Typography><strong>Beginning Balance:</strong> ₱{beginningBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Typography>
              <Typography>
                <strong>Date Start:</strong> {formattedStartDate || 'N/A'}
              </Typography>

              <Typography>
                <strong>Date End:</strong> {formattedEndDate || 'N/A'}
              </Typography>

            </Box>

            {deductions.length > 0 && (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell># of Deduction</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Amortization</TableCell>
                      <TableCell>Balance</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {visibleDeductions.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.count}</TableCell>
                        <TableCell>{row.date}</TableCell>
                        <TableCell>{row.amortization}</TableCell>
                        <TableCell>{row.balance}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={2} />
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        {visibleDeductions
                          .reduce((acc, curr) => acc + parseFloat(curr.amortization || 0), 0)
                          .toFixed(2)}
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button variant="contained" color="error" onClick={() => setOpenDeductionModal(false)}>Cancel</Button>
              <Button variant="contained" color="success" onClick={handleSubmit}>Save</Button>
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


      {/* Confirmation Snackbar for Delete Action */}
      {confirmDeleteSnackbar && (
        <Portal>
          <Snackbar
            open={confirmDeleteSnackbar}
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
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => handleConfirmDelete(true)}  // Proceed with deletion
                  >
                    Yes
                  </Button>
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => handleConfirmDelete(false)}  // Cancel deletion
                  >
                    No
                  </Button>
                </>
              }
            >
              Are you sure you want to remove this? The data filled will not be saved.
            </Alert>
          </Snackbar>
        </Portal>
      )}


      <Portal>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={snackbarSeverity === 'warning' || snackbarSeverity === 'success' ? 3000 : 6000}  // Set duration based on severity
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
      {confirmFormSwitchSnackbar && (
        <Portal>
          <Snackbar
            open={confirmFormSwitchSnackbar}
            autoHideDuration={3000}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            sx={{ zIndex: 1301 }}
          >
            <Alert
              severity="warning"
              action={
                <>
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => handleConfirmFormSwitch(true)}  // Proceed with form switch
                  >
                    Yes
                  </Button>
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => handleConfirmFormSwitch(false)}  // Cancel form switch
                  >
                    No
                  </Button>
                </>
              }
            >
              Are you sure you want to switch forms? The data filled will not be saved.
            </Alert>
          </Snackbar>
        </Portal>
      )}



      <Portal>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={snackbarSeverity === 'warning' || snackbarSeverity === 'success' ? 3000 : 6000}  // Set duration based on severity
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
