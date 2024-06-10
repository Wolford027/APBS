import React, { useState, useEffect } from 'react'
import SideNav from '../Components/SideNav'
import Box from '@mui/material/Box'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Table from '@mui/joy/Table'
import axios from 'axios'
import { Button, Modal } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import SearchBar from '../Components/SearchBar'

const drawerWidth = 240;

export default function Deduc() {

  const [openModal, setOpenModal] = useState(false);
  const [value1, setValue1] = useState(null);
  const [value2, setValue2] = useState(null);

  const [deduc, setDeduc] = useState([]);

  const [openModal1, setOpenModal1] = useState(false);
  const [deducview, setDeduc1] = useState([]);

  useEffect(() => {
    getDeduc();
  },[]);

  function getDeduc() {
    axios.get('http://localhost/Another1/APBS/api/user/deductions/').then(function (response) {
      console.log(response.data);
      setDeduc(response.data);
      setDeduc1(response.data);
    });
  }
 
// Viewdeduct modal
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

  return (
    <>
      <Box sx={{ display: 'flex' }}>
        <SideNav />
        <AppBar
          position="fixed"
          sx={{
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            ml: { sm: `${drawerWidth}px` },
          }}
        >
          <Toolbar>
            <Typography  variant="h6" noWrap component="div" > Deductions </Typography>
            <SearchBar />
          </Toolbar>
        </AppBar>

        <Table hoverRow sx={{marginTop: 10, marginLeft: -12}} borderAxis="both">
          <thead>
            <tr>
              <th style={{ width: '10%' }}>Deduction No.</th>
              <th style={{ width: '20%' }}>Date</th>
              <th style={{ width: '10%' }}>Year</th>
              <th style={{ width: '10%' }}>Month</th>
              <th style={{ width: '10%' }}>Period</th>
              <th style={{ width: '20%' }} >Configuration</th>
            </tr>
          </thead>
          <tbody>
            {deduc.map((pay, key) => (
              <tr key={key}>
                <td style={{ cursor: 'pointer' }}>{}</td>
                <td style={{ cursor: 'pointer' }}>{}</td>
                <td style={{ cursor: 'pointer' }}>{}</td>
                <td style={{ cursor: 'pointer' }}>{}</td>
                <td style={{ cursor: 'pointer' }}>{}</td>
                <td>
                  <Button variant='contained' style={{marginRight: 5, width: '20%', fontSize: 12, fontWeight: 'bold'}} >Lock</Button>
                  <Button variant='contained' style={{width: '20%', fontSize: 12, fontWeight: 'bold'}} onClick={handleOpenModal1} > View </Button>
                  <Button variant='contained' style={{marginLeft: 5,width: '40%', fontSize: 12, fontWeight: 'bold'}} >Reprocess</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Button
          variant="outlined"
          style={{ position: 'absolute', top: 520, right: 50, width: '10%', height: '10%' }}
          onClick={handleOpenModal}
        >
          Generate Deduction
        </Button>
    
        {/* Generate Modal */}
        <Modal
          open={openModal}
          onClose={handleCloseModal}
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
                width: { xs: '80%', sm: '60%', md: '50%' },
                boxShadow: 24,
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Typography variant="h4" component="h2" sx={{ marginBottom: 2, fontWeight: 'bold'}}>
                Generate Deduction
              </Typography>
              <Typography variant="h4" component="h2" sx={{ fontSize: 20, fontWeight: 300}}>
                Date Range
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Start"
                  value={value1}
                  onChange={(newValue) => setValue1(newValue)}
                  sx={{ marginBottom: 2 }}
                />
                <DatePicker
                  label="End"
                  value={value2}
                  onChange={(newValue) => setValue2(newValue)}
                />
              </LocalizationProvider>
              <Box sx={{ marginTop: 2 }}>
                <Button
                  variant="outlined"
                  sx={{ marginRight: 2 }}
                  onClick={handleCloseModal}
                >
                  Generate Deduction
                </Button>
                <Button variant="outlined" onClick={handleCloseModal}>
                  Close
                </Button>
              </Box>
            </Box>
          </Box>
        </Modal>
         
        {/* View Deduction Modal */}
        <Modal
          open={openModal1}
          onClose={handleCloseModal1}
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
                width: { xs: '100%', sm: '100%', md: '80%' },
                boxShadow: 24,
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Typography variant="h4" component="h2" sx={{ marginBottom: 2, fontWeight: 'bold'}}>
                Deductions
              </Typography>

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                
              <Table hoverRow sx={{ marginTop: 0, marginLeft: 0 }} borderAxis="both">
          <thead>
            <tr>
              <th style={{ width: '10%' }}>Deduction No.</th>
              <th style={{ width: '20%' }}>Name</th>
              <th style={{ width: '20%' }}>Goverment Distribution</th>
              <th style={{ width: '20%' }}>Loans</th>
              <th style={{ width: '20%' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {deducview.map((deduc, key) => (
              <tr key={key}>
                <td style={{ cursor: 'pointer' }}>{}</td>
                <td style={{ cursor: 'pointer' }}>{}</td>
                <td style={{ cursor: 'pointer' }}>{}</td>
                <td style={{ cursor: 'pointer' }}>{}</td>
                <td style={{ cursor: 'pointer' }}>{}</td>
              </tr>
            ))}
          </tbody>
        </Table>

              </LocalizationProvider>
              <Box sx={{ marginTop: 2 }}>
                <Button variant="outlined" onClick={handleCloseModal1}>
                  Close
                </Button>
              </Box>
            </Box>
          </Box>
        </Modal>
      </Box>
    </>
  );
}
