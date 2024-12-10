import React from "react";
import axios from "axios";
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Avatar } from "@mui/material";

const PayslipFormat = () => {
  const payslipData = {
    employeeName: "BISAIN, DAISYREI",
    employeeNumber: "123456",
    payrollPeriod: "April 16-30 2024",
    bankName: "UB",
    payoutDate: "Thu May 09 2024 12:00:00",
    taxableEarnings: "₱8,163.79",
    grossEarnings: "₱10,163.79",
    netPay: "₱9,539.00",
  };

  const GeneratePDF = async () => {
    try {
      const response = await axios.post('http://localhost:8800/generate-pdf', null, {
        responseType: 'blob',
      })

      if (response.status === 200) {
        const blob = response.data;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'payslip.pdf';
        link.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Failed to generate PDF');
      }
    } catch (err) {
      console.error('Error generating PDF:', err);
    }
  }

  return (
    <Box sx={{padding: 5}}>
      <Box textAlign="center" mb={2}>
        <Button sx={{display: 'block', '@media print': { display: 'none'}, }} onClick={GeneratePDF}>Download PDf</Button>
        <Avatar src="" sx={{ width: '150px', height: '150px'}} />
        <Typography variant="h4" fontWeight="bold">
          Company Name
        </Typography>
        <Typography variant="subtitle1">Company Address</Typography>
      </Box>
      <Box mb={3}>
        <Typography variant="subtitle2"><strong>Employee Name:</strong> {payslipData.employeeName}</Typography>
        <Typography variant="subtitle2"><strong>Employee Number:</strong> {payslipData.employeeNumber}</Typography>
        <Typography variant="subtitle2"><strong>Payroll Period:</strong> {payslipData.payrollPeriod}</Typography>
        <Typography variant="subtitle2"><strong>Bank Name:</strong> {payslipData.bankName}</Typography>
        <Typography variant="subtitle2"><strong>Payout Date:</strong> {payslipData.payoutDate}</Typography>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Category</strong></TableCell>
              <TableCell><strong>Amount</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Taxable Earnings</TableCell>
              <TableCell>{payslipData.taxableEarnings}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Total Gross Earnings</TableCell>
              <TableCell>{payslipData.grossEarnings}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Net Pay</TableCell>
              <TableCell>{payslipData.netPay}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <Box textAlign="right" mt={3}>
        <Typography variant="subtitle1"><strong>Net Pay This Payroll:</strong> {payslipData.netPay}</Typography>
      </Box>
    </Box>
  );
};

export default PayslipFormat;
