import React, { useState, useEffect } from 'react';
import { Box, Modal, TextField, Autocomplete, Typography, Button, Snackbar, Alert } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import CloseIcon from '@mui/icons-material/Close'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import axios from 'axios';
import dayjs from 'dayjs';

export default function FileEmployeeLeave({ onOpen, onClose, selectedEmployee , onInsert }) {
    const [DateStart, setDateStart] = useState(null);
    const [DateEnd, setDateEnd] = useState(null);
    const [LeaveType, setLeaveType] = useState([]);
    const [selectedLeaveType, setSelectedLeaveType] = useState(null);
    const [EmpLeaveType, setEmpLeaveType] = useState([]);
    const [selectedEmpLeaveType, setSelectedEmpLeaveType] = useState(null);
    const [empLeaveBalance, setEmpLeaveBalance] = useState([]);
    const [currentLeaveData, setCurrentLeaveData] = useState({
        leave_balance: '',
        leave_spent: '',
        leave_remaining: ''
    });

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // New state for severity

    // Fetch employee data (emp_info)
    useEffect(() => {
        const fetchEmpLeaveType = async () => {
            try {
                const response = await axios.get('http://localhost:8800/empfileleave');
                const formattedData = response.data.map(emp => ({
                    id: emp.emp_id,
                    fullName: `${emp.emp_id} - ${emp.f_name} ${emp.m_name ? emp.m_name + ' ' : ''}${emp.l_name}${emp.suffix ? ' ' + emp.suffix : ''}`.trim()
                    
                    
                }));
                setEmpLeaveType(formattedData);
                console.log('Fetched Employee Data:', formattedData);
            } catch (error) {
                console.error('Error fetching Employee data:', error);
            }
        };

        fetchEmpLeaveType();
    }, []);

    // Fetch Leave Types and Balance When Employee is Selected
    useEffect(() => {
        if (selectedEmpLeaveType) {
            const fetchEmpLeaveBalance = async () => {
                try {
                    const response = await axios.get(`http://localhost:8800/empleavebalance/${selectedEmpLeaveType}`);
                    setEmpLeaveBalance(response.data || []);
                    console.log('Fetched Employee Leave Balance:', response.data);
                } catch (error) {
                    console.error('Error fetching Employee Leave Balance:', error);
                }
            };

            fetchEmpLeaveBalance();

            const fetchLeaveTypes = async () => {
                try {
                    const response = await axios.get(`http://localhost:8800/empleavebalance/${selectedEmpLeaveType}`);
                    setLeaveType(response.data || []);
                    console.log('Fetched Leave Types:', response.data);
                } catch (error) {
                    console.error('Error fetching Leave Types:', error);
                }
            };

            fetchLeaveTypes();
        }
    }, [selectedEmpLeaveType]);

    // Update leave balance data when a leave type is selected
    useEffect(() => {
        if (selectedLeaveType) {
            const leaveData = empLeaveBalance.find(item => item.leave_type_name === selectedLeaveType.leave_type_name);
            if (leaveData) {
                setCurrentLeaveData({
                    leave_balance: leaveData.leave_balance || '',
                    leave_spent: leaveData.leave_spent || '',
                    leave_remaining: leaveData.leave_remaining || ''
                });
            }
        }
    }, [selectedLeaveType, empLeaveBalance]);

    const [confirmClose, setConfirmClose] = useState(false); // Confirm close dialog state

    const closeModal = () => {
        // Check if any relevant state indicates unsaved changes
        if (
            currentLeaveData.leave_balance !== '' ||
            currentLeaveData.leave_spent !== '' ||
            currentLeaveData.leave_remaining !== '' ||
            selectedLeaveType !== null ||
            selectedEmpLeaveType !== null ||
            DateStart !== null ||
            DateEnd !== null||
            totalDays !==''
        ) {
            setConfirmClose(true); // Show confirmation snackbar
        } else {
            resetForm(); // Reset the form
            onClose(); // Close the modal
        }
    };

    const handleConfirmClose = (confirm) => {
        if (confirm) {
            resetForm(); // Clear form fields
            onClose(); // Close the modal
        }
        setConfirmClose(false); // Hide the confirmation snackbar
    };


    const resetForm = () => {
       
        setSelectedEmpLeaveType(null); // Clear the selected employee
        setSelectedLeaveType(null);
        setTotalDays('')
        setDateStart(null);
        setDateEnd(null);
        setCurrentLeaveData({
            leave_balance: '',
            leave_spent: '',
            leave_remaining: ''
        });
    };

    const resetForm1 = () => {
        setSelectedLeaveType(null);
        setTotalDays('')
        setDateStart(null);
        setDateEnd(null);
        setCurrentLeaveData({
            leave_balance: '',
            leave_spent: '',
            leave_remaining: ''
        });
    };

    const [maxDate, setMaxDate] = useState(null);

    const handleSubmit = async () => {
        // Validate required fields
        if (!selectedEmpLeaveType || !selectedLeaveType || !DateStart || !DateEnd || totalDays <= 0) {
            setSnackbarMessage('Please fill in all fields.'); // Warning message for empty fields
            setSnackbarSeverity('warning'); // Set severity to warning
            setSnackbarOpen(true);
            return; // Exit the function early if validation fails
        }
    
        console.log('Validation passed, proceeding with data preparation.');
    
        const formattedDateStart = dayjs(DateStart).format('YYYY-MM-DD'); // Format to match SQL format
        const formattedDateEnd = dayjs(DateEnd).format('YYYY-MM-DD'); // Format to match SQL format
    
        const data = {
            emp_id: selectedEmpLeaveType, // Employee ID
            leave_type_id: selectedLeaveType?.leave_type_id,
            leave_type_name: selectedLeaveType?.leave_type_name,
            date_start: formattedDateStart,
            date_end: formattedDateEnd,
            leave_use: totalDays // Leave spent
        };
    
        console.log('Data to insert/update:', data); // Log the data before making the request
    
        try {
            // Insert or update leave data
            const insertResponse = await axios.post('http://localhost:8800/emp_leave_save', data);
            console.log('Successfully inserted/updated employee leave and balance:', insertResponse.data);
            onInsert();
            // Success notification
            setSnackbarMessage('Leave Submitted and Balance Updated Successfully!');
            setSnackbarSeverity('success'); // Set severity to success
            setSnackbarOpen(true);
    
            // Reset the form after successful submission
            resetForm();
    
        } catch (error) {
            console.error('Error saving employee leave or updating balance:', error);
    
            if (error.response) {
                // Check for existing leave record error
                if (error.response.status === 409) {
                    setSnackbarMessage('Leave record already exists for this employee with the same leave type and dates.');
                    setSnackbarSeverity('warning'); // Set severity to warning
                } else {
                    setSnackbarMessage('Error Submitting Leave. Please try again.');
                    setSnackbarSeverity('warning'); // Set severity to warning
                }
            } else {
                setSnackbarMessage('Network error. Please try again later.');
                setSnackbarSeverity('error'); // Set severity to error
            }
    
            setSnackbarOpen(true);
        }
    };
    
    const [totalDays, setTotalDays] = useState('');

    const handleDateStartChange = (newValue) => {
        console.log("DateStart Selected:", newValue);

        // Ensure newValue is a valid Day.js object
        if (newValue && newValue.isValid()) {
            setDateStart(newValue);

            // Calculate the maximum date based on remaining leave days
            if (currentLeaveData.leave_remaining) {
                const remainingDays = parseInt(currentLeaveData.leave_remaining, 10);
                const maxPossibleDate = newValue.add(remainingDays - 1, 'day'); // Adjusted to subtract 1
                setMaxDate(maxPossibleDate);
            } else {
                setMaxDate(null);
            }

            // Calculate total days if DateEnd is also selected
            if (DateEnd && DateEnd.isValid()) { // Check if DateEnd is valid
                const differenceInTime = DateEnd.valueOf() - newValue.valueOf();
                const calculatedDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
                setTotalDays(calculatedDays > 0 ? calculatedDays : 0);
            }
        } else {
            console.error("Invalid start date selected:", newValue);
        }
    };

    const handleDateEndChange = (newValue) => {
        console.log("DateEnd Selected:", newValue);

        // Ensure newValue is a valid Day.js object
        if (newValue && newValue.isValid()) {
            setDateEnd(newValue);

            // Check if DateStart is valid before proceeding
            if (DateStart && DateStart.isValid()) { // Check if DateStart is valid
                const differenceInTime = newValue.valueOf() - DateStart.valueOf();
                const calculatedDays = Math.ceil(differenceInTime / (1000 * 3600 * 24)) + 1;
                setTotalDays(calculatedDays > 0 ? calculatedDays : 0);
            }
        } else {
            console.error("Invalid end date selected:", newValue);
        }
    };

    return (
        <>
            <Modal open={onOpen} onClose={closeModal} closeAfterTransition>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', p: 2 }}>
                    <Box sx={{
                        backgroundColor: 'white',
                        padding: 4,
                        width: { xs: '80%', sm: '60%', md: '50%' },
                        height: { xs: '80%', sm: '60%', md: '55%' },
                        overflowX: 'hidden',
                        boxShadow: 24,
                        borderRadius: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        overflowY: 'hidden'
                    }}>
                        <CloseIcon onClick={closeModal} sx={{ cursor: 'pointer', marginLeft: 80 }} />
                        <Typography variant='h4' sx={{ marginBottom: 1 }}>File Employee Leave</Typography>

                        <Box sx={{ marginTop: 1, margin: 3 }}>
                            <Box>
                                <Autocomplete
                                    sx={{ width: '99%', marginLeft: 1 }}
                                    size="small"
                                    options={EmpLeaveType}
                                    getOptionLabel={(option) => option.fullName}
                                    value={EmpLeaveType.find(emp => emp.id === selectedEmpLeaveType) || null} // Controlled value
                                    renderInput={(params) => <TextField {...params} label="Select Employee" variant="outlined" />}
                                    onChange={(event, value) => {
                                        if (value) {
                                            setSelectedEmpLeaveType(value.id);
                                        } else {
                                            setSelectedEmpLeaveType(null);
                                        }

                                        setSelectedLeaveType(null);
                                        setDateStart(null);
                                        setDateEnd(null);
                                        setCurrentLeaveData({
                                            leave_balance: '',
                                            leave_spent: '',
                                            leave_remaining: ''
                                        });
                                    }}
                                />
                            </Box>

                            <Box sx={{ display: 'flex', marginTop: 2, alignItems: 'center', flexDirection: 'row' }}>
                                <Autocomplete
                                    sx={{ width: '100%', marginLeft: 1 }}
                                    size="small"
                                    options={LeaveType}
                                    getOptionLabel={(option) => option.leave_type_name || ''}
                                    value={selectedLeaveType}
                                    renderInput={(params) => <TextField {...params} label="Leave Type" />}
                                    onChange={(event, value) => {
                                        if (value) {
                                            setSelectedLeaveType(value);
                                        } else {
                                            // Clear the fields when Leave Type is cleared
                                            setSelectedLeaveType(null);
                                            setCurrentLeaveData({
                                                leave_balance: '',
                                                leave_spent: '',
                                                leave_remaining: ''
                                            });
                                            setDateStart(null);
                                            setDateEnd(null);
                                        }
                                    }}
                                    disabled={!selectedEmpLeaveType}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 2 }}>
                                <TextField
                                    label='Total Leave Balance'
                                    sx={{ width: '33%', marginLeft: 1 }}
                                    value={currentLeaveData.leave_balance || ''}
                                    InputProps={{ readOnly: true }}
                                />
                                <TextField
                                    label='Total Leave Spent'
                                    sx={{ width: '33%', marginLeft: 1 }}
                                    value={currentLeaveData.leave_spent || ''}
                                    InputProps={{ readOnly: true }}
                                />
                                <TextField
                                    label='Total Leave Remaining'
                                    sx={{ width: '33%', marginLeft: 1 }}
                                    value={currentLeaveData.leave_remaining || ''}
                                    InputProps={{ readOnly: true }}
                                />
                            </Box>

                            {/* Date Pickers */}
                            <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 2 }}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        sx={{ width: '40%', marginLeft: 1 }}
                                        label='Date Start'
                                        value={DateStart}
                                        onChange={handleDateStartChange} // Updated handler
                                    />
                                </LocalizationProvider>

                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        sx={{ width: '40%', marginLeft: 1 }}
                                        label='Date End'
                                        value={DateEnd}
                                        onChange={handleDateEndChange} // Change this to lowercase "onChange"
                                        minDate={DateStart} // Prevent selection of earlier dates
                                        maxDate={maxDate} // Optional: Prevent selection beyond max
                                    />

                                </LocalizationProvider>

                                <TextField
                                    sx={{ width: '20%', marginLeft: 1 }}
                                    label="Total Days"
                                    value={totalDays}
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                />


                            </Box>

                            <Box sx={{ display: 'flex', marginLeft: 'auto', flexDirection: 'row', justifyContent: 'flex-end' }}>
                                <Button
                                    sx={{ borderRadius: 5, marginTop: 3, marginBottom: 1, backgroundColor: '#407BFF', color: 'white' }}
                                    variant="contained"
                                    onClick={handleSubmit}

                                >
                                    Submit
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Modal>

            {confirmClose && (
                <Snackbar
                    open={confirmClose}
                    autoHideDuration={3000}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
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
            )}

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={snackbarSeverity === 'warning' || snackbarSeverity === 'success' ? 3000 : 6000} // Set duration based on severity
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbarOpen(false)}
                    severity={snackbarSeverity} // Use the severity state
                    sx={{ width: '100%' }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>

        </>
    );
}
