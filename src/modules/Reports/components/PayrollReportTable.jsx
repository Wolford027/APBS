import React from 'react'
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined'

const MONTHLY_COLUMNS = [
  'Date', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
  'Total Regular Hours', 'Total Overtime Hours', 'Total Worked Hours',
]

const SUMMARY_COLUMNS = ['Months', 'Regular Hours', 'Overtime Hours', 'Total Worked Hours', 'Total Wage']

export default function PayrollReport({ payrollType }) {
  const columns = payrollType === 'Monthly' ? MONTHLY_COLUMNS : SUMMARY_COLUMNS

  return (
    <Box sx={{ mt: 5 }}>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          maxHeight: '300px',
          overflow: 'auto',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '12px',
          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04), 0 2px 8px rgba(15, 23, 42, 0.04)',
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((label) => (
                <TableCell
                  key={label}
                  sx={{
                    fontSize: '11.5px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell colSpan={columns.length} sx={{ borderBottom: 'none', p: 0 }}>
                <Box sx={{ py: 6, px: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 0.75 }}>
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: '#F1F5F9',
                      color: '#94A3B8',
                      mb: 0.5,
                    }}
                  >
                    <AssessmentOutlinedIcon sx={{ fontSize: 26 }} />
                  </Box>
                  <Typography sx={{ fontSize: 15, fontWeight: 600, color: 'text.primary' }}>No report data</Typography>
                  <Typography sx={{ fontSize: 13, color: 'text.secondary', maxWidth: 380 }}>
                    Pick an employee and date range, then generate the report to see hours here.
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
