import React, { useEffect, useState } from 'react';
import { AppBar, Autocomplete, Box, Button, Grid, TextField, Toolbar, Typography } from '@mui/material';
import SideNav from '../Components/SideNav';
import PayrollReportTable from '../_Table/PayrollReport';
import axios from 'axios';

const drawerWidth = 240;

export default function PayrollReport() {
  const [employee, setEmployee] = useState([]);
  const [rate, setRate] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [payrollData, setPayrollData] = useState([]);
  const [employeePayroll, setEmployeePayroll] = useState(null);


  const FetchEmployee = async () => {
    try {
      const res = await axios.get('http://localhost:8800/emp');
      setEmployee(res.data);
      console.log(res)
    } catch (error) {
      console.log(error);
    }
  };

  const FetchRate = async () => {
    try {
      const res = await axios.get('http://localhost:8800/payroll-type');
      setRate(res.data);
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  }

  const FetchPayroll = async () => {
    try {
      const res = await axios.get('http://localhost:8800/ViewPayroll_Part1');
      setPayrollData(res);
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    FetchEmployee();
    FetchRate();
    FetchPayroll();
  }, [])

  useEffect(() => {
    if (selectedEmployee && payrollData?.data?.length) {
      const match = payrollData.data.find(p => p.emp_id === selectedEmployee.emp_id);
      setEmployeePayroll(match || null);
    } else {
      setEmployeePayroll(null);
    }
  }, [selectedEmployee, payrollData]);

  return (
    <Box sx={{ display: 'flex', width: '100%', height: '100vh' }}>
      <SideNav />
      <AppBar
        position='fixed'
        sx={{ width: { sm: `calc(100% - ${drawerWidth}px)` }, ml: { sm: `${drawerWidth}px` } }}>
        <Toolbar>
          <Typography variant='h6' noWrap component='div'>
            Payroll Report
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ flexGrow: 1, mt: 12, ml: -10, px: 4, width: '100%' }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Autocomplete
              options={rate || []}
              getOptionLabel={(option) => option.payroll_type|| ''}
              onChange={(event, newValue) => {
                setSelectedType(newValue?.payroll_type || null);
              }}
              renderInput={(params) => (
                <TextField fullWidth {...params} label="Payroll Type" />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Autocomplete
              options={employee || []}
              getOptionLabel={(option) => `${option.f_name} ${option.m_name} ${option.l_name}` || ''}
              onChange={(event, newValue) => {
                setSelectedEmployee(newValue || null);
              }}
              renderInput={(params) => (
                <TextField fullWidth {...params} label="Employee Name" />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="Total Regular Hours Worked" value={employeePayroll?.total_hours_work || ''} inputProps={{ readOnly: true}} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="Total Overtime Hours Worked" value={employeePayroll?.total_overtime_hours_rt1_r || ''} inputProps={{ readOnly: true}} />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="Rate Type" value={selectedEmployee?.rate_type || ''} inputProps={{ readOnly: true}} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="Rate" value={selectedEmployee?.salary_rate || ''} inputProps={{ readOnly: true}} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="Total Wage" inputProps={{ readOnly: true}} />
          </Grid>
        </Grid>
        <PayrollReportTable payrollType={selectedType} />
        <Button sx={{mt: 5}} variant='contained'>Generate Report</Button>
      </Box>
    </Box>
  );
}
