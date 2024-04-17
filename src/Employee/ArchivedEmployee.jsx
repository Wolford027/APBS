import React, {useState}from 'react'
import SideNav from '../Components/SideNav'
import Box from '@mui/material/Box'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Currency from '../Components/Currency'
import TextField from '@mui/material/TextField'
import Radio from '@mui/material/Radio'
import FormControlLabel from '@mui/material/FormControlLabel'
import RadioGroup from '@mui/material/RadioGroup'
import FormControl from '@mui/material/FormControl'


const drawerWidth = 240;

export default function EmployeeLoan() {

  const [loanAmount, setLoanAmount] = useState('');
  const [annualIncome, setAnnualIncome] = useState('');

  const handleLoanAmountChange = (event) => {
    const value = event.target.value;
    if (!isNaN(value)) {
      setLoanAmount(value);
    }
  };

  const handleAnnualIncomeChange = (event) => {
    const value = event.target.value;
    if (!isNaN(value)) {
      setAnnualIncome(value);
    }
  };

  return (
    <>
    <Box sx={{display: "flex" }}>
    <SideNav/>
    <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Employee Loan
          </Typography>
        </Toolbar>
    </AppBar>
      <Currency/>
      <Typography variant='h3' sx={{marginTop:10 , marginLeft: -40}}>Loan Form</Typography>
      <TextField
        id="outlined-number"
        label="Enter Loan Amount"
        variant="outlined"
        value={loanAmount}
        onChange={handleLoanAmountChange}
        inputProps={{ inputMode: 'numeric' }}
        sx={{marginTop:30}} />
      <TextField
        id="outlined-number"
        label="Enter Annual Income"
        variant="outlined"
        value={annualIncome}
        onChange={handleAnnualIncomeChange}
        inputProps={{ inputMode: 'numeric' }}
        sx={{marginTop:30, marginLeft: 10}} />

      <FormControl>
      <RadioGroup
        row
        aria-labelledby="demo-form-control-label-placement"
        name="position"
        defaultValue="top"
        sx={{marginTop: 10}}
        >
        <FormControlLabel value="loan-1" control={<Radio />} label="Loan" />
        <FormControlLabel value="loan-2" control={<Radio />} label="Loan" />
        <FormControlLabel value="loan-3" control={<Radio />} label="Loan" />
        <FormControlLabel value="loan-4" control={<Radio />} label="Loan" />
        <FormControlLabel value="loan-5" control={<Radio />} label="Loan" />
        <FormControlLabel value="loan-6" control={<Radio />} label="Loan" />
      </RadioGroup>
      </FormControl>

    </Box>
    </>
  )
}
