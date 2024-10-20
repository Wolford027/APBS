import React, { useState, useEffect } from 'react';
import { Box, Modal, TextField, Autocomplete, Typography, Button } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import axios from 'axios';

export default function FileEmployeeLeave({ onOpen, onClose, empId }) {
    const [DateStart, setDateStart] = useState(null);
    const [DateEnd, setDateEnd] = useState(null);

    const [LeaveType, setLeaveType] = useState([]);
    const [selectedLeaveType, setSelectedLeaveType] = useState(null);

    // Fetch employee data (emp_info)
    const [EmpLeaveType, setEmpLeaveType] = useState([]);
    const [selectedEmpLeaveType, setSelectedEmpLeaveType] = useState(null);

    // Fetch Employee Leave Balance Data
    const [empLeaveBalance, setEmpLeaveBalance] = useState([]);
    const [currentLeaveData, setCurrentLeaveData] = useState({
        leave_balance: '',
        leave_spent: '',
        leave_remaining: ''
    });

    // Fetch Employee List
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
            // Fetch Leave Balance for the Selected Employee
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

            // Fetch Leave Types for the Selected Employee
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
            // Find the leave data for the selected leave type
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

    return (
        <Modal open={onOpen} onClose={onClose} closeAfterTransition>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', p: 2 }}>
                <Box sx={{
                    backgroundColor: 'white',
                    padding: 4,
                    width: { xs: '80%', sm: '60%', md: '50%' },
                    height: { xs: '80%', sm: '60%', md: '55%' },
                    boxShadow: 24,
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    overflowY: 'auto'
                }}>
                    <Typography variant='h4' sx={{ marginBottom: 2 }}>File Employee Leave</Typography>

                    <Box sx={{ marginTop: 2, margin: 3 }}>
                        <Box >
                            <Autocomplete
                                sx={{ width: '99%', marginLeft: 1 }}
                                size="small"
                                options={EmpLeaveType}
                                getOptionLabel={(option) => option.fullName}
                                renderInput={(params) => <TextField {...params} label="Select Employee" variant="outlined" />}
                                onChange={(event, value) => {
                                    if (value) {
                                        setSelectedEmpLeaveType(value.id);
                                    } else {
                                        setSelectedEmpLeaveType(null);
                                    }

                                    // Clear Leave Type and Date fields when a new employee is selected
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
                                options={LeaveType} // Updated Leave Type based on selected employee
                                getOptionLabel={(option) => option.leave_type_name || ''}
                                value={selectedLeaveType} // Controlled value prop to manage clearing
                                renderInput={(params) => <TextField {...params} label="Leave Type" />}
                                onChange={(event, value) => {
                                    setSelectedLeaveType(value);
                                }}
                                disabled={!selectedEmpLeaveType}  // Disable if no employee is selected
                            />
                        </Box>

                        {/* Leave Balance Display */}
                        <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 2 }}>
                            <TextField
                                label='Total Leave Balance'
                                sx={{ width: '33%', marginLeft: 1 }}
                                value={currentLeaveData.leave_balance || ''}
                                InputProps={{ readOnly: true }}
                            />
                            <TextField
                                label='Leave Spent'
                                sx={{ width: '33%', marginLeft: 1 }}
                                value={currentLeaveData.leave_spent || ''}
                                InputProps={{ readOnly: true }}
                            />
                            <TextField
                                label='Leave Remaining'
                                sx={{ width: '33%', marginLeft: 1 }}
                                value={currentLeaveData.leave_remaining || ''}
                                InputProps={{ readOnly: true }}
                            />
                        </Box>

                        {/* Date Pickers */}
                        <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 2 }}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    sx={{ width: '50%', marginLeft: 1 }}
                                    label='Date Start'
                                    value={DateStart}
                                    onChange={(newValue) => setDateStart(newValue)}
                                />
                            </LocalizationProvider>

                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    sx={{ width: '50%', marginLeft: 1 }}
                                    label='Date End'
                                    value={DateEnd}
                                    onChange={(newValue) => setDateEnd(newValue)}
                                />
                            </LocalizationProvider>
                        </Box>

                        <Box sx={{ display: 'flex', marginLeft: 'auto', flexDirection: 'row', justifyContent: 'flex-end' }}>
                            <Button
                                sx={{ borderRadius: 5, marginTop: 3, marginBottom: 3 }}
                                type='submit'
                                color='primary'
                                variant='contained'
                            >
                                Submit
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Modal>
    );
}
