import React, { useEffect, useState } from 'react';
import { Modal, Box, Typography, Button, TextField, Autocomplete, Snackbar, Alert, IconButton, Checkbox, TableCell } from '@mui/material';
import Table from '@mui/joy/Table';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';

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
        setEditRow(null);
        setSelectedItems([]); // Clear selected items when closing the modal

    };
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info", action: null });


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
        setEarndeductList([
            {
                selectedEmployee: null,
                selectedType: null,
                selectedDescription: null,
                amount: '',
                remarks: '',
                filteredPayDescriptions: []
            }
        ]);
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

    // Handle form submission
    const handleSubmit = () => {
        if (earndeductList.some(entry =>
            !entry.selectedEmployee || !entry.selectedType || !entry.selectedDescription || !entry.amount || !entry.remarks
        )) {
            setSnackbar({ open: true, message: "Please fill in all the fields", severity: "warning" });
            return;
        }

        // Convert data into an array for multiple inserts
        const earningsList = earndeductList.map(entry => ({
            pay_earn_deduct_id: empOnetimeEarningsId,
            year: details.year,
            month: details.month,
            payroll_type: details.payroll_type,
            cycle_type: details.cycle_type,
            emp_id: entry.selectedEmployee.emp_id,
            emp_fullname: entry.selectedEmployee.full_name_1,
            earning_or_deduction: entry.selectedType.name,
            pay_description: entry.selectedDescription.name,
            amount: entry.amount,
            remarks: entry.remarks
        }));

        axios.post("http://localhost:8800/submit_earnings_deductions", { earningsList })
            .then((response) => {
                if (response.data.insertIds && response.data.insertIds.length > 0) {
                    setSnackbar({ open: true, message: "Added successfully!", severity: "success" });

                    // Append new data to table
                    setEarndeduct(prev => [
                        ...prev,
                        ...earningsList.map((entry, index) => ({
                            emp_onetime_earn_deduct_per_emp_id: response.data.insertIds[index], // Assuming backend returns IDs
                            ...entry
                        }))
                    ]);

                    resetForm();
                } else {
                    setSnackbar({ open: true, message: "No IDs returned, something went wrong.", severity: "error" });
                }
            })
            .catch((error) => {
                console.error("Error submitting data:", error);
                setSnackbar({ open: true, message: "Error submitting earnings/deductions data", severity: "error" });
            });
    };

    const [earndeduct, setEarndeduct] = useState([]);

    useEffect(() => {
        if (!empOnetimeEarningsId) return;

        axios
            .get(`http://localhost:8800/earnings_deductions_per_emp/${empOnetimeEarningsId}`)
            .then((response) => {
                setEarndeduct(response.data); // Now setting an array
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
                setEarndeduct([]); // Handle errors by setting an empty array
            });
    }, [empOnetimeEarningsId]);

    const [editRow, setEditRow] = useState(null); // Track which row is in edit mode
    const [editedData, setEditedData] = useState({}); // Store edited values


    // Handle Edit Button Click
    const handleEditClick = (item) => {
        setEditRow(item.emp_onetime_earn_deduct_per_emp_id);
        setEditedData({
            amount: item.amount,
            remarks: item.remarks,
        });
    };

    // Handle Input Change
    const handleInputChange = (event, field) => {
        setEditedData(prev => ({
            ...prev,
            [field]: event.target.value,
        }));
    };

    // Handle Save Button Click (With Yes/No Confirmation)
    const handleSaveClick = (id) => {
        const originalItem = earndeduct.find(item => item.emp_onetime_earn_deduct_per_emp_id === id);

        // Check if no changes were made
        if (
            originalItem.amount === editedData.amount &&
            originalItem.remarks === editedData.remarks
        ) {
            setEditRow(null); // Exit edit mode silently
            return;
        }

        // Show confirmation Snackbar with Yes/No buttons
        setSnackbar({
            open: true,
            message: "Are you sure you want to save it? It will affect the employee payroll on the next cutoff.",
            severity: "warning",
            action: (
                <>
                    <Button color="inherit" size="small" onClick={() => confirmSave(id)}>
                        Yes
                    </Button>
                    <Button color="inherit" size="small" onClick={() => setSnackbar({ open: false })}>
                        No
                    </Button>
                </>
            ),
        });
    };

    const confirmSave = (id) => {
        const updatedData = {
            emp_onetime_earn_deduct_per_emp_id: id,
            amount: editedData.amount,
            remarks: editedData.remarks,
        };

        axios.post(`http://localhost:8800/update_earn_deduct/${id}`, updatedData)
            .then(() => {
                setEarndeduct((prev) =>
                    prev.map((item) =>
                        item.emp_onetime_earn_deduct_per_emp_id === id
                            ? { ...item, amount: updatedData.amount, remarks: updatedData.remarks }
                            : item
                    )
                );
                setEditRow(null);
                setSnackbar({ open: true, message: "Updated successfully!", severity: "success" });
            })
            .catch(error => console.error("Error updating data:", error));
    };



    // Handle Delete Button Click (With Yes/No Confirmation)
    const handleDeleteClick = (id) => {
        console.log("Clicked delete for ID:", id); // Debugging
        if (!id) {
            console.error("Error: ID is undefined!");
            return;
        }

        setSnackbar({
            open: true,
            message: "Are you sure you want to delete it? This will affect the employee payroll on the next cutoff.",
            severity: "warning",
            action: (
                <>
                    <Button color="inherit" size="small" onClick={() => confirmDelete(id)}>
                        Yes
                    </Button>
                    <Button color="inherit" size="small" onClick={() => setSnackbar({ open: false, message: "", severity: "" })}>
                        No
                    </Button>
                </>
            ),
        });
    };

    const confirmDelete = (id) => {
        console.log("Deleting ID:", id);
        if (!id) {
            console.error("Error: Attempting to delete with undefined ID");
            return;
        }

        axios.delete(`http://localhost:8800/delete_earn_deduct/${id}`)
            .then(() => {
                setEarndeduct((prev) => prev.filter(item => item.emp_onetime_earn_deduct_per_emp_id !== id));
                setSnackbar({ open: true, message: "Deleted successfully!", severity: "success" });
            })
            .catch(error => console.error("Error deleting data:", error));
    };

    const [earndeductList, setEarndeductList] = useState([
        {
            selectedEmployee: null,
            selectedType: null,
            selectedDescription: null,
            amount: '',
            remarks: '',
        }
    ]);

    const handleTypeChange = (index, newValue) => {
        setEarndeductList((prevList) =>
            prevList.map((entry, i) =>
                i === index
                    ? {
                        ...entry,
                        selectedType: newValue,
                        selectedDescription: null, // Reset description when type changes
                        filteredPayDescriptions: newValue
                            ? payDescriptions.filter(
                                (desc) => String(desc.earn_deduct_id) === String(newValue.earn_deduct_id)
                            )
                            : [],
                    }
                    : entry
            )
        );
    };

    // Function to add a new earnings/deductions row
    const handleAdd = () => {
        setEarndeductList([...earndeductList, { selectedEmployee: null, selectedType: null, selectedDescription: null, filteredPayDescriptions: [], amount: "", remarks: "" }]);
    };

    const confirmRemove = (index) => {
        const entry = earndeductList[index];
        if (entry.selectedEmployee || entry.selectedType || entry.selectedDescription || entry.amount || entry.remarks) {
            setSnackbar({
                open: true,
                message: "Are you sure you want to remove? This information filled will be unsaved.",
                severity: "warning",
                action: (
                    <>
                        <Button color="inherit" size="small" onClick={() => handleRemove(index)}>
                            Yes
                        </Button>
                        <Button color="inherit" size="small" onClick={() => setSnackbar({ ...snackbar, open: false })}>
                            No
                        </Button>
                    </>
                ),
            });
        } else {
            handleRemove(index);
        }
    };

    const handleRemove = (index) => {
        setEarndeductList(earndeductList.filter((_, i) => i !== index));
        setSnackbar({ open: true, message: "Successfully removed", severity: "success" });
    };
    const formatAmount = (amount) => {
        // Format the amount as PHP currency
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const [selectedItems, setSelectedItems] = useState([]); // Tracks selected row IDs

    const handleCheckboxChange = (id) => {
        setSelectedItems(prevSelected =>
            prevSelected.includes(id)
                ? prevSelected.filter(item => item !== id)  // Remove if already selected
                : [...prevSelected, id]  // Add if not selected
        );
    };
    const handleSelectAllChange = () => {
        if (selectedItems.length === earndeduct.length) {
            setSelectedItems([]);  // Deselect all if everything is selected
        } else {
            setSelectedItems(earndeduct.map(item => item.emp_onetime_earn_deduct_per_emp_id));  // Select all
        }
    };


    useEffect(() => {
        if (earndeduct.length === selectedItems.length) {
            setSelectAll(true); // All items are selected, so "select all" checkbox is checked
        } else {
            setSelectAll(false); // Not all items are selected
        }
    }, [selectedItems, earndeduct]);

    const [selectAll, setSelectAll] = useState(false); // Tracks the state of "select all" checkbox



    const handleSelectItem = (empOnetimeEarningId) => {
        setSelectedItems(prevSelected => {
            if (prevSelected.includes(empOnetimeEarningId)) {
                return prevSelected.filter(id => id !== empOnetimeEarningId); // Deselect item
            } else {
                return [...prevSelected, empOnetimeEarningId]; // Select item
            }
        });
    };


    // Proceed with deletion after confirmation
    const handleConfirmSelectedDelete = () => {
        if (selectedItems.length === 0) {
            console.log("No items selected");
            return;
        }

        // Show confirmation Snackbar before deleting
        setSnackbar({
            open: true,
            message: "Are you sure you want to delete the selected items? This will affect the employee payroll on the next cutoff.?",
            severity: "warning",
            action: (
                <>
                    <Button color="inherit" size="small" onClick={handleDeleteSelectedItems}>
                        Yes
                    </Button>
                    <Button color="inherit" size="small" onClick={() => setSnackbar({ ...snackbar, open: false })}>
                        No
                    </Button>
                </>
            ),
        });
    };

    // Function to delete selected items after confirmation
    const handleDeleteSelectedItems = () => {
        axios.delete("http://localhost:8800/delete_earnings_deductions", {
            data: { selectedItems }
        })
            .then(response => {
                setSnackbar({ open: true, message: "Selected data deleted successfully.", severity: "success" });
                setEarndeduct(prevData => prevData.filter(item => !selectedItems.includes(item.emp_onetime_earn_deduct_per_emp_id)));
                setSelectedItems([]);
            })
            .catch(error => {
                console.error("Error deleting data:", error);
                setSnackbar({ open: true, message: "Error deleting selected data", severity: "error" });
            });
    };

    const handleSelectAll = () => {
        if (selectedItems.length === earndeduct.length) {
            setSelectedItems([]); // Deselect all
        } else {
            setSelectedItems(earndeduct.map((item) => item.emp_onetime_earn_deduct_per_emp_id)); // Select all
        }
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
                            {earndeductList.map((entry, index) => (
                                <Box key={index} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 1, justifyContent: 'flex-start', width: '100%' }}>
                                    <Autocomplete
                                        sx={{ width: '20%', marginLeft: 1 }}
                                        options={employees}
                                        getOptionLabel={(emp) => emp.full_name}
                                        value={entry.selectedEmployee}
                                        onChange={(event, newValue) => {
                                            const updatedList = [...earndeductList];
                                            updatedList[index].selectedEmployee = newValue;
                                            setEarndeductList(updatedList);
                                        }}
                                        renderInput={(params) => <TextField {...params} label="Employee" placeholder="Select Employee" />}
                                    />

                                    <Autocomplete
                                        options={types}
                                        getOptionLabel={(option) => option.name || ""}
                                        value={entry.selectedType}
                                        onChange={(event, newValue) => handleTypeChange(index, newValue)}
                                        renderInput={(params) => <TextField {...params} label="Type" />}
                                        sx={{ width: '20%', marginLeft: 1 }}
                                    />

                                    <Autocomplete
                                        options={entry.filteredPayDescriptions}
                                        getOptionLabel={(option) => option.name || ""}
                                        value={entry.selectedDescription}
                                        onChange={(event, newValue) => {
                                            const updatedList = [...earndeductList];
                                            updatedList[index].selectedDescription = newValue;
                                            setEarndeductList(updatedList);
                                        }}
                                        renderInput={(params) => <TextField {...params} label="Description" />}
                                        sx={{ width: '20%', marginLeft: 1 }}
                                    />

                                    <TextField
                                        label="Amount"
                                        sx={{ width: '15%', marginLeft: 1 }}
                                        value={entry.amount}
                                        onChange={(e) => {
                                            const updatedList = [...earndeductList];
                                            updatedList[index].amount = e.target.value;
                                            setEarndeductList(updatedList);
                                        }}
                                    />

                                    <TextField
                                        label="Remarks"
                                        sx={{ width: '15%', marginLeft: 1 }}
                                        value={entry.remarks}
                                        onChange={(e) => {
                                            const updatedList = [...earndeductList];
                                            updatedList[index].remarks = e.target.value;
                                            setEarndeductList(updatedList);
                                        }}
                                    />

                                    {index > 0 && (
                                        <IconButton
                                            onClick={() => confirmRemove(index)}
                                            sx={{ marginLeft: 1 }}
                                            color="error"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    )}
                                </Box>
                            ))}


                            <Box sx={{ display: 'flex', flexDirection: 'row', marginBottom: 2, justifyContent: 'space-between', width: '100%' }}>
                                <Button
                                    variant="contained"
                                    sx={{ marginLeft: 1, width: '30%', marginBottom: 2 }}
                                    onClick={handleAdd}
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
                                        <th style={{ width: '5%' }}>
                                            <Checkbox
                                                checked={selectedItems.length === earndeduct.length && earndeduct.length > 0}
                                                indeterminate={selectedItems.length > 0 && selectedItems.length < earndeduct.length}
                                                onChange={handleSelectAll}
                                            />
                                        </th>
                                        <th style={{ width: '8%' }}>ID</th>
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
                                    {earndeduct && earndeduct.length > 0 ? (
                                        earndeduct.map((item) => (
                                            <tr key={item.emp_onetime_earn_deduct_per_emp_id}>
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedItems.includes(item.emp_onetime_earn_deduct_per_emp_id)}
                                                        onChange={() => handleCheckboxChange(item.emp_onetime_earn_deduct_per_emp_id)}
                                                    />

                                                </TableCell>
                                                <TableCell>{item.emp_onetime_earn_deduct_per_emp_id}</TableCell>
                                                <TableCell>{item.emp_id}</TableCell>
                                                <TableCell>{item.emp_fullname}</TableCell>
                                                <TableCell>{item.earning_or_deduction}</TableCell>
                                                <TableCell>{item.pay_description}</TableCell>
                                                <TableCell>
                                                    {editRow === item.emp_onetime_earn_deduct_per_emp_id ? (
                                                        <TextField
                                                            value={editedData.amount}
                                                            onChange={(e) => handleInputChange(e, 'amount')}
                                                            size="small"
                                                            type="number"
                                                            inputProps={{ step: '0.01' }}
                                                            placeholder="₱0.00"
                                                        />
                                                    ) : (
                                                        formatAmount(item.amount)
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {editRow === item.emp_onetime_earn_deduct_per_emp_id ? (
                                                        <TextField
                                                            value={editedData.remarks}
                                                            onChange={(e) => handleInputChange(e, 'remarks')}
                                                            size="small"
                                                        />
                                                    ) : (
                                                        item.remarks
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {selectedItems.length > 1 ? (
                                                        <Button
                                                            variant="contained"
                                                            color="error"
                                                            onClick={handleConfirmSelectedDelete}
                                                            style={{ fontSize: 12, fontWeight: 'bold' }}
                                                        >
                                                            Delete Selected
                                                        </Button>
                                                    ) : (
                                                        <>
                                                            <Button
                                                                variant="contained"
                                                                onClick={() => handleEditClick(item)}
                                                                style={{ marginRight: 5, fontSize: 12, fontWeight: 'bold' }}
                                                                disabled={selectedItems.length > 1} // Disable edit when multiple selected
                                                            >
                                                                Edit
                                                            </Button>
                                                            <Button
                                                                variant="contained"
                                                                color="error"
                                                                onClick={() => handleDeleteClick(item.emp_onetime_earn_deduct_per_emp_id)}
                                                                style={{ fontSize: 12, fontWeight: 'bold' }}
                                                            >
                                                                Delete
                                                            </Button>
                                                        </>
                                                    )}
                                                </TableCell>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="9" style={{ textAlign: 'center', padding: '10px' }}>
                                                No data found
                                            </td>
                                        </tr>
                                    )}
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
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={3000}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    anchorOrigin={{ vertical: "top", horizontal: "center" }} // Centered position
                >
                    <Alert
                        severity={snackbar.severity}
                        sx={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}
                        action={snackbar.action} // Ensure action buttons render
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Box>

        </Modal>
    );
}
