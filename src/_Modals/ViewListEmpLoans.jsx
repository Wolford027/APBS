import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Modal, TextField, Paper, TableContainer,
  TableCell, TableHead, TableBody, TableRow, Button
} from '@mui/material';
import Table from '@mui/joy/Table';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

export default function ViewListEmpLoans({ onOpen, onClose, loansData = [], loansData1 = [], companyLoans = [], empId }) {
  const [employeeLoansid, setEmployeeLoansid] = useState(null);
  const [employeeLoansid1, setEmployeeLoansid1] = useState(null);
  const [releaseDays, setReleaseDays] = useState({});
  const [deductionRows, setDeductionRows] = useState([]);
  const [deductionCycle, setDeductionCycle] = useState(null);
  const [activeLoanIndex, setActiveLoanIndex] = useState(null);

  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value || 0);

  useEffect(() => {
    axios.get("http://localhost:8800/settings_payroll_2")
      .then((response) => {
        const data = response.data.settings || response.data;
        const releases = {};

        data.forEach(item => {
          const name = item.paysett2_name.replace(/\s/g, ''); // Remove spaces like "1stCycle"
          const value = Number(item.paysett2_release); // Convert VARCHAR to Number

          if (item.paysett2_value === 1 && !isNaN(value)) {
            releases[name] = value;
          }
        });

        console.log("✅ releaseDays object:", releases);
        setReleaseDays(releases);
      })
      .catch((error) => console.error("Error fetching release days:", error));
  }, []);

  const fetchEmployeeLoansid = async (emp_id) => {
    try {
      const res = await axios.get(`http://localhost:8800/employee-table-loans-id/${emp_id}`);
      setEmployeeLoansid(res.data);
    } catch (error) {
      console.error('Error fetching employee loans:', error);
    }
  };

  const fetchEmployeeLoansid1 = async (emp_id) => {
    try {
      const res = await axios.get(`http://localhost:8800/employee-table-loans-id/${emp_id}`);
      if (res.data.length > 0) {
        setEmployeeLoansid1(res.data[0]); // <- Access first row
      } else {
        setEmployeeLoansid1({}); // In case there's no data
      }
    } catch (error) {
      console.error('Error fetching employee loans:', error);
    }
  };

  useEffect(() => {
    if (empId) fetchEmployeeLoansid(empId);
    if (empId) fetchEmployeeLoansid1(empId);
  }, [empId]);

  const generatePreviewTable = (
    beginning,
    amort,
    terms,
    startDateStr,
    periodOfDeduction,
    releaseDays,
    penalty = 0,
    penalty_option = ""
  ) => {
    let balance = parseFloat(beginning);
    const monthly = parseFloat(amort);
    const paymentTerms = parseInt(terms);
    penalty = parseFloat(penalty) || 0;

    if (isNaN(balance) || isNaN(monthly) || isNaN(paymentTerms)) {
      console.error("Invalid numeric inputs:", { beginning, amort, terms });
      return [];
    }

    const rows = [{
      count: "Beginning Balance",
      date: "",
      amortization: "",
      balance: balance.toFixed(2),
    }];

    if (!startDateStr || typeof startDateStr !== "string" || !startDateStr.includes("-")) {
      console.error("Invalid startDate format:", startDateStr);
      return rows;
    }
    console.log("Period:", periodOfDeduction);
    console.log("Release Days:", releaseDays);

    const [monthName, yearStr] = startDateStr.split("-");
    const monthIndex = new Date(`${monthName} 1, 2000`).getMonth();
    const year = parseInt(yearStr);
    let currentDate = new Date(year, monthIndex);

    const getEndOfMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getValidDay = (year, month, day) => Math.min(day, getEndOfMonth(year, month));
    const formatDate = (date) =>
      `${String(date.getDate()).padStart(2, '0')}-${date.toLocaleString("en-US", { month: "short", year: "numeric" })}`;

    const dates = [];

    // 🗓️ Generate deduction dates
    while (dates.length < paymentTerms) {
      const y = currentDate.getFullYear();
      const m = currentDate.getMonth();

      if (periodOfDeduction === "1st Cycle") {
        const day = releaseDays['1stCycle'] ?? 15;
        dates.push(new Date(y, m, getValidDay(y, m, day)));
        currentDate.setMonth(m + 1);

      } else if (periodOfDeduction === "2nd Cycle") {
        const day = releaseDays['2ndCycle'] ?? getEndOfMonth(y, m);
        let ry = y, rm = m;
        if (day <= 15) {
          rm += 1;
          if (rm > 11) { rm = 0; ry += 1; }
        }
        dates.push(new Date(ry, rm, getValidDay(ry, rm, day)));
        currentDate.setMonth(m + 1);

      } else if (periodOfDeduction === "Monthly") {
        const day = releaseDays['Monthly'] ?? getEndOfMonth(y, m);
        dates.push(new Date(y, m, getValidDay(y, m, day)));
        currentDate.setMonth(m + 1);

      } else if (periodOfDeduction === "Both Cycle") {
        const firstRelease = releaseDays['1stCycle'] || 15;
        const secondRelease = releaseDays['2ndCycle'] || getEndOfMonth(y, m);

        // 1st release this month
        const validFirst = getValidDay(y, m, firstRelease);
        dates.push(new Date(y, m, validFirst));

        // 2nd release may fall on next month
        let ry = y, rm = m;
        if (secondRelease <= 15) {
          rm += 1;
          if (rm > 11) { rm = 0; ry += 1; }
        }
        const validSecond = getValidDay(ry, rm, secondRelease);
        dates.push(new Date(ry, rm, validSecond));

        currentDate.setMonth(m + 1);

      } else {
        console.warn("Unsupported periodOfDeduction:", periodOfDeduction);
        break;
      }
    }

    const trimmedDates = dates.slice(0, paymentTerms);

    trimmedDates.forEach((d, i) => {
      let payment = monthly;

      if (penalty_option === "Distributed") {
        payment += penalty / paymentTerms;
      } else if (penalty_option === "Add in 1st Payment" && i === 0) {
        payment += penalty;
      }

      if (balance < payment) payment = balance;
      balance -= payment;

      rows.push({
        count: i + 1,
        date: formatDate(d),
        amortization: payment.toFixed(2),
        balance: balance.toFixed(2),
      });
    });

    // ➕ Add Payment Terms (last penalty row)
    if (penalty_option === "Add Payment Terms" && balance > 0) {
      const lastDate = dates[dates.length - 1];
      const nextDate = new Date(lastDate.getFullYear(), lastDate.getMonth() + 1, 15);
      rows.push({
        count: paymentTerms + 1,
        date: formatDate(nextDate),
        amortization: balance.toFixed(2),
        balance: "0.00",
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
            <TextField label="Employee Name" value={employeeLoansid1?.full_name || 'N/A'} InputProps={{ readOnly: true }} fullWidth />
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
              <Typography>
                <strong>Payment Terms (Months):</strong>{' '}
                {loan.payment_terms}
                {loan.penalty_option === "Add Payment Terms" && (
                  <span> + 1 (penalty)</span>
                )}
              </Typography>

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
                    if (!releaseDays || !loan.startDate || !loan.period_of_deduction) {
                      alert("Missing loan data or settings.");
                      return;
                    }

                    const normalizedCycle = loan.period_of_deduction.replace(/\s+/g, "");

                    if (activeLoanIndex === `gov-${index}`) {
                      setActiveLoanIndex(null);
                      setDeductionRows([]);
                    } else {
                      setActiveLoanIndex(`gov-${index}`);
                      setDeductionRows(
                        generatePreviewTable(
                          loan.beginning_balance,
                          loan.loan_monthly_payment,
                          loan.payment_terms,
                          loan.startDate,
                          loan.period_of_deduction,
                           {
                            [normalizedCycle]: releaseDays[normalizedCycle],
                            ...releaseDays, // ✅ include all cycles for "Both Cycle"
                          },
                          loan.penalty,                                        // ✅ 7th arg
                          loan.penalty_option                                  // ✅ 8th arg
                        )
                      );
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
                    if (!releaseDays || !loan1.startDate || !loan1.period_of_deduction) {
                      alert("Missing settings or loan data.");
                      return;
                    }

                    const normalizedCycle = loan1.period_of_deduction.replace(/\s+/g, "");

                    if (activeLoanIndex === `com-${index}`) {
                      setActiveLoanIndex(null);
                      setDeductionRows([]);
                    } else {
                      setActiveLoanIndex(`com-${index}`);
                      setDeductionRows(
                        generatePreviewTable(
                          loan1.beginning_balance,
                          loan1.loan_monthly_payment,
                          loan1.payment_terms,
                          loan1.startDate,
                          loan1.period_of_deduction, // ✅ use loan value directly
                          {
                            [normalizedCycle]: releaseDays[normalizedCycle],
                            ...releaseDays, // ✅ include all cycles for "Both Cycle"
                          },
                          loan1.penalty,
                          loan1.penalty_option
                        )
                      );
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
