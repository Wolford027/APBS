import React, { useState, useEffect } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, Autocomplete,
  TextField
} from '@mui/material'
import axios from 'axios'

export default function GenerateEmpReport({ onOpen, onClose, onTitle, onSubmit, readOnly, defaultValues = {} }) {
  const [date, setDate] = useState('');
  const [employeeList, setEmployeeList] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [departmentList, setDepartmentList] = useState([]);
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedCategoryReport, setSelectedCategoryReport] = useState([]);

  
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    setDate(today);
    FetchEmployee();
    FetchDepartment();
    FetchCategoryReport();
  }, [])

  const FetchEmployee = async () => {
    try {
      const response = await axios.get('http://localhost:8800/fetch-emp');
      setEmployeeList(response.data);
    } catch (error) {
      console.error('Error fetching employee data:', error);
      return [];
    }
  }

  const FetchDepartment = async () => {
    try {
      const response = await axios.get('http://localhost:8800/fetch-department');
      setDepartmentList(response.data);
    } catch (error) {
      console.error('Error fetching department data:', error);
      return [];
    }
  }

  const FetchCategoryReport = async () => {
    try {
      const response = await axios.get('http://localhost:8800/fetch-category-report');
      setSelectedCategoryReport(response.data);
    } catch (error) {
      console.error('Error fetching category report data:', error);
      return [];
    }
  }

  const filteredEmployees = selectedDept
  ? employeeList.filter(emp => emp.emp_dept === selectedDept.emp_dept_name)
  : employeeList;

  const HandleSubmit = () => {
    const payload = {
      date,
      department: selectedDept?.emp_dept_name || '',
      employee: selectedEmp?.emp_id || '',
      category: selectedCategoryReport?.category || ''
    };
    console.log('Payload:', payload);
    // Call your parent handler or send to backend
    onSubmit(payload);
    onClose();
  };  

  return (
    <Dialog open={onOpen} onClose={(event, reason) => {
      if (reason !== 'backdropClick') {
        onClose(event, reason);
      }
    }} fullWidth maxWidth="sm" closeAfterTransition>
      <DialogTitle>Generate {onTitle} Report</DialogTitle>
      <DialogContent>
        <Box sx={{ p: 2 }}>
          <Box>
            <Typography></Typography>
            <TextField
              sx={{ marginTop: 2 }}
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <Autocomplete sx={{marginTop: 2}} disablePortal options={departmentList} getOptionLabel={(option) => option.emp_dept_name} onChange={(e, value) => setSelectedDept(value)} renderInput={(params) => <TextField {...params} label='Select Department' />} />
            <Autocomplete sx={{marginTop: 2}} disablePortal options={filteredEmployees} getOptionLabel={(option) => option.f_name + " " + option.m_name + " " + option.l_name} onChange={(e, value) => setSelectedEmp(value)} renderInput={(params) => <TextField {...params} label='Select Employee' />} />
            <Autocomplete sx={{marginTop: 2}} disablePortal options={selectedCategoryReport} getOptionLabel={(option) => option.category} onChange={(e, value) => setSelectedCategoryReport(value)} renderInput={(params) => <TextField {...params} label='Select Report Category' />} />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="contained">Close</Button>
        <Button onClick={HandleSubmit} color="primary" variant="contained">Submit</Button>
      </DialogActions>
    </Dialog>
  )
}