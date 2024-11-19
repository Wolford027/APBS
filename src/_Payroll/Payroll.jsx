import React, { useState, useEffect } from 'react'
import SideNav from '../Components/SideNav'
import Box from '@mui/material/Box'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Table from '@mui/joy/Table'
import axios from 'axios'
import { Button, Modal, TextField, Autocomplete, Snackbar, Alert, Portal } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import SearchBar from '../Components/SearchBar'
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import ModalClose from '@mui/joy/ModalClose';
import Divider from '@mui/material/Divider';
import Grid from '@mui/joy/Grid';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CloseIcon from '@mui/icons-material/Close'
import { format } from 'date-fns'
//import dayjs from 'dayjs'

const drawerWidth = 240;

export default function Payroll() {
  const [selectedCycle, setSelectedCycle] = useState(""); // Track the selected cycle
  const handleSelectPayrollType = (type) => {
    setSelectedCycle("");
    setSelectedPayrollType(type);
    setStartDate(null);
    setEndDate(null);
    setPayrollPreview(null); // Clear the preview when changing payroll type
  };
  const [payrollPreview, setPayrollPreview] = useState(null);
  const [selectedPayrollType, setSelectedPayrollType] = useState(null); // Tracks selected payroll type

  const [openModal, setOpenModal] = useState(false);
  const [openPreview, setOpenPreview] = useState(false);
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
  const handleOpenPreview = () => {
    if (!startDate || !endDate) {
      setSnackbarSeverity("warning");
      setSnackbarMessage("Please select Start and End Date to see the preview.");
      setSnackbarOpen(true);
      return;
    }

    // Calculate total days inclusively
    const totalDays =
      Math.ceil(
        (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
      ) + 1; // Add 1 to include the start date

    setPayrollPreview({
      payrollType: selectedPayrollType,
      startDate: startDate.toLocaleDateString(),
      endDate: endDate.toLocaleDateString(),
      totalDays,
    });

    // Open the preview modal
    setOpenPreview(true);
  };


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



  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    try {
      if (!startDate || !endDate) {
        setSnackbarSeverity("warning");
        setSnackbarMessage("Please select both start and end dates.");
        setSnackbarOpen(true);
        return;
      }
  
      // Calculate total days between start and end dates (including start date)
      const totalDays = Math.abs((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
  
      // Set the payroll preview
      setPayrollPreview({
        payrollType: selectedPayrollType,
        startDate: startDate.toLocaleDateString(),
        endDate: endDate.toLocaleDateString(),
        totalDays,
      });
  
      // Format dates as yyyy-mm-dd for backend (local time)
      const formatDate = (date) =>
        date.toLocaleDateString("en-CA", { timeZone: "Asia/Manila" }); // "en-CA" gives yyyy-mm-dd format
  
      const formattedStartDate = formatDate(new Date(startDate));
      const formattedEndDate = formatDate(new Date(endDate));
  
      // Check if payroll data exists for the given date range
      const validationResponse = await axios.post("http://localhost:8800/ViewPayrollPart1", {
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      });
  
      if (validationResponse.data.exists) {
        setSnackbarSeverity("warning");
        setSnackbarMessage("Payroll already exists for the selected dates.");
        setSnackbarOpen(true);
        return;
      }
  
      // Select the appropriate endpoint based on payroll type
      const payrollEndpoint =
        selectedPayrollType === "semi-monthly"
          ? "http://localhost:8800/payroll-part-1-sm"
          : selectedPayrollType === "monthly"
          ? "http://localhost:8800/payroll-part-1-m"
          : selectedPayrollType === "special-run"
          ? "http://localhost:8800/payroll-part-1-sr"
          : ""; // Default to empty if no valid payroll type
  
      if (!payrollEndpoint) {
        setSnackbarSeverity("warning");
        setSnackbarMessage("Invalid payroll type selected.");
        setSnackbarOpen(true);
        return;
      }
  
      // Fetch payroll data based on selected payroll type
      const fetchResponse = await axios.post(payrollEndpoint, {
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      });
  
      // Determine the appropriate insert endpoint based on cycle
      const insertEndpoint =
          selectedCycle === "1st"
          ? "http://localhost:8800/payroll-part-2-1st"
          : selectedCycle === "2nd"
          ? "http://localhost:8800/payroll-part-2-2nd"
          : selectedCycle === "monthly"
          ? "http://localhost:8800/payroll-part-2-m"
          : ""; // Default to empty if no valid payroll cycle
  
      if (!insertEndpoint) {
        setSnackbarSeverity("warning");
        setSnackbarMessage("Invalid payroll cycle selected.");
        setSnackbarOpen(true);
        return;
      }
  
      // Insert payroll data into the determined endpoint
      const insertResponse = await axios.post(insertEndpoint, {
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        payrollData: fetchResponse.data, // Send fetched data if needed
      });
  
      setSnackbarSeverity("success");
      setSnackbarMessage("Payroll data fetched and inserted successfully.");
      setSnackbarOpen(true);
  
      console.log("Payroll Data:", fetchResponse.data);
      console.log("Insert Response:", insertResponse.data);
    } catch (error) {
      setSnackbarSeverity("error");
      setSnackbarMessage(
        error.response?.data?.message || "Error fetching or inserting payroll data."
      );
      setSnackbarOpen(true);
      console.error("Error:", error.response || error.message);
    }
  };
  



  const [snackbarOpen, setSnackbarOpen] = useState(false); // For controlling snackbar visibility
  const [snackbarMessage, setSnackbarMessage] = useState(""); // For storing the snackbar message
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // For storing snackbar severity (e.g., 'warning', 'success', 'error')

  const [confirmClose, setConfirmClose] = useState(false); // For controlling the confirmation dialog state

  // Function to trigger a snackbar message with a specific severity
  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
    // Optionally, you can close the snackbar after a delay
    setTimeout(() => setSnackbarOpen(false), severity === 'warning' || severity === 'success' ? 3000 : 6000);
  };

  const handleConfirmClose = (confirm) => {
    if (confirm) {
      resetForm();
      handleCloseModal();
    }
    setConfirmClose(false); // Close the confirmation dialog
    setOpenModal(false);
  };
  // Closing the modal
  const handleClosePreview = () => {
    setOpenPreview(false);
  };

  const handleCloseModal = () => {
    if (
      (startDate && startDate !== '') ||
      (endDate && endDate !== '')

    ) {
      setConfirmClose(true); // Show confirmation snackbar
    } else {
      resetForm(); // Reset the form
      setOpenModal(false);
    }
  };

  const resetForm = () => {
    setEndDate(null);
    setStartDate(null);
    setSelectedPayrollType(null);
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
                <CloseIcon onClick={handleCloseModal} sx={{ cursor: 'pointer', marginLeft: '96%' }} />
                <Typography variant="h4" component="h2" sx={{ marginBottom: 2, fontWeight: 'bold' }}>
                  Generate Payroll
                </Typography>
                <Typography variant="h6" component="h2" sx={{ fontSize: 20, fontWeight: 'bold' }}>
                  Payroll Type
                </Typography>


                {/* Payroll Type Selection */}
                <Box display="flex" flexDirection="row" gap={2} sx={{ marginTop: 2 }}>
                  <Button
                    variant={selectedPayrollType === "semi-monthly" ? "contained" : "outlined"}
                    onClick={() => handleSelectPayrollType("semi-monthly")}
                  >
                    Semi Monthly
                  </Button>
                  <Button
                    variant={selectedPayrollType === "monthly" ? "contained" : "outlined"}
                    onClick={() => handleSelectPayrollType("monthly")}
                  >
                    Monthly
                  </Button>
                  <Button
                    variant={selectedPayrollType === "special-run" ? "contained" : "outlined"}
                    onClick={() => handleSelectPayrollType("special-run")}
                  >
                    Special Run
                  </Button>
                </Box>

                {/* Conditional Rendering for Selected Payroll Type */}
                {selectedPayrollType === "semi-monthly" && (
                  <Box sx={{ marginTop: 2 }}>
                    <Typography
                      variant="h6"
                      component="h2"
                      sx={{ fontWeight: "bold", textAlign: "center" }}
                    >
                      Semi Monthly Cycles:
                    </Typography>
                    <Box display="flex" flexDirection="row" gap={2} sx={{ textAlign: 'center', marginBottom: 2, justifyContent: 'space-between', }} >
                      <Typography variant="body1">1st Cycle: 1 - 15</Typography>
                      <Typography variant="body1">2nd Cycle: 16 - 31</Typography>
                    </Box>
                    <Box display="flex" flexDirection="row" gap={2} sx={{ textAlign: "center", marginBottom: 1, justifyContent: "space-between", }} >

                      <Button
                        variant={selectedCycle === "1st" ? "contained" : "outlined"}
                        onClick={() => {
                          setSelectedCycle("1st");
                          setStartDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
                          setEndDate(new Date(new Date().getFullYear(), new Date().getMonth(), 15));
                        }}
                      >
                        1st Cycle
                      </Button>
                      <Button
                        variant={selectedCycle === "2nd" ? "contained" : "outlined"}
                        onClick={() => {
                          setSelectedCycle("2nd");
                          setStartDate(new Date(new Date().getFullYear(), new Date().getMonth(), 16));
                          setEndDate(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0));
                        }}
                      >
                        2nd Cycle
                      </Button>
                    </Box>
                  </Box>
                )}

                {selectedPayrollType === "monthly" && (
                  <Box sx={{ marginTop: 2 }}>
                    <Typography
                      variant="h6"
                      component="h2"
                      sx={{ fontWeight: "bold", textAlign: "center" }}
                    >
                      Monthly
                    </Typography>
                    <Typography variant="body1" sx={{ textAlign: "center", marginBottom: 2 }}  >
                      Monthly: 1 - 31
                    </Typography>
                    <Box
                      display="flex"
                      flexDirection="row"
                      gap={2}
                      sx={{
                        textAlign: "center",
                        marginBottom: 1,
                        justifyContent: "center",
                      }}
                    >
                      <Button
                        variant={selectedCycle === "monthly" ? "contained" : "outlined"}
                        onClick={() => {
                          setSelectedCycle("monthly");
                          setStartDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
                          setEndDate(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0));
                        }}
                      >
                        Monthly Cycle
                      </Button>
                    </Box>
                  </Box>
                )}

                {selectedPayrollType === "special-run" && (
                  <Box sx={{ marginTop: 2, textAlign: "center" }}>
                    <Typography
                      variant="h6"
                      component="h2"
                      sx={{ fontWeight: "bold" }}
                    >
                      Special Run:
                    </Typography>
                    <Typography sx={{ marginBottom: 2 }}>
                      13th Month Pay: January - December
                    </Typography>
                    <Box display="flex" justifyContent="center" sx={{ marginBottom: 1 }}>
                      <Button
                        variant={selectedCycle === "special-run" ? "contained" : "outlined"}
                        onClick={() => {
                          setSelectedCycle("special-run");
                          setStartDate(new Date(new Date().getFullYear(), 0, 1));
                          setEndDate(new Date(new Date().getFullYear(), 11, 31));
                        }}
                      >
                        Special Run Cycle
                      </Button>
                    </Box>
                  </Box>
                )}

                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    marginTop: 2,
                    gap: 2,
                  }}
                >
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      sx={{ width: '100%' }}
                      label="Date Start Point"
                      value={startDate}
                      onChange={(newValue) => setStartDate(newValue)}
                      renderInput={(params) => <TextField {...params} />}
                      disabled={!selectedCycle} // Disable if no payroll type is selected
                      maxDate={
                        selectedPayrollType === 'semi-monthly'
                          ? new Date(new Date().getFullYear(), new Date().getMonth(), 15)
                          : selectedPayrollType === 'monthly'
                            ? new Date(new Date().getFullYear(), new Date().getMonth(), 31)
                            : new Date(new Date().getFullYear(), 11, 31)
                      }
                    />
                    <DatePicker
                      sx={{ width: '100%' }}
                      label="Date End Point"
                      value={endDate}
                      onChange={(newValue) => setEndDate(newValue)}
                      renderInput={(params) => <TextField {...params} />}
                      disabled={!selectedCycle} // Disable if no payroll type is selected
                      maxDate={
                        selectedPayrollType === 'semi-monthly'
                          ? new Date(new Date().getFullYear(), new Date().getMonth(), 16)
                          : selectedPayrollType === 'monthly'
                            ? new Date(new Date().getFullYear(), new Date().getMonth(), 31)
                            : new Date(new Date().getFullYear(), 11, 31)
                      }
                    />
                  </LocalizationProvider>
                </Box>

                {/* Action Buttons */}
                <Box sx={{ marginTop: 2, display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={handleOpenPreview}
                  >
                    Payroll Preview
                  </Button>
                  <Button variant="outlined" onClick={handleCloseModal}>
                    Close
                  </Button>
                </Box>

              </Box>
            </Box>
          </Modal>

          <Modal open={openPreview} onClose={handleClosePreview} closeAfterTransition>
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
                <CloseIcon onClick={handleClosePreview} sx={{ cursor: 'pointer', marginLeft: '96%' }} />
                <Typography variant="h4" component="h2" sx={{ marginBottom: 1, fontWeight: 'bold' }}>
                  Payroll Preview
                </Typography>

                {/* Payroll Preview */}
                {payrollPreview && (
                  <Box sx={{ marginTop: 4, padding: 2, border: '1px solid #ccc', borderRadius: '8px' }}>
                    <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                      Payroll Preview
                    </Typography>
                    <Typography variant="body1" sx={{ textAlign: 'center', marginBottom: 1 }}>
                      <strong>Payroll Type:</strong> {payrollPreview.payrollType}
                    </Typography>
                    <Typography variant="body1" sx={{ textAlign: 'center', marginBottom: 1 }}>
                      <strong>Start Date:</strong> {payrollPreview.startDate}
                    </Typography>
                    <Typography variant="body1" sx={{ textAlign: 'center', marginBottom: 1 }}>
                      <strong>End Date:</strong> {payrollPreview.endDate}
                    </Typography>
                    <Typography variant="body1" sx={{ textAlign: 'center' }}>
                      <strong>Total Days:</strong> {payrollPreview.totalDays}
                    </Typography>
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
                  <Button variant="outlined" onClick={handleClosePreview}>
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

      {confirmClose && (
        <Portal>
          <Snackbar
            open={confirmClose}
            autoHideDuration={3000}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            sx={{
              zIndex: 1301,  // Ensures it appears on top
            }}
          >
            <Alert
              severity="warning"
              action={
                <>
                  <Button color="inherit" size="small" onClick={() => handleConfirmClose(true)}>
                    Yes
                  </Button>
                  <Button color="inherit" size="small" onClick={() => handleConfirmClose(false)}>
                    No
                  </Button>
                </>
              }
            >
              Are you sure you want to close this? The data filled will not be saved.
            </Alert>
          </Snackbar>
        </Portal>
      )}

      {/* Main Snackbar */}
      <Portal>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={snackbarSeverity === 'warning' || snackbarSeverity === 'success' ? 3000 : 6000} // Set duration based on severity
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          sx={{
            zIndex: 1301,  // Ensures it appears on top
          }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={snackbarSeverity}
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Portal>

    </>
  );
}
