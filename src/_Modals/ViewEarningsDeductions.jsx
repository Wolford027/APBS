import React, { useEffect, useState } from 'react';
import { Modal, Box, Typography, Button, } from '@mui/material';
import Table from '@mui/joy/Table';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

export default function ViewEarningsDeductions({ open, onClose, empOnetimeEarningsId }) {
    const [details, setDetails] = useState(null); // Store earnings/deductions details

    // Effect to fetch data when the modal opens
    useEffect(() => {
        if (open && empOnetimeEarningsId) {
            setDetails(null); // Reset the details every time the modal opens
            axios
                .get(`http://localhost:8800/earnings_deductions/${empOnetimeEarningsId}`)
                .then((response) => {
                    setDetails(response.data); // Set the fetched details
                })
                .catch((error) => {
                    console.error('Error fetching earnings details:', error);
                });
        }
    }, [open, empOnetimeEarningsId]); // Re-fetch when the modal opens or empOnetimeEarningsId changes

    const handleClose = () => {
        onClose();
        setDetails(null); // Reset the details when closing the modal
    };

    return (
        <Modal open={open} onClose={handleClose} closeAfterTransition>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', p: 2 }}>
                <Box sx={{
                    backgroundColor: 'white',
                    padding: 5,
                    width: { xs: '100%', sm: '80%', md: '80%' },
                    height: { xs: '100%', sm: '80%', md: '70%' },
                    boxShadow: 24,
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    overflow: 'hidden',
                    overflowY: 'auto'
                }}>
                    <CloseIcon onClick={handleClose} sx={{ cursor: 'pointer', marginLeft: '96%' }} />
                    {details ? (
                        <>
                            <Typography
                                variant="h4"
                                component="h2"
                                sx={{
                                    marginBottom: 2,
                                    fontWeight: 'bold',
                                    textAlign: 'center', // Center the heading
                                }}
                            >
                                Earnings/Deductions Details
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', width: '100%', margin: 2 }} >
                                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start' }} >
                                    <Typography variant="h6" sx={{ marginRight: 2 }}>
                                        <strong>Year:</strong> {details.year}
                                    </Typography>
                                    <Typography variant="h6">
                                        <strong>Month:</strong> {details.month}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start' }}>
                                    <Typography variant="h6">
                                        <strong>Payroll & Cycle Type:</strong> {details.payroll_type} - {details.cycle_type}
                                    </Typography>
                                </Box>

                            </Box>




                            <Table hoverRow sx={{}} borderAxis="both">
                                <thead>
                                    <tr>
                                        <th style={{ width: '8%' }}>Emp ID</th>
                                        <th style={{ width: '15%' }}>Name</th>
                                        <th style={{ width: '10%' }}>Type</th>
                                        <th style={{ width: '15%' }}>Pay Description</th>
                                        <th style={{ width: '15%' }}>Amount</th>
                                        <th style={{ width: '20%' }}>Remarks</th>
                                        <th style={{ width: '20%' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td> </td>
                                        <td> </td>
                                        <td> </td>
                                        <td> </td>
                                        <td> </td>
                                        <td> </td>
                                        <td>
                                            <Button variant="contained" style={{ marginRight: 5, width: '25%', fontSize: 12, fontWeight: 'bold' }} >
                                                Edit
                                            </Button>
                                            <Button variant="contained" style={{ width: '25%', fontSize: 12, fontWeight: 'bold' }} >
                                                Delete
                                            </Button>

                                        </td>
                                    </tr>

                                </tbody>
                            </Table>
                            {/* Close Button */}
                            <Button variant="contained" onClick={handleClose} sx={{ mt: 2, width: '100px', justifycontent: 'flex-end' }}>
                                Close
                            </Button>
                        </>
                    ) : (
                        <Typography>Loading...</Typography>
                    )}
                </Box>
            </Box>
        </Modal>
    );
}
