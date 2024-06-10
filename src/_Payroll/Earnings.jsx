import React, { useState, useEffect } from 'react'
import SideNav from '../Components/SideNav'
import Box from '@mui/material/Box'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Table from '@mui/joy/Table'
import axios from 'axios'
import { Button, Modal , TextField , Autocomplete } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import SearchBar from '../Components/SearchBar'
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import ModalClose from '@mui/joy/ModalClose';
import Divider from '@mui/material/Divider';
const drawerWidth = 240;

export default function Earnings() {

  const [openModal, setOpenModal] = useState(false);
  const [value1, setValue1] = useState(null);
  const [value2, setValue2] = useState(null);

  const [earnings, setEarnings] = useState([]);

  const [openModal1, setOpenModal1] = useState(false);
  const [earningsview, setEarnings1] = useState([]);

  const [openModalViewEmpEarnings, setOpenModalViewEmpEarnings] = useState(false);
  const [viewempearn, setViewempEarn] = useState([]);

 //Style
 const marginstyle = { margin: 8};
 const marginstyle1 = { marginbutton: 5};
 const buttonstyle = { borderRadius: 5, justifyContent: 'left' , margin: 5 };
 const martop = {marginTop: 5}
 
 const CivilStatus = [
  {label: 'Single'},{label: 'Married'}
];
const Sex = [
  {label: 'Male'},{label: 'Female'}
];


  useEffect(() => {
    getEarnings();
  },[]);

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
            Earnings
          </Typography>
          <SearchBar />
        </Toolbar>
    </AppBar>

    <Table hoverRow sx={{ marginTop: 10, marginLeft: -12 }} borderAxis="both">
          <thead>
            <tr>
              <th style={{ width: '10%' }}>Earnings No.</th>
              <th style={{ width: '20%' }}>Date</th>
              <th style={{ width: '10%' }}>Year</th>
              <th style={{ width: '10%' }}>Month</th>
              <th style={{ width: '10%' }}>Period</th>
              <th style={{ width: '20%' }}>Configuration</th>
            </tr>
          </thead>
          <tbody>
            {earnings.map((earn, key) => (
              <tr key={key}>
                <td style={{ cursor: 'pointer' }}>{}</td>
                <td style={{ cursor: 'pointer' }}>{}</td>
                <td style={{ cursor: 'pointer' }}>{}</td>
                <td style={{ cursor: 'pointer' }}>{}</td>
                <td style={{ cursor: 'pointer' }}>{}</td>
                <td>
                  <Button variant='contained' style={{marginRight: 5, width: '25%', fontSize: 12, fontWeight: 'bold'}} >Lock</Button>
                  <Button variant='contained' style={{width: '25%', fontSize: 12, fontWeight: 'bold'}} onClick={handleOpenModal1} > View </Button>
                  <Button variant='contained' style={{marginRight: 5,marginLeft: 5, width: '35%', fontSize: 12, fontWeight: 'bold'}} >Reprocess</Button>
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
          Generate Earnings
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
                Generate Earnings Modal
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
                  Generate Earnings
                </Button>
                <Button variant="outlined" onClick={handleCloseModal}>
                  Close Modal
                </Button>
              </Box>
            </Box>
          </Box>
        </Modal>
         
        {/* View Earnings Modal */}
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
                Earnings
              </Typography>

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                
              <Table hoverRow sx={{ marginTop: 0, marginLeft: 0 }} borderAxis="both">
          <thead>
            <tr>
                <th style={{ width: '10%' }}>Employee ID</th>
                <th style={{ width: '20%' }}>Employee Name</th>
                <th style={{ width: '10%' }}>Basic Pay</th>
                <th style={{ width: '10%' }}>OT Pay</th>
                <th style={{ width: '10%' }}>Allowance</th>
            </tr>
          </thead>
          <tbody>
            {earningsview.map((pay, key) => (
              <tr key={key}>
                <td style={{ cursor: 'pointer' }} onClick={handleOpenModalViewEmpEarnings}></td>
                <td style={{ cursor: 'pointer' }} onClick={handleOpenModalViewEmpEarnings}></td>
                <td style={{ cursor: 'pointer' }} onClick={handleOpenModalViewEmpEarnings}></td>
                <td style={{ cursor: 'pointer' }} onClick={handleOpenModalViewEmpEarnings}></td>
                <td style={{ cursor: 'pointer' }} onClick={handleOpenModalViewEmpEarnings}></td>
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
                height: { xs: '80%', sm: '60%', md: '70%'},
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
              
              <div className='rowC'  style={{ marginBottom: 20 }} >
                <Typography variant="h5" component="h2"  style= {{display: 'flex', justifyContent: 'flex-start'}}>
                Employee Information Loans
              </Typography>

              <div style= {{display: 'flex', justifyContent: 'flex-end' , marginLeft:260}} >
        
              </div>
              </div>

              <div className='rowC'>
                
                <TextField id="outlined-read-only-input" label="Employee No." defaultValue="1" InputProps={{ readOnly: true,}} style={marginstyle}  sx={{ width: '25%'  }} />
                <TextField id="outlined-read-only-input" label="Fullname" defaultValue="Fullname" InputProps={{ readOnly: true,}} style={marginstyle}  sx={{ width: '75%'  }} />
              
              </div>

              <div className='rowC'>
              <Autocomplete style= {marginstyle}
                      disablePortal
                      id="readOnly"
                      readOnly
                      options={CivilStatus}
                    sx={{ width: '33%' }}
                    renderInput={(params) => <TextField {...params} label="Position" />} 
                    
                  />
                  <Autocomplete style= {marginstyle}
                      disablePortal
                      id="readOnly"
                      readOnly
                      options={CivilStatus}
                    sx={{ width: '33%' }}
                    renderInput={(params) => <TextField {...params} label="Rate Type" />} 
                  />
                    <TextField id="outlined-read-only-input" label="Rate" defaultValue="Rate" InputProps={{ readOnly: true,}} style={marginstyle}  sx={{ width: '33%'  }} />

              </div>

              <Divider sx={{ my: 4 }} />
              <Typography variant="h5" component="h2"  style= {{display: 'flex', justifyContent: 'flex-start'}}>
                Earnings
              </Typography>


              <div className='rowC'>
              <TextField id="outlined-read-only-input" label="Total of Hours" defaultValue="Hours" InputProps={{ readOnly: true,}} style={marginstyle}  sx={{ width: '48%'  }} />              
              <TextField id="outlined-read-only-input" label="Basic Pay" defaultValue="Total Basic Pay" InputProps={{ readOnly: true,}} style={marginstyle}  sx={{ width: '47%'  }} />
              </div>

              <Typography variant="h6" component="h2"  style= {{display: 'flex', justifyContent: 'flex-start'}}>
                Taxable
              </Typography>
              <div className='rowC'>
              <TextField id="outlined-read-only-input" label="Total Regular OT" defaultValue="Regular OT" InputProps={{ readOnly: true,}} style={marginstyle}  sx={{ width: '48%'  }} />
              <TextField id="outlined-read-only-input" label="Total Amount of OT" defaultValue="Total Amount" InputProps={{ readOnly: true,}} style={marginstyle}  sx={{ width: '47%'  }} />
              </div>
              <div>
              <TextField id="outlined-read-only-input" label="Regular Holiday" defaultValue="Total Hour Regular Holiday" InputProps={{ readOnly: true,}} style={marginstyle}  sx={{ width: '48%'  }} />
              <TextField id="outlined-read-only-input" label="Total Amount Regular Holiday" defaultValue="Total Amount of Regular Holiday" InputProps={{ readOnly: true,}} style={marginstyle}  sx={{ width: '47%'  }} />
              </div>
              <div>
              <TextField id="outlined-read-only-input" label="Special Holiday" defaultValue="Total Hour of Special Holiday" InputProps={{ readOnly: true,}} style={marginstyle}  sx={{ width: '48%'  }} />
              <TextField id="outlined-read-only-input" label="Total Amount Special Holiday" defaultValue="Total Amount of Special Holiday" InputProps={{ readOnly: true,}} style={marginstyle}  sx={{ width: '47%'  }} />
              </div>
              
                            
              <TextField id="outlined-read-only-input" label="Total Taxable" defaultValue="Total Amount of Taxable"  InputProps={{ readOnly: true,}} style={marginstyle}  sx={{ width: '98%' }} />
             
              <Typography variant="h6" component="h2"  style= {{display: 'flex', justifyContent: 'flex-start'}}>
                Allowance
              </Typography>
              <div className='rowC'>
              
              <TextField id="outlined-read-only-input" label="Rice Allownce" defaultValue="Rice" InputProps={{ readOnly: true,}} style={marginstyle}  sx={{ width: '33%'  }} />
              <TextField id="outlined-read-only-input" label="Clothing Allownace" defaultValue="Clothing" InputProps={{ readOnly: true,}} style={marginstyle}  sx={{ width: '33%'  }} />
              <TextField id="outlined-read-only-input" label="Laundry Allowance" defaultValue="Laundry" InputProps={{ readOnly: true,}} style={marginstyle}  sx={{ width: '33%'  }} />
                            
              </div>

              <div className='rowC'>

              <TextField id="outlined-read-only-input" label="Transportation Allowance" defaultValue="Transportation" InputProps={{ readOnly: true,}} style={marginstyle}  sx={{ width: '48%'  }} />
              <TextField id="outlined-read-only-input" label="Total Amount of Allowance" defaultValue="Allowance" InputProps={{ readOnly: true,}} style={marginstyle}  sx={{ width: '48%'  }} />

              </div>

              <TextField id="outlined-read-only-input" label="Total Allowance" defaultValue="Total Amount Allowance"  InputProps={{ readOnly: true,}} style={marginstyle}  sx={{ width: '98%'  }} />
              <Divider sx={{ my: 4 }} />
              <TextField id="outlined-read-only-input" label="Total Earnings" defaultValue="Total Amount Earnings"  InputProps={{ readOnly: true,}} style={marginstyle}  sx={{ width: '98%'  }} />
             
              <div style= {{display: 'flex', justifyContent: 'flex-end'}}>
                  <div onClick={handleCloseModalViewEmpEarnings} >
                    <Button variant="contained" style={buttonstyle}>Close</Button>
                  </div > 
                </div>

              </Box>
            </Box>
          </Box>
        </Modal>
    </Box>
    </>
  )
}
