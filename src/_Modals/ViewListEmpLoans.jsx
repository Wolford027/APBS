import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import axios from 'axios';
import { Button, Modal, TextField, Autocomplete, Paper, TableCell, TableHead, TableBody, TableRow, TableContainer } from '@mui/material';
import Table from '@mui/joy/Table';
import CloseIcon from '@mui/icons-material/Close';
import Tooltip from '@mui/material/Tooltip';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const drawerWidth = 240;

export default function ViewListEmpLoans({ onOpen, onClose, loansData, empId }) {
  const [addallowance, setAddAllowance] = useState([]);
  // Log the received empId to ensure it's being passed correctly
  useEffect(() => {
    console.log('EmployeeBenefits - empId:', loansData.empId); // This will log the empId prop received from the parent component
  }, [loansData.empId]);

  useEffect(() => {
    console.log("Loans list:", loansData);  // Check state here
  }, [loansData]);

  // Fetch additional benefits when empId changes
  useEffect(() => {
    if (loansData.empId) {
      fetchEmployeeLoansid(loansData.empId);
    }
  }, [loansData.empId]); // Trigger fetch whenever empId changes


  const [employeeLoansid, setEmployeeLoansid] = useState(null); // Initialize state;
  const [loading, setLoading] = useState(true);

  const fetchEmployeeLoansid = async (id) => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8800/employee-table-loans-id/${id}`);
      setEmployeeLoansid(res.data);
      console.log('Fetched employee loans data:', res.data);
    } catch (error) {
      console.error('Error fetching employee loans:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Updated employeeEarningsid:', employeeLoansid);
  }, [employeeLoansid]);

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
  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setFilter('');
    onClose();

  };

  const [openModal, setOpenModal] = useState(false);

  const [filter, setFilter] = useState(''); // State to track the selected filter (Monthly/Annually)
  const [filteredData, setFilteredData] = useState([]); // State to store the filtered data
  const [data, setData] = useState([]); // State to store all fetched data

  // Fetch data based on the filter and empId

  const handleFilterChange = (event, newValue) => {
    console.log('Filter changed to:', newValue);
    setFilter(newValue); // Update filter state when a selection is made

    // If 'All' is selected, ensure no filtering by type on the backend
    if (newValue === 'All') {
      console.log('Showing all data');
    }
  };

  const formatCurrency = (value) => {
    const formattedAmount = new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(value);

    return formattedAmount || 'PHP 0.00';
  };

  useEffect(() => {
    console.log('Filtered Data:', filteredData);
    console.log('All Allowance Data:', addallowance);
  }, [filteredData, addallowance]);

  const generatePreviewTable = (beginning, amort, terms) => {
    let rows = [];
    let balance = parseFloat(beginning) || 0;
    const monthly = parseFloat(amort) || 0;
    const months = parseInt(terms) || 0;

    for (let i = 1; i <= months; i++) {
      rows.push({
        count: i,
        date: `Month ${i}`,
        amortization: monthly.toFixed(2),
        balance: (balance -= monthly).toFixed(2),
      });
    }

    return rows;
  };


  useEffect(() => {
    if (Array.isArray(loansData) && loansData.length > 0) {
      const loan = loansData[0];

      console.log("🧾 LOAN DATA:");
      console.log("Beginning Balance:", loan.beginningBalance);
      console.log("Monthly Amortization:", loan.monthlyPayment);
      console.log("Payment Terms:", loan.paymentTerms);

      if (
        loan.beginningBalance > 0 &&
        loan.monthlyPayment > 0 &&
        loan.paymentTerms > 0
      ) {
        const rows = generatePreviewTable(
          loan.beginningBalance,
          loan.monthlyPayment,
          loan.paymentTerms
        );
        setDeductionRows(rows);
      } else {
        console.warn("❌ Missing or zero values for generating deduction rows.");
      }
    }
  }, [loansData]);


  const [deductionRows, setDeductionRows] = useState([]);


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
              Employee Loans
            </Typography>
            <Box sx={{ overscrollBehavior: 'contain' }}>
              <Typography variant="h5" component="h2" sx={{ marginBottom: 2, fontWeight: 'bold', textAlign: 'left', }}>
                Employee Information
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1, justifyContent: 'center' }}>
                <TextField
                  label="Employee ID"
                  value={loansData.empId || 'N/A'} // Empty string if data is not yet loaded
                  inputProps={{ readOnly: true }}
                  sx={{ width: '20%', marginLeft: 1 }}
                />
                <TextField
                  label="Employee Name"
                  value={loansData.full_name || 'N/A'} // Empty string if data is not yet loaded
                  inputProps={{ readOnly: true }}
                  sx={{ width: '60%', marginLeft: 1 }}
                />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 2, justifyContent: 'center' }}>
                {employeeLoansid && employeeLoansid.length > 0 ? (  // Check if there is data
                  <>
                    <TextField
                      label="Total Goverment Loans"
                      value={employeeLoansid[0]?.government_loan_amount ? formatCurrency(employeeLoansid[0].government_loan_amount) : formatCurrency(0)}
                      inputProps={{ readOnly: true }}
                      sx={{ width: '27%', marginLeft: 1 }}
                    />
                    <TextField
                      label="Total Company Loans"
                      value={employeeLoansid[0]?.company_loan_amount ? formatCurrency(employeeLoansid[0].company_loan_amount) : formatCurrency(0)}
                      inputProps={{ readOnly: true }}
                      sx={{ width: '27%', marginLeft: 1 }}
                    />
                    <TextField
                      label="Total Loans"
                      value={employeeLoansid[0]?.total_loan_amount ? formatCurrency(employeeLoansid[0].total_loan_amount) : formatCurrency(0)}
                      inputProps={{ readOnly: true }}
                      sx={{ width: '25%', marginLeft: 1 }}
                    />
                  </>
                ) : (
                  <p>Loading employee earnings data...</p>  // Loading message while data is being fetched
                )}
              </Box>

              {Array.isArray(loansData) && loansData.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography>
                    <strong>Loan Amount:</strong> ₱
                    {(loansData[0].loanAmount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </Typography>
                  <Typography>
                    <strong>Monthly Amortization:</strong> ₱
                    {(loansData[0].monthlyPayment ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </Typography>
                  <Typography>
                    <strong>Period of Deduction:</strong> {loansData[0].periodOfDeduction ?? 'N/A'}
                  </Typography>
                  <Typography>
                    <strong>Payment Terms (Months):</strong> {loansData[0].paymentTerms ?? 'N/A'}
                  </Typography>
                  <Typography>
                    <strong>Interest:</strong> ₱
                    {(loansData[0].interest ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </Typography>
                  <Typography>
                    <strong>Penalty:</strong> ₱
                    {(loansData[0].penalty ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </Typography>
                  <Typography>
                    <strong>Total Loan:</strong> ₱
                    {(loansData[0].totalLoan ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </Typography>
                  <Typography>
                    <strong>Total Payments (From Previous Employer):</strong> ₱
                    {(loansData[0].totalPayments ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </Typography>
                  <Typography>
                    <strong>Beginning Balance:</strong> ₱
                    {(loansData[0].beginningBalance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </Typography>
                </Box>
              )}


              {deductionRows.length > 0 ? (
                <TableContainer component={Paper} sx={{ mt: 2 }}>
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
                      {/* 🔹 Beginning Balance Row */}
                      <TableRow>
                        <TableCell colSpan={2}><strong>Beginning Balance</strong></TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>
                          {deductionRows.length > 0
                            ? deductionRows[0]?.balance
                              ? (parseFloat(deductionRows[0].balance) + parseFloat(deductionRows[0].amortization)).toFixed(2)
                              : '0.00'
                            : '0.00'}
                        </TableCell>
                      </TableRow>

                      {/* 🔸 Actual deduction rows */}
                      {deductionRows.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>{row.count}</TableCell>
                          <TableCell>{row.date}</TableCell>
                          <TableCell>{row.amortization}</TableCell>
                          <TableCell>{row.balance}</TableCell>
                        </TableRow>
                      ))}

                      {/* 🔹 Total amortization row */}
                      <TableRow>
                        <TableCell colSpan={2} />
                        <TableCell sx={{ fontWeight: 'bold' }}>
                          {deductionRows.reduce(
                            (acc, curr) => acc + parseFloat(curr.amortization || 0),
                            0
                          ).toFixed(2)}
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography sx={{ mt: 2, color: 'gray' }}>
                  No deductions generated. Please check loan values.
                </Typography>
              )}


              <Box display="flex" sx={{ width: '100%', marginBottom: 1, marginTop: 2 }}>
                <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                  Company Loans
                </Typography>
              </Box>


              <Table hoverRow sx={{}} borderAxis="both">
                <thead>
                  <tr>
                    <th style={{ width: '8%' }}>
                      <Tooltip title="">
                        <span>Loan Name</span>
                      </Tooltip>
                    </th>
                    <th style={{ width: '5%' }}>
                      <Tooltip title="">
                        <span>Loan Type</span>
                      </Tooltip>
                    </th>
                    <th style={{ width: '5%' }}>
                      <Tooltip title="Loan Status">
                        <span>Status</span>
                      </Tooltip>
                    </th>
                    <th style={{ width: '10%' }}>
                      <Tooltip title="">
                        <span>Loan Amount</span>
                      </Tooltip>
                    </th>
                    <th style={{ width: '8%' }}>
                      <Tooltip title="">
                        <span>Interest per Month</span>
                      </Tooltip>
                    </th>
                    <th style={{ width: '8%' }}>
                      <Tooltip title="">
                        <span>Monthly Payment</span>
                      </Tooltip>
                    </th>
                    <th style={{ width: '8%' }}>
                      <Tooltip title="Payment Terms">
                        <span>Payment Terms</span>
                      </Tooltip>
                    </th>
                    <th style={{ width: '8%' }}>
                      <Tooltip title="Payment Terms Remaining">
                        <span>Remaining</span>
                      </Tooltip>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loansData && loansData.length > 0 ? (
                    loansData.map((loan, index) => (
                      <tr key={index}>
                        <td>{loan.company_loan_name || "N/A"}</td>
                        <td>{loan.company_loan_type || "N/A"}</td>
                        <td style={{ color: loan.company_loan_status === 'Active' ? 'green' : 'red' }}>
                          {loan.company_loan_status || "N/A"}
                        </td>
                        <td>{formatCurrency(loan.company_loan_amount)}</td>
                        <td>{formatCurrency(loan.company_loan_interest_per_month)}</td>
                        <td>{formatCurrency(loan.company_loan_monthly_payment)}</td>
                        <td>{loan.company_payment_terms || "N/A"}</td>
                        <td>{loan.company_payment_terms_remains || "N/A"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', color: 'gray' }}>
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>



              </Table>
            </Box>
          </Box>
        </Box>
      </Modal >
    </>
  );
}
