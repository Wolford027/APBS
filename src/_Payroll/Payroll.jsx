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
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import ModalClose from '@mui/joy/ModalClose';
import Divider from '@mui/material/Divider';
import Grid from '@mui/joy/Grid';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns'
//import dayjs from 'dayjs'

const drawerWidth = 240;

export default function Payroll() {

  const handleSelectPayrollType = (type) => {
    setSelectedPayrollType(type);
  };

  const [selectedPayrollType, setSelectedPayrollType] = useState(null); // Tracks selected payroll type

  const [openModal, setOpenModal] = useState(false);
  const [value1, setValue1] = useState(null);
  const [value2, setValue2] = useState(null);

  const [payroll, setPayroll] = useState([]);

  const [openModal1, setOpenModal1] = useState(false);
  const [payrollview, setPayroll1] = useState([]);

  const [openModalViewEmpPayroll, setOpenModalViewEmpPayroll] = useState(false);
  const [viewemp, setViewemp] = useState([]);

  const navigate = useNavigate(); // Initialize useNavigate hook
  const [inputs, setInputs] = React.useState({});
  const [error, setError] = React.useState(null);

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

  // Viewpayroll modal
  const handleOpenModal1 = () => {
    setOpenModal1(true);
  };
  // Closing the modal
  const handleCloseModal1 = () => {
    setOpenModal1(false);
  };

  //View Employee Payroll
  const handleOpenModalViewEmpPayroll = () => {
    setOpenModalViewEmpPayroll(true);
  };

  const handleCloseModalViewEmpPayroll = () => {
    setOpenModalViewEmpPayroll(false);
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

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    try {
      if (!startDate || !endDate) {
        alert("Please select both start and end dates.");
        return;
      }
  
      // Format dates as yyyy-mm-dd in local time
      const formatDate = (date) =>
        date.toLocaleDateString("en-CA", { timeZone: "Asia/Manila" }); // "en-CA" gives yyyy-mm-dd format
  
      const formattedStartDate = formatDate(startDate);
      const formattedEndDate = formatDate(endDate);
  
      const response = await axios.post("http://localhost:8800/payroll-part-1", {
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      });
  
      console.log("Payroll Data:", response.data);
    } catch (error) {
      console.error("Error fetching payroll data:", error.response || error.message);
    }
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
            <Typography variant="h6" noWrap component="div" > Payroll </Typography>

          </Toolbar>
        </AppBar>
        <Box sx={{ flexGrow: 1, p: 3, mt: 7, ml: -11 }}>
          <Grid container spacing={0} direction="row" sx={{ flexGrow: 1, justifyContent: "space-between", alignItems: "center" }} >
            <Grid size={4} sx={{ marginLeft: -3 }}>
              <SearchBar />
            </Grid>
            <Grid size={4} sx={{ marginRight: -3 }}>
              <Button type='Submit' color="primary" variant="outlined" sx={{ marginRight: 3, }} onClick={handleOpenModal} > Generate Payroll</Button>
            </Grid>
          </Grid>


          <Table hoverRow sx={{}} borderAxis="both">
            <thead>
              <tr>
                <th style={{ width: '10%' }}>Payroll No.</th>
                <th style={{ width: '20%' }}>Date</th>
                <th style={{ width: '10%' }}>Year</th>
                <th style={{ width: '10%' }}>Month</th>
                <th style={{ width: '10%' }}>Period</th>
                <th style={{ width: '20%' }} >Action</th>
              </tr>
            </thead>
            <tbody>

              <tr >
                <td style={{ cursor: 'pointer' }}>{ }</td>
                <td style={{ cursor: 'pointer' }}>{ }</td>
                <td style={{ cursor: 'pointer' }}>{ }</td>
                <td style={{ cursor: 'pointer' }}>{ }</td>
                <td style={{ cursor: 'pointer' }}>{ }</td>
                <td>
                  <Button variant='contained' style={{ marginRight: 5, width: '25%', fontSize: 12, fontWeight: 'bold' }} >Lock</Button>
                  <Button variant='contained' style={{ width: '25%', fontSize: 12, fontWeight: 'bold' }} onClick={handleOpenModal1} > View </Button>
                  <Button variant='contained' style={{ marginRight: 5, marginLeft: 5, width: '35%', fontSize: 12, fontWeight: 'bold' }} >Update</Button>
                </td>
              </tr>

            </tbody>
          </Table>


          <Modal open={openModal} onClose={handleCloseModal} closeAfterTransition>
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
                <Typography variant="h4" component="h2" sx={{ marginBottom: 2, fontWeight: 'bold' }}>
                  Generate Payroll
                </Typography>
                <Typography variant="h6" component="h2" sx={{ fontSize: 20, fontWeight: 'bold' }}>
                  Payroll Type
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', marginTop: 2, gap: 2 }}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      sx={{ width: '100%' }}
                      label="Date Start Point"
                      value={startDate}
                      onChange={(newValue) => setStartDate(newValue)}
                      renderInput={(params) => <TextField {...params} />}
                    />
                    <DatePicker
                      sx={{ width: '100%' }}
                      label="Date End Point"
                      value={endDate}
                      onChange={(newValue) => setEndDate(newValue)}
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </LocalizationProvider>
                </Box>


                {/* Payroll Type Selection *
                <Box display="flex" flexDirection="row" gap={2} sx={{ marginTop: 2 }}>
                  <Button variant="contained" onClick={() => handleSelectPayrollType('semi-monthly')} > Semi Monthly </Button>
                  <Button variant="contained" onClick={() => handleSelectPayrollType('monthly')} > Monthly </Button>
                  <Button variant="contained" onClick={() => handleSelectPayrollType('special-run')} > Special Run </Button>
                </Box>

                Conditional Rendering for Selected Payroll Type 
                {selectedPayrollType === 'semi-monthly' && (
                  <Box sx={{ marginTop: 2 }}>
                    <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', textAlign: 'center' }}>Semi Monthly Cycles:</Typography>
                    <Box display="flex" flexDirection="row" gap={2} sx={{ textAlign: 'center', marginBottom: 2, justifyContent: "space-between" }}>
                      <Typography variant="body1" >1st Cycle: 1 - 15</Typography>
                      <Typography variant="body1" >2nd Cycle: 16 - 31</Typography>
                    </Box>
                    <Box display="flex" flexDirection="row" gap={2} sx={{ textAlign: 'center', marginBottom: 2, justifyContent: "space-between" }}>
                      <Button variant="contained">1st Cycle </Button>
                      <Button variant="contained"> 2nd Cycle </Button>
                    </Box>
                  </Box>
                )}

                {selectedPayrollType === 'monthly' && (
                  <Box sx={{ marginTop: 2 }}>
                    <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', textAlign: 'center' }}>Monthly</Typography>
                    <Typography variant="body1" sx={{ textAlign: 'center', marginBottom: 2, }} >1 - 31</Typography>

                    <Box display="flex" flexDirection="row" gap={2} sx={{ textAlign: 'center', marginBottom: 2 }}>
                      <Button variant="contained">Month Cycle</Button>
                    </Box>
                  </Box>
                )}

                {selectedPayrollType === 'special-run' && (
                  <Box sx={{ marginTop: 2, textAlign: 'center' }}>
                  <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>Special Run:</Typography>
                  <Typography variant="body1" sx={{ marginBottom: 2 }}>13th Month Pay: January - December</Typography>
                
                  <Box display="flex" justifyContent="center" sx={{ marginBottom: 2 }}>
                    <Button variant="contained">Special run Cycle</Button>
                  </Box>
                </Box>
                
                )}

                
           {/* Action Buttons */}
                <Box sx={{ marginTop: 2, display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={(e) => {
                      e.preventDefault(); 
                      handleSubmit(e);
                    }}
                  >
                    Generate Payroll
                  </Button>
                  <Button variant="outlined" onClick={handleCloseModal}>
                    Close
                  </Button>
                </Box>

              </Box>
            </Box>
          </Modal>
          {/* View Payroll Modal */}
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
                <Typography variant="h4" component="h2" sx={{ marginBottom: 2, fontWeight: 'bold' }}>
                  Payroll
                </Typography>

                <LocalizationProvider dateAdapter={AdapterDayjs}>

                  <Table hoverRow sx={{ marginTop: 0, marginLeft: 0 }} borderAxis="both">
                    <thead>
                      <tr>

                        <th style={{ width: '10%' }}>Employee No.</th>
                        <th style={{ width: '20%' }}>Name</th>
                        <th style={{ width: '20%' }}>Gross Pay</th>
                        <th style={{ width: '20%' }}>Deductions</th>
                        <th style={{ width: '20%' }}>Net Pay</th>
                      </tr>
                    </thead>
                    <tbody>

                      <tr >
                        <td style={{ cursor: 'pointer' }} onClick={handleOpenModalViewEmpPayroll}>{ }</td>
                        <td style={{ cursor: 'pointer' }} onClick={handleOpenModalViewEmpPayroll}>{ }</td>
                        <td style={{ cursor: 'pointer' }} onClick={handleOpenModalViewEmpPayroll}>{ }</td>
                        <td style={{ cursor: 'pointer' }} onClick={handleOpenModalViewEmpPayroll}>{ }</td>
                        <td style={{ cursor: 'pointer' }} onClick={handleOpenModalViewEmpPayroll}>{ }</td>
                      </tr>

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

          <Modal //View Employee Payroll
            open={openModalViewEmpPayroll}
            onClose={handleCloseModalViewEmpPayroll}
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
              ><ModalClose />
                <Typography variant="h4" sx={{ marginBottom: 2 }}>
                  Payroll
                </Typography>
                <Box sx={{ marginTop: 2 }}>

                  <div className='rowC' style={{ marginBottom: 20 }} >
                    <Typography variant="h5" component="h2" style={{ display: 'flex', justifyContent: 'flex-start' }}>
                      Employee Information Payroll
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
                  <Typography variant="h6" component="h2" style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    Deductions
                  </Typography>

                  <div className='rowC'>
                    <TextField id="outlined-read-only-input" label="Bracket" defaultValue="No." InputProps={{ readOnly: true, }} style={marginstyle} sx={{ width: '15%' }} />
                    <TextField id="outlined-read-only-input" label="Excess Tax" defaultValue="Amount" InputProps={{ readOnly: true, }} style={marginstyle} sx={{ width: '25%' }} />
                    <TextField id="outlined-read-only-input" label="Fix Tax" defaultValue="Amount" InputProps={{ readOnly: true, }} style={marginstyle} sx={{ width: '25%' }} />
                    <TextField id="outlined-read-only-input" label="Total" defaultValue="Total Amount" InputProps={{ readOnly: true, }} style={marginstyle} sx={{ width: '30%' }} />
                  </div>

                  <div className='rowC'>

                    <TextField id="outlined-read-only-input" label="Social Security System" defaultValue="Amount" InputProps={{ readOnly: true, }} style={marginstyle} sx={{ width: '21%' }} />
                    <TextField id="outlined-read-only-input" label="PhilHealth" defaultValue="Amount" InputProps={{ readOnly: true, }} style={marginstyle} sx={{ width: '22%' }} />
                    <TextField id="outlined-read-only-input" label="Home Development Mutual Fund" defaultValue="Amount" InputProps={{ readOnly: true, }} style={marginstyle} sx={{ width: '22%' }} />
                    <TextField id="outlined-read-only-input" label="Total" defaultValue="Total Amount" InputProps={{ readOnly: true, }} style={marginstyle} sx={{ width: '30%' }} />

                  </div>


                  <Divider sx={{ my: 4 }} />
                  <Typography variant="h6" component="h2" style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    Loans
                  </Typography>

                  <div className='rowC'>

                    <TextField id="outlined-read-only-input" label="SSS Salary Loan" defaultValue="Amount" InputProps={{ readOnly: true, }} style={marginstyle} sx={{ width: '35%' }} />
                    <TextField id="outlined-read-only-input" label="HMDF Salary Loan" defaultValue="Amount" InputProps={{ readOnly: true, }} style={marginstyle} sx={{ width: '35%' }} />
                    <TextField id="outlined-read-only-input" label="Total" defaultValue="Total Amount" InputProps={{ readOnly: true, }} style={marginstyle} sx={{ width: '30%' }} />

                  </div>

                  <Divider sx={{ my: 4 }} />

                  <Typography variant="h6" component="h2" style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    Total Amount
                  </Typography>

                  <div className='rowC'>
                    <TextField id="outlined-read-only-input" label="Total Earnings" defaultValue="Total Amount of Earnings" InputProps={{ readOnly: true, }} style={marginstyle} sx={{ width: '33%' }} />
                    <TextField id="outlined-read-only-input" label="Total Deduction" defaultValue="Total Amount Deduction" InputProps={{ readOnly: true, }} style={marginstyle} sx={{ width: '33%' }} />
                    <TextField id="outlined-read-only-input" label="Total Loans" defaultValue="Total Amount of Loans" InputProps={{ readOnly: true, }} style={marginstyle} sx={{ width: '33%' }} />

                  </div>

                  <TextField id="outlined-read-only-input" label="Total Net Pay" defaultValue="Total Amount of Net Pay" InputProps={{ readOnly: true, }} style={marginstyle} sx={{ width: '98%' }} />


                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div onClick={handleCloseModalViewEmpPayroll} >
                      <Button variant="contained" style={buttonstyle}>Close</Button>
                    </div >
                  </div>

                </Box>
              </Box>
            </Box>
          </Modal>
        </Box>
      </Box>
    </>
  );
}
