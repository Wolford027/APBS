import React, { useState, useEffect } from 'react'
import SideNav from '../Components/SideNav'
import Box from '@mui/material/Box'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Table from '@mui/joy/Table'
import axios from 'axios'
import { Button, Modal, TextField, Autocomplete } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import SearchBar from '../Components/SearchBar'
import Divider from '@mui/material/Divider';
import Grid from '@mui/joy/Grid';
import Tooltip from '@mui/material/Tooltip';
import CloseIcon from '@mui/icons-material/Close'

const drawerWidth = 240;

export default function ViewEmployeeEarnings() {
  //CURRENCY INADD EMP ALLOWANCE
  const CurrencyDisplay = ({ amount }) => {
    const formattedAmount = new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);

    return (
      <Typography sx={{ width: '33%', display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
        {formattedAmount}
      </Typography>
    );
  };
  // AUTO ERASE WHEN WILL TYPE IN TEXT FILED IN EMP ADD ALLOWANCE

  // State to track input values
  const [values, setValues] = useState({
    riceSubsidy: '0.00',
    clothingAllowance: '0.00',
    laundryAllowance: '0.00',
    medicalAllowance: '0.00',
  });

  // Function to handle input change
  const handleChange = (field, newValue) => {
    const regex = /^[0-9]*[.]?[0-9]*$/; // Validate input to allow only numbers and decimal

    if (regex.test(newValue)) {
      setValues((prevValues) => ({
        ...prevValues,
        [field]: newValue,
      }));
    }
  };

  // Ensure value has two decimal places onBlur (focus out)
  const handleBlur = (field) => {
    setValues((prevValues) => {
      let updatedValue = prevValues[field];

      // If the value doesn't contain a decimal, add '.00'
      if (!updatedValue.includes('.')) {
        updatedValue = `${updatedValue}.00`;
      } else {
        const [integerPart, decimalPart] = updatedValue.split('.');
        updatedValue = `${integerPart}.${decimalPart.substring(0, 2)}`;
      }

      return {
        ...prevValues,
        [field]: updatedValue,
      };
    });
  };

  // Clear value when focused if it’s '0.00'
  const handleFocus = (field) => {
    setValues((prevValues) => ({
      ...prevValues,
      [field]: prevValues[field] === '0.00' ? '' : prevValues[field],
    }));
  };

  // Open the modal
  const handleOpenModalAddAllow = () => {
    setOpenModalAddAllow(true);
  };

  // Close the modal and reset form values
  const handleCloseModalAddAllow = () => {
    setOpenModalAddAllow(false);
    // Reset form values to default when closing the modal
    setValues({
      riceSubsidy: '0.00',
      clothingAllowance: '0.00',
      laundryAllowance: '0.00',
      medicalAllowance: '0.00',
    });
  };


  const [openModal, setOpenModal] = useState(false);
  const [value1, setValue1] = useState(null);
  const [value2, setValue2] = useState(null);

  const [earnings, setEarnings] = useState([]);

  const [openModal1, setOpenModal1] = useState(false);
  const [earningsview, setEarnings1] = useState([]);

  const [openModalAddAllow, setOpenModalAddAllow] = useState(false);



  const [openModalViewEmpEarnings, setOpenModalViewEmpEarnings] = useState(false);
  const [viewempearn, setViewempEarn] = useState([]);

  //Style
  const marginstyle = { margin: 8 };
  const marginstyle1 = { marginbutton: 5 };
  const buttonstyle = { borderRadius: 5, justifyContent: 'left', margin: 5 };
  const martop = { marginTop: 5 }

  const CivilStatus = [
    { label: 'Single' }, { label: 'Married' }
  ];
  const Sex = [
    { label: 'Male' }, { label: 'Female' }
  ];


  useEffect(() => {
    getEarnings();
  }, []);

  function getEarnings() {
    axios.get('http://localhost/Another1/APBS/api/user/earnings/').then(function (response) {
      console.log(response.data);
      setEarnings(response.data);
      setEarnings1(response.data)
    });
  }

  // Viewearnings modal
  const handleOpenModal1 = () => {
    setOpenModal1(true);
  };
  // Closing the modal
  const handleCloseModal1 = () => {
    setOpenModal1(false);
  };


  // Generate modal
  const handleOpenModal = () => {
    setValue1(null);
    setValue2(null);
    setOpenModal(true);
  };

  // Closing the modal
  const handleCloseModal = () => {
    setOpenModal(false);
  };

  //View Employee earnings
  const handleOpenModalViewEmpEarnings = () => {
    setOpenModalViewEmpEarnings(true);
  };

  const handleCloseModalViewEmpEarnings = () => {
    setOpenModalViewEmpEarnings(false);
  };


  return (
    <>
          {/* LIST EARNINGS */}
          <Modal //View Employee Earnings
            open={openModalViewEmpEarnings}
            onClose={handleCloseModalViewEmpEarnings}
            closeAfterTransition
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                p: 2,
              }}
            >
              <Box className='modal-scroll'
                sx={{
                  backgroundColor: 'white',
                  padding: 4,
                  width: { xs: '80%', sm: '60%', md: '50%' },
                  height: { xs: '80%', sm: '60%', md: '70%' },
                  boxShadow: 24,
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >

                <Typography variant="h4" sx={{ marginBottom: 2 }}>
                  Loans
                </Typography>
                <Box sx={{ marginTop: 2 }}>

                  <div className='rowC' style={{ marginBottom: 20 }} >
                    <Typography variant="h5" component="h2" style={{ display: 'flex', justifyContent: 'flex-start' }}>
                      Employee Information Loans
                    </Typography>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginLeft: 260 }} >

                    </div>
                  </div>

                  <div className='rowC'>

                    <TextField id="outlined-read-only-input" label="Employee No." defaultValue="1" InputProps={{ readOnly: true, }} style={marginstyle} sx={{ width: '25%' }} />
                    <TextField id="outlined-read-only-input" label="Fullname" defaultValue="Fullname" InputProps={{ readOnly: true, }} style={marginstyle} sx={{ width: '75%' }} />

                  </div>

                  <div className='rowC'>
                    <Autocomplete style={marginstyle}
                      disablePortal
                      id="readOnly"
                      readOnly
                      options={CivilStatus}
                      sx={{ width: '33%' }}
                      renderInput={(params) => <TextField {...params} label="Position" />}

                    />
                    <Autocomplete style={marginstyle}
                      disablePortal
                      id="readOnly"
                      readOnly
                      options={CivilStatus}
                      sx={{ width: '33%' }}
                      renderInput={(params) => <TextField {...params} label="Rate Type" />}
                    />
                    <TextField id="outlined-read-only-input" label="Rate" defaultValue="Rate" InputProps={{ readOnly: true, }} style={marginstyle} sx={{ width: '33%' }} />

                  </div>

                  <Divider sx={{ my: 4 }} />
                  <Typography variant="h5" component="h2" style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    Earnings
                  </Typography>


                  <div className='rowC'>
                    <TextField id="outlined-read-only-input" label="Total of Hours" defaultValue="Hours" InputProps={{ readOnly: true, }} style={marginstyle} sx={{ width: '48%' }} />
                    <TextField id="outlined-read-only-input" label="Basic Pay" defaultValue="Total Basic Pay" InputProps={{ readOnly: true, }} style={marginstyle} sx={{ width: '47%' }} />
                  </div>

                  <Typography variant="h6" component="h2" style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    Taxable
                  </Typography>
                  <div className='rowC'>
                    <TextField id="outlined-read-only-input" label="Total Regular OT" defaultValue="Regular OT" InputProps={{ readOnly: true, }} style={marginstyle} sx={{ width: '48%' }} />
                    <TextField id="outlined-read-only-input" label="Total Amount of OT" defaultValue="Total Amount" InputProps={{ readOnly: true, }} style={marginstyle} sx={{ width: '47%' }} />
                  </div>
                  <div>
                    <TextField id="outlined-read-only-input" label="Regular Holiday" defaultValue="Total Hour Regular Holiday" InputProps={{ readOnly: true, }} style={marginstyle} sx={{ width: '48%' }} />
                    <TextField id="outlined-read-only-input" label="Total Amount Regular Holiday" defaultValue="Total Amount of Regular Holiday" InputProps={{ readOnly: true, }} style={marginstyle} sx={{ width: '47%' }} />
                  </div>
                  <div>
                    <TextField id="outlined-read-only-input" label="Special Holiday" defaultValue="Total Hour of Special Holiday" InputProps={{ readOnly: true, }} style={marginstyle} sx={{ width: '48%' }} />
                    <TextField id="outlined-read-only-input" label="Total Amount Special Holiday" defaultValue="Total Amount of Special Holiday" InputProps={{ readOnly: true, }} style={marginstyle} sx={{ width: '47%' }} />
                  </div>


                  <TextField id="outlined-read-only-input" label="Total Taxable" defaultValue="Total Amount of Taxable" InputProps={{ readOnly: true, }} style={marginstyle} sx={{ width: '98%' }} />

                  <Typography variant="h6" component="h2" style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    Allowance
                  </Typography>
                  <div className='rowC'>

                    <TextField id="outlined-read-only-input" label="Rice Allownce" defaultValue="Rice" InputProps={{ readOnly: true, }} style={marginstyle} sx={{ width: '33%' }} />
                    <TextField id="outlined-read-only-input" label="Clothing Allownace" defaultValue="Clothing" InputProps={{ readOnly: true, }} style={marginstyle} sx={{ width: '33%' }} />
                    <TextField id="outlined-read-only-input" label="Laundry Allowance" defaultValue="Laundry" InputProps={{ readOnly: true, }} style={marginstyle} sx={{ width: '33%' }} />

                  </div>

                  <div className='rowC'>

                    <TextField id="outlined-read-only-input" label="Transportation Allowance" defaultValue="Transportation" InputProps={{ readOnly: true, }} style={marginstyle} sx={{ width: '48%' }} />
                    <TextField id="outlined-read-only-input" label="Total Amount of Allowance" defaultValue="Allowance" InputProps={{ readOnly: true, }} style={marginstyle} sx={{ width: '48%' }} />

                  </div>

                  <TextField id="outlined-read-only-input" label="Total Allowance" defaultValue="Total Amount Allowance" InputProps={{ readOnly: true, }} style={marginstyle} sx={{ width: '98%' }} />
                  <Divider sx={{ my: 4 }} />
                  <TextField id="outlined-read-only-input" label="Total Earnings" defaultValue="Total Amount Earnings" InputProps={{ readOnly: true, }} style={marginstyle} sx={{ width: '98%' }} />

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div onClick={handleCloseModalViewEmpEarnings} >
                      <Button variant="contained" style={buttonstyle}>Close</Button>
                    </div >
                  </div>

                </Box>
              </Box>
            </Box>
          </Modal>

        
    </>
  )
}
