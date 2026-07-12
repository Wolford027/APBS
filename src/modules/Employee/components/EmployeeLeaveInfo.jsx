import React, { useState, useEffect } from 'react';
import { Box, Modal, TextField, Typography } from '@mui/material';
import axios from 'axios';
import CloseIcon from '@mui/icons-material/Close'

export default function EmployeeLeaveInfo({ onOpen, onClose, selectedEmployee }) {
    const [leaveData, setLeaveData] = useState([]);
    const [leaveData1, setLeaveData1] = useState([]);
    const [leaveData2, setLeaveData2] = useState([]);
    const [employeeDetails, setEmployeeDetails] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEmployeeLeaveData = async () => {
            if (!selectedEmployee) {
                console.error('Selected employee data is not available');
                setError("No employee selected.");
                setLoading(false);
                return;
            }

            setLoading(true); // Start loading

            try {
                console.log("Fetching leave data for Employee ID:", selectedEmployee.emp_id);

                // Fetch data from both endpoints in parallel
                const [leaveTableResponse, leaveResponse , leavebalanceResponse] = await Promise.all([
                    axios.get(`http://localhost:8800/empleavetable/${selectedEmployee.emp_id}`),
                    axios.get(`http://localhost:8800/empleavebalance/${selectedEmployee.emp_id}`),
                    axios.get(`http://localhost:8800/empleavesaved/${selectedEmployee.emp_id}`)
                ]);

                // Log the full responses for debugging
                console.log("Leave Table Response Data:", leaveTableResponse.data);
                console.log("Leave Response Data:", leaveResponse.data);

                // Check the structure of the leave table response
                if (leaveTableResponse.data  && leavebalanceResponse.data && leaveResponse.data.length > 0) {
                    setLeaveData(leaveTableResponse.data);
                    setLeaveData1(leavebalanceResponse.data);
                    setLeaveData2(leaveResponse.data);
                    setEmployeeDetails({ 
                        emp_id: selectedEmployee.emp_id,
                        full_name: selectedEmployee.full_name,
                        total_leave: leaveTableResponse.data[0]?.total_leave_balance || 0,
                        total_consumed: leaveTableResponse.data[0]?.total_leave_spent || 0,
                        balance_leave: leaveTableResponse.data[0]?.total_leave_remaining || 0,
                        // TOTAL LEAVE
                        leave_type_name : leavebalanceResponse.data[0]?.leave_type_name|| '',
                        leave_balance: leavebalanceResponse.data[0]?.leave_balance || '',
                        leave_spent: leavebalanceResponse.data[0]?.leave_spent || '',
                        leave_remaining: leavebalanceResponse.data[0]?.leave_remaining || '',
                        //LIST LEAVE
                        leave_type_name: leaveResponse.data[0]?.leave_type_name || '',
                        leave_use : leaveResponse.data[0]?.leave_use|| '',
                        date_start : leaveResponse.data[0]?.date_start|| '',
                        date_end : leaveResponse.data[0]?.date_end|| '',
                    });
                } else {
                    setError("No leave data available for this employee.");
                }

                // Process the leave response if needed
                if (leaveResponse.data) {
                    // Log the leave response to see if it's correctly set
                    console.log("Leave Data:", leaveResponse.data);
                }

            } catch (error) {
                console.error('Error fetching employee leave data:', error.response ? error.response.data : error.message);
                setError("Failed to fetch employee leave data.");
            } finally {
                setLoading(false);
            }
        };

        if (onOpen) {
            fetchEmployeeLeaveData();
        }
    }, [onOpen, selectedEmployee]);

    console.log("Leave Data to Render:", leaveData); // Add this line for debugging

    return (
        <Modal open={onOpen} onClose={onClose} closeAfterTransition>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', p: 2 }}>
                <Box sx={{
                    backgroundColor: 'white',
                    padding: 4,
                    width: { xs: '80%', sm: '60%', md: '50%' },
                    height: { xs: '80%', sm: '60%', md: '70%' },
                    boxShadow: 24,
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    overflow: 'hidden',
                    overflowY: 'auto'
                }}>   
                    <CloseIcon onClick={onClose} sx={{ cursor: 'pointer', marginLeft: 80}} />
                    <Typography variant='h4' sx={{ marginBottom: 2 }}>Employee Leave</Typography>

                    {loading ? (
                        <Typography>Loading...</Typography>
                    ) : error ? (
                        <Typography color="error">{error}</Typography>
                    ) : (
                        <Box sx={{ marginTop: 2, overscrollBehavior: 'contain' }}>
                            <Typography variant='h5' sx={{ marginBottom: 2 }}>Employee Leave Information</Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                                <TextField label='Employee ID' value={employeeDetails.emp_id} inputProps={{ readOnly: true }} sx={{ width: '20%', marginLeft: 1 }} />
                                <TextField label='Full Name' value={employeeDetails.full_name} inputProps={{ readOnly: true }} sx={{ width: '80%', marginLeft: 1 }} />
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 2 }}>
                                <TextField label='Total Leave' value={employeeDetails.total_leave} inputProps={{ readOnly: true }} sx={{ width: '33%', marginLeft: 1 }} />
                                <TextField label='Total Consumed Leave' value={employeeDetails.total_consumed} inputProps={{ readOnly: true }} sx={{ width: '33%', marginLeft: 1 }} />
                                <TextField label='Total Balance Leave' value={employeeDetails.balance_leave} inputProps={{ readOnly: true }} sx={{ width: '33%', marginLeft: 1 }} />
                            </Box>
                            <Box>
                            <Typography variant='h5' sx={{ marginBottom: 2,marginTop:2 }}>Employee Leave List</Typography>
                            </Box>

                            <Box sx={{ marginTop: 2, display: 'flex', gap: 2, flexDirection: 'column' }}>
                                {leaveData2.length > 0 ? (
                                    leaveData2.map((item, index) => (
                                        <Box key={index} sx={{ display: 'flex', flexDirection: 'row' }}>
                                            <TextField
                                                label='Leave Type Name'
                                                value={item.leave_type_name}
                                                sx={{ marginLeft: 1, width: '30%' }}
                                                inputProps={{ readOnly: true }}
                                            />
                                            <TextField
                                                label='Leave Balance'
                                                value={item.leave_balance}
                                                sx={{ marginLeft: 1, width: '30%' }}
                                                inputProps={{ readOnly: true }}
                                            />
                                            <TextField
                                                label='Leave Consumed'
                                                value={item.leave_spent} // Ensure this matches the data field
                                                sx={{ marginLeft: 1, width: '20%' }}
                                                inputProps={{ readOnly: true }}
                                            />
                                            <TextField
                                                label='Leave Remaining'
                                                value={item.leave_remaining} // Ensure this field exists in your data
                                                sx={{ marginLeft: 1, width: '25%' }}
                                                inputProps={{ readOnly: true }}
                                            />
                                            
                                        </Box>
                                    ))
                                ) : (
                                    <Typography>No Leave data available.</Typography>
                                )}
                            </Box>
                            
                            <Box>
                            <Typography variant='h5' sx={{ marginBottom: 2,marginTop:2 }}>Employee Filed Leave</Typography>
                            </Box>
                            <Box sx={{ marginTop: 2, display: 'flex', gap: 2, flexDirection: 'column' }}>
                                {leaveData1.length > 0 ? (
                                    leaveData1.map((item, index) => (
                                        <Box key={index} sx={{ display: 'flex', flexDirection: 'row' }}>
                                            <TextField
                                                label='Leave Type Name'
                                                value={item.leave_type_name}
                                                sx={{ marginLeft: 1, width: '30%' }}
                                                inputProps={{ readOnly: true }}
                                            />
                                            <TextField
                                                label='Leave Consumed'
                                                value={item.leave_use} // Ensure this matches the data field
                                                sx={{ marginLeft: 1, width: '20%' }}
                                                inputProps={{ readOnly: true }}
                                            />
                                            <TextField
                                                label='Date Start'
                                                value={item.date_start} // Ensure this field exists in your data
                                                sx={{ marginLeft: 1, width: '25%' }}
                                                inputProps={{ readOnly: true }}
                                            />
                                            <TextField
                                                label='Date End'
                                                value={item.date_end} // Ensure this field exists in your data
                                                sx={{ marginLeft: 1, width: '25%' }}
                                                inputProps={{ readOnly: true }}
                                            />
                                        </Box>
                                    ))
                                ) : (
                                    <Typography>No Leave data available.</Typography>
                                )}
                            </Box>
                        </Box>
                    )}
                </Box>
            </Box>
        </Modal>
    );
}
