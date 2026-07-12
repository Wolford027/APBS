import React from 'react'
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'

export default function PayrollReport({ payrollType}) {
  return (
    <Box sx={{mt: 5}}>
            <TableContainer component={Paper} sx={{maxHeight: '300px', overflow: 'auto'}}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            {payrollType === 'Monthly' ? (
                              <>
                                <TableCell>Date</TableCell>
                                <TableCell>Monday</TableCell>
                                <TableCell>Tuesday</TableCell>
                                <TableCell>Wednesday</TableCell>
                                <TableCell>Thursday</TableCell>
                                <TableCell>Friday</TableCell>
                                <TableCell>Saturday</TableCell>
                                <TableCell>Sunday</TableCell>
                                <TableCell>Total Regular Hours</TableCell>
                                <TableCell>Total Overtime Hours</TableCell>
                                <TableCell>Total Worked Hours</TableCell>
                              </>
                            ) : (
                              <>
                                <TableCell>Months</TableCell>
                                <TableCell>Regular Hours</TableCell>
                                <TableCell>Overtime Hours</TableCell>
                                <TableCell>Total Worked Hours</TableCell>
                                <TableCell>Total Wage</TableCell>
                              </>
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            {payrollType === 'Monthly' ? (
                              <>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                              </>
                            ) : (
                              <>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                              </>
                            )}
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
    </Box>
  )
}
