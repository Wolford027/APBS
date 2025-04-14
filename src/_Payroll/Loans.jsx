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
import ModalClose from '@mui/joy/ModalClose';
import Divider from '@mui/material/Divider';
import Grid from '@mui/joy/Grid';
import ViewListLoans from '../_Modals/ViewListLoans';
const drawerWidth = 240;

export default function Loan() {
  const [openModal, setOpenModal] = useState(false);
  const [value1, setValue1] = useState(null);
  const [value2, setValue2] = useState(null);
  const [viewListLoan, setViewListLoan] = useState(false)
  const [payroll, setPayroll] = useState([]);

  const [openModal1, setOpenModal1] = useState(false);
  const [payrollview, setPayroll1] = useState([]);

  const [openModalViewEmpPayroll, setOpenModalViewEmpLoans] = useState(false);
  const [viewemp, setViewemp] = useState([]);


  useEffect(() => {
    getPayroll();
  }, [value1]);

  function getPayroll() {
    axios.get('http://localhost:8800/get-loans').then(function (response) {
      console.log(response.data);
      setPayroll(response.data);
      setPayroll1(response.data);
    });
  }

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
  const handleOpenModalViewEmpLoans = () => {
    setOpenModalViewEmpLoans(true);
  };

  const handleCloseModalViewEmpLoans = () => {
    setOpenModalViewEmpLoans(false);
  };

  // Generate modal
  const handleOpenModal = () => {
    setValue1(null);
    setValue2(null);
    setOpenModal(true);
    setViewListLoan(true);
  };

  // Closing the modal
  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleCloseListLoans = () => {
    setViewListLoan(false);
  }

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
            <Typography variant="h6" noWrap component="div" > Loans </Typography>

          </Toolbar>
        </AppBar>
        <Box sx={{ flexGrow: 1, p: 3, mt: 7, ml: -11 }}>
          <Grid container spacing={0} direction="row" sx={{ flexGrow: 1, justifyContent: "space-between", alignItems: "center" }} >
            <Grid size={4} sx={{ marginLeft: -3 }}>
              <SearchBar />
            </Grid>
            <Grid size={4}>
              <Button type='Submit' color="primary" variant="outlined" sx={{ marginLeft: 3, }} onClick={handleOpenModal} > List Loans</Button>
            </Grid>
          </Grid>
          <Table hoverRow sx={{}} borderAxis="both">
            <thead>
              <tr>
                <th style={{ width: '10%' }}>Loan No.</th>
                <th style={{ width: '20%' }}>Date</th>
                <th style={{ width: '10%' }}>Year</th>
                <th style={{ width: '10%' }}>Month</th>
                <th style={{ width: '10%' }}>Period</th>
                <th style={{ width: '20%' }} >Actions</th>
              </tr>
            </thead>
            <tbody>
              {payroll.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '16px' }}>No data available</td>
                </tr>
              ) : (
                payroll.map((item, index) => (
                  <tr key={index}>
                    <td>{item.loanNo}</td>
                    <td>{item.date}</td>
                    <td>{item.year}</td>
                    <td>{item.month}</td>
                    <td>{item.period}</td>
                    <td>
                      <Button variant='contained' style={{ marginRight: 5, width: '25%', fontSize: 12, fontWeight: 'bold' }}>Lock</Button>
                      <Button variant='contained' style={{ width: '25%', fontSize: 12, fontWeight: 'bold' }} onClick={handleOpenModal1}>View</Button>
                      <Button variant='contained' style={{ marginRight: 5, marginLeft: 5, width: '35%', fontSize: 12, fontWeight: 'bold' }}>Reprocess</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          <ViewListLoans onOpen={viewListLoan} onClose={handleCloseListLoans} />
          {/* View Loans Modal */}
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
                  Loans
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
                      {payrollview.map((pay, key) => (
                        <tr key={key}>
                          <td style={{ cursor: 'pointer' }} onClick={handleOpenModalViewEmpLoans}>{pay.id}</td>
                          <td style={{ cursor: 'pointer' }} onClick={handleOpenModalViewEmpLoans}>{pay.name}</td>
                          <td style={{ cursor: 'pointer' }} onClick={handleOpenModalViewEmpLoans}>{pay.grosspay}</td>
                          <td style={{ cursor: 'pointer' }} onClick={handleOpenModalViewEmpLoans}>{pay.deduc}</td>
                          <td style={{ cursor: 'pointer' }} onClick={handleOpenModalViewEmpLoans}>{pay.netpay}</td>
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

          <Modal //View Employee Payroll
            open={openModalViewEmpPayroll}
            onClose={handleCloseModalViewEmpLoans}
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
                  <Typography variant="h6" component="h2" style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    Loans
                  </Typography>

                  <div className='rowC'>

                    <TextField id="outlined-read-only-input" label="SSS Salary Loan" defaultValue="Amount" InputProps={{ readOnly: true, }} style={marginstyle} sx={{ width: '47%' }} />
                    <TextField id="outlined-read-only-input" label="HMDF Salary Loan" defaultValue="Amount" InputProps={{ readOnly: true, }} style={marginstyle} sx={{ width: '47%' }} />

                  </div>

                  <TextField id="outlined-read-only-input" label="Total Loans" defaultValue="Total Amount of Loans" InputProps={{ readOnly: true, }} style={marginstyle} sx={{ width: '97%' }} />

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div onClick={handleCloseModalViewEmpLoans} >
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
