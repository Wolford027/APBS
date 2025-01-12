import React, { useEffect, useState } from 'react';
import { Modal, Box, Typography, Button, TextField, Autocomplete } from '@mui/material';
import Table from '@mui/joy/Table';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

export default function ViewEarningsDeductions({ open, onClose, empOnetimeEarningsId }) {
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
        resetForm(); // Reset the form when closing the modal

    };

    const [details, setDetails] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [types, setTypes] = useState([]);
    const [payDescriptions, setPayDescriptions] = useState([]);
    const [filteredPayDescriptions, setFilteredPayDescriptions] = useState([]);

    // State variables to store the selected values
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedEmployeeID, setSelectedEmployeeID] = useState(null);
    const [selectedType, setSelectedType] = useState(null);
    const [selectedDescription, setSelectedDescription] = useState(null);
    const [amount, setAmount] = useState('');
    const [remarks, setRemarks] = useState('');

    const resetForm = () => {
        setSelectedEmployee(null);
        setSelectedType(null);
        setSelectedDescription(null);
        setAmount('');
        setRemarks('');
        setFilteredPayDescriptions([]); // Clear filtered descriptions as well
    };



    useEffect(() => {
        // Fetch employees
        axios.get('http://localhost:8800/name')
            .then(response => {
                // Modify the response data to concatenate emp_id and full_name
                const modifiedEmployees = response.data.map(emp => ({
                    ...emp,
                    full_name: `${emp.emp_id} - ${emp.f_name} ${emp.l_name}`, // Concatenate emp_id and full_name
                    full_name_1: ` ${emp.f_name} ${emp.l_name}`
                }));

                setEmployees(modifiedEmployees); // Set the modified data to the state
            })
            .catch(error => {
                console.error("Error fetching employees:", error);
            });


        // Fetch types (earn_deduct)
        axios.get('http://localhost:8800/option')
            .then((response) => {
                setTypes(response.data);
            })
            .catch((error) => {
                console.error('Error fetching types:', error);
            });

        // Fetch all pay descriptions
        axios.get('http://localhost:8800/pay_des')
            .then((response) => {
                setPayDescriptions(response.data);
            })
            .catch((error) => {
                console.error('Error fetching pay descriptions:', error);
            });
    }, []);

    const handleTypeChange = (event, newValue) => {
        setSelectedType(newValue);

        // Clear the selected pay description if type is removed
        if (!newValue) {
            setSelectedDescription(null);
            setFilteredPayDescriptions([]); // Clear the filtered pay descriptions when type is removed
        } else {
            // Filter pay descriptions based on the selected type's earn_deduct_id
            const filtered = payDescriptions.filter(
                (desc) => String(desc.earn_deduct_id) === String(newValue.earn_deduct_id)
            );
            setFilteredPayDescriptions(filtered); // Update the filtered pay descriptions
        }
    };

   

    // Handle form submission
    const handleSubmit = () => {
        if (!selectedEmployee || !selectedType || !selectedDescription || !amount || !remarks) {
            alert("Please fill in all the fields");
            return;
        }

        const data = {
            emp_id: selectedEmployee.emp_id, // Access emp_id directly from selectedEmployee
            emp_fullname: selectedEmployee.full_name_1, // Access full_details directly
            earning_or_deduction: selectedType.name, // Selected earning/deduction type
            pay_description: selectedDescription.name, // Selected pay description
            amount: amount, // Amount entered in the field
            remarks: remarks // Remarks entered in the field
        };

        axios.post('http://localhost:8800/submit_earnings_deductions', data)
            .then((response) => {
                alert(response.data.message);
                handleClose(); // Close the modal after submission
                resetForm();  // Reset the form fields
            })
            .catch((error) => {
                console.error('Error submitting data:', error);
                alert('Error submitting earnings/deductions data');
            });
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

                            <Box sx={{ display: 'flex', flexDirection: 'row', marginBottom: 1, justifyContent: 'flex-start', width: '100%' }}>
                                <Autocomplete
                                    sx={{ width: '30%', marginLeft: 1 }}
                                    options={employees.map((emp) => emp.full_name)}  // Displaying full_name
                                    value={selectedEmployee ? selectedEmployee.full_name : ""}
                                    onChange={(event, newValue) => {
                                        // Find the selected employee from the full_name
                                        const selectedEmp = employees.find(emp => emp.full_name === newValue);
                                        setSelectedEmployee(selectedEmp); // Save the entire employee object (emp_id, full_name, etc.)
                                    }}
                                    renderInput={(params) => <TextField {...params} label="Employee" placeholder="Select Employee" />}
                                />

                                <Autocomplete
                                    options={types}
                                    getOptionLabel={(option) => option.name || ""}
                                    value={selectedType}
                                    onChange={handleTypeChange}
                                    renderInput={(params) => <TextField {...params} label="Type" />}
                                    sx={{ width: '30%', marginLeft: 1 }}
                                />

                                <Autocomplete
                                    options={filteredPayDescriptions}
                                    getOptionLabel={(option) => option.name || ""}
                                    value={selectedDescription}
                                    onChange={(event, newValue) => setSelectedDescription(newValue)}
                                    renderInput={(params) => <TextField {...params} label="Description" />}
                                    sx={{ width: '30%', marginLeft: 1 }}
                                />
                         
                                <TextField
                                    label="Amount"
                                    sx={{ width: '30%', marginLeft: 1 }}
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                                <TextField
                                    label="Remarks"
                                    sx={{ width: '30%', marginLeft: 1 }}
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                />

                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'row', marginBottom: 2, justifyContent: 'space-between', width: '100%' }}>
                                <Button
                                    variant="contained"
                                    //onClick={() => handleRemoveBenefitsAllowance(index1)}
                                    sx={{ marginLeft: 1, width: '30', marginBottom: 2, justifyContent: 'flex-start', display: 'flex' }}
                                >
                                    Add Earnings/Deductions
                                </Button>
                                <Button
                                    variant="contained"
                                    sx={{ marginLeft: 1, width: '30', marginBottom: 2, }}
                                    onClick={handleSubmit} // Trigger the submit handler
                                >
                                    Submit
                                </Button>
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
