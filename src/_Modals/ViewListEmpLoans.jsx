import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Modal, TextField, Paper, TableContainer,
  TableCell, TableHead, TableBody, TableRow, Button
} from '@mui/material';
import Table from '@mui/joy/Table';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

export default function ViewListEmpLoans({ onOpen, onClose, loansData = [], loansData1 = [],  companyLoans = [], empId, name }) {
  const [employeeLoansid, setEmployeeLoansid] = useState(null);
  const [deductionRows, setDeductionRows] = useState([]);
  const [activeLoanIndex, setActiveLoanIndex] = useState(null);

  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value || 0);

  const fetchEmployeeLoansid = async (id) => {
    try {
      const res = await axios.get(`http://localhost:8800/employee-table-loans-id/${id}`);
      setEmployeeLoansid(res.data);
    } catch (error) {
      console.error('Error fetching employee loans:', error);
    }
  };

  useEffect(() => {
    if (empId) fetchEmployeeLoansid(empId);
  }, [empId]);

  const generatePreviewTable = (beginning, amort, terms) => {
    let rows = [];
    let balance = parseFloat(beginning);
    const monthly = parseFloat(amort);
    const months = parseInt(terms);

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

  const handleCloseModal = () => {
    setDeductionRows([]);
    setActiveLoanIndex(null);
    onClose();
  };

  return (
    <Modal open={onOpen} onClose={handleCloseModal} closeAfterTransition>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', p: 2 }}>
        <Box sx={{
          backgroundColor: 'white',
          padding: 4,
          width: { xs: '90%', sm: '80%', md: '80%' },
          height: { xs: '90%', sm: '70%', md: '80%' },
          boxShadow: 24,
          borderRadius: 2,
          overflowY: 'auto',
        }}>
          <CloseIcon onClick={handleCloseModal} sx={{ cursor: 'pointer', float: 'right' }} />
          <Typography variant="h4" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 2 }}>
            Employee Loans
          </Typography>

          {/* Employee Info */}
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Employee Information</Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <TextField label="Employee ID" value={empId || 'N/A'} InputProps={{ readOnly: true }} fullWidth />
            <TextField label="Employee Name" value={name || 'N/A'} InputProps={{ readOnly: true }} fullWidth />
          </Box>

          {/* Loan Totals */}
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField
              label="Total Government Loans"
              value={employeeLoansid?.[0]?.government_loan_amount ? formatCurrency(employeeLoansid[0].government_loan_amount) : formatCurrency(0)}
              InputProps={{ readOnly: true }}
              fullWidth
            />
            <TextField
              label="Total Company Loans"
              value={employeeLoansid?.[0]?.company_loan_amount ? formatCurrency(employeeLoansid[0].company_loan_amount) : formatCurrency(0)}
              InputProps={{ readOnly: true }}
              fullWidth
            />
            <TextField
              label="Total Loans"
              value={employeeLoansid?.[0]?.total_loan_amount ? formatCurrency(employeeLoansid[0].total_loan_amount) : formatCurrency(0)}
              InputProps={{ readOnly: true }}
              fullWidth
            />
          </Box>

          {/* Government Loans */}
          {loansData.length > 0 && loansData.map((loan, index) => (
            <Box key={`gov-${index}`} sx={{ mt: 3, mb: 3, p: 2, border: '1px solid #ccc', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                Government Loan #{index + 1}
              </Typography>

              <Typography><strong>Loan Amount:</strong> {formatCurrency(loan.loan_amount)}</Typography>
              <Typography><strong>Monthly Amortization:</strong> {formatCurrency(loan.loan_monthly_payment)}</Typography>
              <Typography><strong>Period of Deduction:</strong> {loan.period_of_deduction || 'N/A'}</Typography>
              <Typography><strong>Payment Terms (Months):</strong> {loan.payment_terms}</Typography>
              <Typography><strong>Interest:</strong> {formatCurrency(loan.loan_interest_per_month)}</Typography>
              <Typography><strong>Penalty:</strong> {formatCurrency(loan.penalty)}</Typography>
              <Typography><strong>Total Loan:</strong> {formatCurrency(loan.total_loan)}</Typography>
              <Typography><strong>Total Payments (From Previous Employer):</strong> {formatCurrency(loan.total_payments_previous_employer)}</Typography>
              <Typography><strong>Beginning Balance:</strong> {formatCurrency(loan.beginning_balance)}</Typography>

              <Box sx={{ mt: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    if (activeLoanIndex === `gov-${index}`) {
                      setActiveLoanIndex(null);
                      setDeductionRows([]);
                    } else {
                      setActiveLoanIndex(`gov-${index}`);
                      setDeductionRows(generatePreviewTable(
                        loan.beginning_balance,
                        loan.loan_monthly_payment,
                        loan.payment_terms
                      ));
                    }
                  }}
                >
                  {activeLoanIndex === `gov-${index}` ? "Hide Deductions" : "Show Deductions"}
                </Button>
              </Box>

              {activeLoanIndex === `gov-${index}` && deductionRows.length > 0 && (
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
                      <TableRow>
                        <TableCell colSpan={2}><strong>Beginning Balance</strong></TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>
                          {(parseFloat(deductionRows[0]?.balance || 0) + parseFloat(deductionRows[0]?.amortization || 0)).toFixed(2)}
                        </TableCell>
                      </TableRow>
                      {deductionRows.map((row, i) => (
                        <TableRow key={i}>
                          <TableCell>{row.count}</TableCell>
                          <TableCell>{row.date}</TableCell>
                          <TableCell>{row.amortization}</TableCell>
                          <TableCell>{row.balance}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={2} />
                        <TableCell sx={{ fontWeight: 'bold' }}>
                          {deductionRows.reduce((acc, curr) => acc + parseFloat(curr.amortization || 0), 0).toFixed(2)}
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          ))}

          {/* Company Loans */}
          {loansData1.length > 0 && loansData1.map((loan1, index) => (
            <Box key={`com-${index}`} sx={{ mt: 3, mb: 3, p: 2, border: '1px solid #ccc', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                Company Loan #{index + 1}
              </Typography>

              <Typography><strong>Loan Amount:</strong> {formatCurrency(loan1.loan_amount)}</Typography>
              <Typography><strong>Monthly Amortization:</strong> {formatCurrency(loan1.loan_monthly_payment)}</Typography>
              <Typography><strong>Period of Deduction:</strong> {loan1.period_of_deduction || 'N/A'}</Typography>
              <Typography><strong>Payment Terms (Months):</strong> {loan1.payment_terms}</Typography>
              <Typography><strong>Interest:</strong> {formatCurrency(loan1.loan_interest_per_month)}</Typography>
              <Typography><strong>Penalty:</strong> {formatCurrency(loan1.penalty)}</Typography>
              <Typography><strong>Total Loan:</strong> {formatCurrency(loan1.total_loan)}</Typography>
              <Typography><strong>Total Payments (From Previous Employer):</strong> {formatCurrency(loan1.total_payments_previous_employer)}</Typography>
              <Typography><strong>Beginning Balance:</strong> {formatCurrency(loan1.beginning_balance)}</Typography>

              <Box sx={{ mt: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    if (activeLoanIndex === `com-${index}`) {
                      setActiveLoanIndex(null);
                      setDeductionRows([]);
                    } else {
                      setActiveLoanIndex(`com-${index}`);
                      setDeductionRows(generatePreviewTable(
                        loan1.beginning_balance,
                        loan1.loan_monthly_payment,
                        loan1.payment_terms
                      ));
                    }
                  }}
                >
                  {activeLoanIndex === `com-${index}` ? "Hide Deductions" : "Show Deductions"}
                </Button>
              </Box>

              {activeLoanIndex === `com-${index}` && deductionRows.length > 0 && (
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
                      <TableRow>
                        <TableCell colSpan={2}><strong>Beginning Balance</strong></TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>
                          {(parseFloat(deductionRows[0]?.balance || 0) + parseFloat(deductionRows[0]?.amortization || 0)).toFixed(2)}
                        </TableCell>
                      </TableRow>
                      {deductionRows.map((row, i) => (
                        <TableRow key={i}>
                          <TableCell>{row.count}</TableCell>
                          <TableCell>{row.date}</TableCell>
                          <TableCell>{row.amortization}</TableCell>
                          <TableCell>{row.balance}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={2} />
                        <TableCell sx={{ fontWeight: 'bold' }}>
                          {deductionRows.reduce((acc, curr) => acc + parseFloat(curr.amortization || 0), 0).toFixed(2)}
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          ))}
        </Box>
      </Box>
    </Modal>
  );
}
