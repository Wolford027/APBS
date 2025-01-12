import React from "react";
import axios from "axios";
import { Box, Typography, TableBody, TableCell, TableContainer, TableHead, TableRow, Button } from "@mui/material";
import { Table }from "@mui/joy";

const PayslipFormat = () => {
  const payslipData = {
    employeeName: "BISAIN, DAISYREI",
    employeeNumber: "123456",
    payrollPeriod: "April 16-30 2024",
    bankName: "BDO",
    payoutDate: "Thu May 09 2024 12:00:00",
    taxableEarnings: "₱8,163.79",
    grossEarnings: "₱10,163.79",
    netPay: "₱9,539.00",
  };

  return (
    <Box sx={{padding: 5}}>
      <Box textAlign="center" mb={2}>
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

      <TableContainer sx={{ maxWidth: '60%', marginLeft: '0', fontSize: '12px' }}>
        <Table borderAxis="both" sx={{ "--TableCell-height": '5px', "--TableCell-paddingX": '17px' }}>
          <TableHead>
            <TableRow>
              <TableCell colSpan={3}><strong>Payroll Earnings</strong></TableCell>
              <TableCell colSpan={4}><strong>Amount</strong></TableCell>
              <TableCell><strong>Amount</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={{fontSize: 10}}><strong>Salary-2H</strong></TableCell>
              <TableCell sx={{fontSize: 10}}></TableCell>
              <TableCell sx={{fontSize: 10}}><strong>DAY/S</strong></TableCell>
              <TableCell sx={{fontSize: 10}}>{payslipData.taxableEarnings}</TableCell>
              <TableCell sx={{fontSize: 10}}>LH-RD</TableCell>
              <TableCell sx={{fontSize: 10}}></TableCell>
              <TableCell sx={{fontSize: 10}}>HR/S</TableCell>
              <TableCell sx={{fontSize: 10}}>{payslipData.taxableEarnings}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{fontSize: 10}}><strong>Daily Rate</strong></TableCell>
              <TableCell sx={{fontSize: 10}}></TableCell>
              <TableCell sx={{fontSize: 10}}><strong>HR/S</strong></TableCell>
              <TableCell sx={{fontSize: 10}}>{payslipData.grossEarnings}</TableCell>
              <TableCell sx={{fontSize: 10}}>LH-RD-ND</TableCell>
              <TableCell sx={{fontSize: 10}}></TableCell>
              <TableCell sx={{fontSize: 10}}>HR/S</TableCell>
              <TableCell sx={{fontSize: 10}}>{payslipData.grossEarnings}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{fontSize: 10}}><strong>RW-ND</strong></TableCell>
              <TableCell sx={{fontSize: 10}}></TableCell>
              <TableCell sx={{fontSize: 10}}><strong>HR/S</strong></TableCell>
              <TableCell sx={{fontSize: 10}}>{payslipData.netPay}</TableCell>
              <TableCell sx={{fontSize: 10}}>LH-RD-OT</TableCell>
              <TableCell sx={{fontSize: 10}}></TableCell>
              <TableCell sx={{fontSize: 10}}>HR/S</TableCell>
              <TableCell sx={{fontSize: 10}}>{payslipData.netPay}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{fontSize: 10}}><strong>RW-OT</strong></TableCell>
              <TableCell sx={{fontSize: 10}}></TableCell>
              <TableCell sx={{fontSize: 10}}><strong>HR/S</strong></TableCell>
              <TableCell sx={{fontSize: 10}}>{payslipData.netPay}</TableCell>
              <TableCell sx={{fontSize: 10}}>LH-RD-OT-ND</TableCell>
              <TableCell sx={{fontSize: 10}}></TableCell>
              <TableCell sx={{fontSize: 10}}>HR/S</TableCell>
              <TableCell sx={{fontSize: 10}}>{payslipData.netPay}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{fontSize: 10}}><strong>RD</strong></TableCell>
              <TableCell sx={{fontSize: 10}}></TableCell>
              <TableCell sx={{fontSize: 10}}><strong>HR/S</strong></TableCell>
              <TableCell sx={{fontSize: 10}}>{payslipData.netPay}</TableCell>
              <TableCell sx={{fontSize: 10}}>SH-RD</TableCell>
              <TableCell sx={{fontSize: 10}}></TableCell>
              <TableCell sx={{fontSize: 10}}>HR/S</TableCell>
              <TableCell sx={{fontSize: 10}}>{payslipData.netPay}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{fontSize: 10}}><strong>RD-ND</strong></TableCell>
              <TableCell sx={{fontSize: 10}}></TableCell>
              <TableCell sx={{fontSize: 10}}><strong>HR/S</strong></TableCell>
              <TableCell sx={{fontSize: 10}}>{payslipData.netPay}</TableCell>
              <TableCell sx={{fontSize: 10}}>SH-RD-ND</TableCell>
              <TableCell sx={{fontSize: 10}}></TableCell>
              <TableCell sx={{fontSize: 10}}>HR/S</TableCell>
              <TableCell sx={{fontSize: 10}}>{payslipData.netPay}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{fontSize: 10}}><strong>RD-OT</strong></TableCell>
              <TableCell sx={{fontSize: 10}}></TableCell>
              <TableCell sx={{fontSize: 10}}><strong>HR/S</strong></TableCell>
              <TableCell sx={{fontSize: 10}}>{payslipData.netPay}</TableCell>
              <TableCell sx={{fontSize: 10}}>SH-RD-OT</TableCell>
              <TableCell sx={{fontSize: 10}}></TableCell>
              <TableCell sx={{fontSize: 10}}>HR/S</TableCell>
              <TableCell sx={{fontSize: 10}}>{payslipData.netPay}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{fontSize: 10}}><strong>RD-OT-ND</strong></TableCell>
              <TableCell sx={{fontSize: 10}}></TableCell>
              <TableCell sx={{fontSize: 10}}><strong>HR/S</strong></TableCell>
              <TableCell sx={{fontSize: 10}}>{payslipData.netPay}</TableCell>
              <TableCell sx={{fontSize: 10}}>SH-RD-OT-ND</TableCell>
              <TableCell sx={{fontSize: 10}}></TableCell>
              <TableCell sx={{fontSize: 10}}>HR/S</TableCell>
              <TableCell sx={{fontSize: 10}}>{payslipData.netPay}</TableCell>
          </TableRow>
          <TableRow>
              <TableCell sx={{fontSize: 10}}><strong>LH-NWD</strong></TableCell>
              <TableCell sx={{fontSize: 10}}></TableCell>
              <TableCell sx={{fontSize: 10}}><strong>HR/S</strong></TableCell>
              <TableCell sx={{fontSize: 10}}>{payslipData.netPay}</TableCell>
              <TableCell sx={{fontSize: 10}}></TableCell>
              <TableCell sx={{fontSize: 10}}></TableCell>
              <TableCell sx={{fontSize: 10}}></TableCell>
              <TableCell sx={{fontSize: 10}}></TableCell>
          </TableRow>
          <TableRow>
              <TableCell sx={{fontSize: 10}}><strong>LH-NWD-ND</strong></TableCell>
              <TableCell sx={{fontSize: 10}}></TableCell>
              <TableCell sx={{fontSize: 10}}><strong>HR/S</strong></TableCell>
              <TableCell sx={{fontSize: 10}}>{payslipData.netPay}</TableCell>
              <TableCell sx={{fontSize: 10}} colSpan={4}></TableCell>
          </TableRow>
          <TableRow>
              <TableCell sx={{fontSize: 10}}><strong>LH-OT</strong></TableCell>
              <TableCell sx={{fontSize: 10}}></TableCell>
              <TableCell sx={{fontSize: 10}}><strong>HR/S</strong></TableCell>
              <TableCell sx={{fontSize: 10}}>{payslipData.netPay}</TableCell>
              <TableCell sx={{fontSize: 10}}></TableCell>
              <TableCell sx={{fontSize: 10}}></TableCell>
              <TableCell sx={{fontSize: 10}}></TableCell>
              <TableCell sx={{fontSize: 10}}></TableCell>
          </TableRow>
          <TableRow>
              <TableCell sx={{fontSize: 10}}><strong>LH-OT-ND</strong></TableCell>
              <TableCell sx={{fontSize: 10}}></TableCell>
              <TableCell sx={{fontSize: 10}}><strong>HR/S</strong></TableCell>
              <TableCell sx={{fontSize: 10}}>{payslipData.netPay}</TableCell>
              <TableCell sx={{fontSize: 10}}></TableCell>
              <TableCell sx={{fontSize: 10}}></TableCell>
              <TableCell sx={{fontSize: 10}}></TableCell>
              <TableCell sx={{fontSize: 10}}></TableCell>
          </TableRow>
          <TableRow>
              <TableCell sx={{fontSize: 10}}><strong>SH-NWD</strong></TableCell>
              <TableCell sx={{fontSize: 10}}></TableCell>
              <TableCell sx={{fontSize: 10}}><strong>HR/S</strong></TableCell>
              <TableCell sx={{fontSize: 10}}>{payslipData.netPay}</TableCell>
              <TableCell sx={{fontSize: 10}}></TableCell>
              <TableCell sx={{fontSize: 10}}></TableCell>
              <TableCell sx={{fontSize: 10}}></TableCell>
              <TableCell sx={{fontSize: 10}}></TableCell>
          </TableRow>
          <TableRow>
              <TableCell sx={{fontSize: 10}}><strong>SH-NWD-ND</strong></TableCell>
              <TableCell sx={{fontSize: 10}}></TableCell>
              <TableCell sx={{fontSize: 10}}><strong>HR/S</strong></TableCell>
              <TableCell sx={{fontSize: 10}}>{payslipData.netPay}</TableCell>
              <TableCell sx={{fontSize: 10}}></TableCell>
              <TableCell sx={{fontSize: 10}}></TableCell>
              <TableCell sx={{fontSize: 10}}></TableCell>
              <TableCell sx={{fontSize: 10}}></TableCell>
          </TableRow>
          <TableRow>
              <TableCell sx={{fontSize: 10}}><strong>SH-OT</strong></TableCell>
              <TableCell sx={{fontSize: 10}}></TableCell>
              <TableCell sx={{fontSize: 10}}><strong>HR/S</strong></TableCell>
              <TableCell sx={{fontSize: 10}}>{payslipData.netPay}</TableCell>
              <TableCell sx={{fontSize: 10}}></TableCell>
              <TableCell sx={{fontSize: 10}}></TableCell>
              <TableCell sx={{fontSize: 10}}></TableCell>
              <TableCell sx={{fontSize: 10}}></TableCell>
          </TableRow>
          <TableRow>
              <TableCell sx={{fontSize: 10}}><strong>SH-OT-ND</strong></TableCell>
              <TableCell sx={{fontSize: 10}}></TableCell>
              <TableCell sx={{fontSize: 10}}><strong>HR/S</strong></TableCell>
              <TableCell sx={{fontSize: 10}}>{payslipData.netPay}</TableCell>
              <TableCell sx={{fontSize: 10}}></TableCell>
              <TableCell sx={{fontSize: 10}}></TableCell>
              <TableCell sx={{fontSize: 10}}></TableCell>
              <TableCell sx={{fontSize: 10}}></TableCell>
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
