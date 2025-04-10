import React, { useState, useEffect } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Typography, Box
} from '@mui/material'

export default function GenerateEmpReport({ onOpen, onClose, onSubmit, readOnly, defaultValues = {} }) {
  const [date, setDate] = useState('');
  const [details, setDetails] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [employeeName, setEmployeeName] = useState('');

  useEffect(() => {
    if (defaultValues && defaultValues.date) {
      setDate(defaultValues.date);
      setEmployeeId(defaultValues.emp_id || '');
      setEmployeeName(defaultValues.emp_name || '');
      setDetails(defaultValues.details || '');
    } else {
      const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
      setDate(today);
      setEmployeeId('');
      setEmployeeName('');
      setDetails('');
    }
  }, [defaultValues, onOpen]);  

  const handleSubmit = () => {
    const data = {
      date,
      employeeId,
      employeeName,
      details
    };
    onSubmit(data);
    setDate('');
    setEmployeeId('');
    setEmployeeName('');
    setDetails('');
  }

  return (
    <Dialog open={onOpen} onClose={(event, reason) => {
      if (reason !== 'backdropClick') {
        onClose();
      }
    }} closeAfterTransition>
      <DialogTitle>{readOnly ? "View Employee Report" : "Generate Employee Report"}</DialogTitle>
      <DialogContent>
        <Box sx={{
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          height: '100vh', p: 2
        }}>
          <Box sx={{
            backgroundColor: 'white', padding: 4, width: 500,
            boxShadow: 24, borderRadius: 2, display: 'flex',
            flexDirection: 'column', alignItems: 'center',
            overflowY: 'auto'
          }}>
            <Typography variant="body1" gutterBottom>{readOnly ? "Report Details" : "Generate an Employee Report"}</Typography>
            <TextField
              margin="dense" type="date"
              fullWidth variant="standard" value={date} onChange={(e) => setDate(e.target.value)}
              InputProps={{ readOnly }}
            />
            <TextField
              margin="dense" label="Employee ID" type="text"
              fullWidth variant="standard" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}
              InputProps={{ readOnly }}
            />
            <TextField
              margin="dense" label="Employee Name" type="text"
              fullWidth variant="standard" value={employeeName} onChange={(e) => setEmployeeName(e.target.value)}
              InputProps={{ readOnly }}
            />
            <TextField
              margin="dense" label="Details" type="text" fullWidth
              variant="standard" multiline rows={6}
              value={details} onChange={(e) => setDetails(e.target.value)}
              InputProps={{ readOnly }}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Close</Button>
        {!readOnly && (
          <Button onClick={handleSubmit} color="primary">Generate Report</Button>
        )}
      </DialogActions>
    </Dialog>
  )
}