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

export default function AddEmpBenifitsAllowance({onOpen, onClose}) {
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
           {/* ADD EMP BENIFITS OR ALLOWANCES  */}
           <Modal
            open={onOpen}
            onClose={onClose}
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
              <Box
                sx={{
                  backgroundColor: 'white',
                  padding: 4,
                  width: { xs: '90%', sm: '90%', md: '70%' },
                  boxShadow: 24,
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <CloseIcon onClick={onClose} sx={{ cursor: 'pointer', marginLeft: 80 }} />
                <Typography variant="h4" component="h2" sx={{ marginBottom: 2, fontWeight: 'bold' }}>
                  Add Employee Benifits or Allowance
                </Typography>

                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ width: '100%', marginBottom: 2 }}>
                  <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                    De Minimis Benefits
                  </Typography>

                  <Box display="flex" justifyContent="flex-end" gap={2}>
                    <Button variant="contained" sx={{ fontSize: 12, fontWeight: 'bold' }}>Save</Button>
                    <Button variant="contained" sx={{ fontSize: 12, fontWeight: 'bold' }}>Cancel</Button>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 20, marginTop: 1 }}>
                  <CurrencyDisplay amount={2000} />
                  <CurrencyDisplay amount={500} />
                  <CurrencyDisplay amount={300} />
                  <CurrencyDisplay amount={250} />
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 2 }}>
                  <TextField
                    label="Rice subsidy"
                    value={values.riceSubsidy}
                    onChange={(e) => handleChange('riceSubsidy', e.target.value)}
                    onFocus={() => handleFocus('riceSubsidy')}
                    onBlur={() => handleBlur('riceSubsidy')}
                    sx={{ width: '33%', marginLeft: 1 }}
                  />
                  <TextField
                    label="Uniform and clothing allowance"
                    value={values.clothingAllowance}
                    onChange={(e) => handleChange('clothingAllowance', e.target.value)}
                    onFocus={() => handleFocus('clothingAllowance')}
                    onBlur={() => handleBlur('clothingAllowance')}
                    sx={{ width: '33%', marginLeft: 1 }}
                  />
                  <TextField
                    label="Laundry allowance"
                    value={values.laundryAllowance}
                    onChange={(e) => handleChange('laundryAllowance', e.target.value)}
                    onFocus={() => handleFocus('laundryAllowance')}
                    onBlur={() => handleBlur('laundryAllowance')}
                    sx={{ width: '33%', marginLeft: 1 }}
                  />
                  <TextField
                    label="Medical cash allowance"
                    value={values.medicalAllowance}
                    onChange={(e) => handleChange('medicalAllowance', e.target.value)}
                    onFocus={() => handleFocus('medicalAllowance')}
                    onBlur={() => handleBlur('medicalAllowance')}
                    sx={{ width: '33%', marginLeft: 1 }}
                  />
                </Box>
              </Box>
            </Box>
          </Modal>
    </>
  )
}
