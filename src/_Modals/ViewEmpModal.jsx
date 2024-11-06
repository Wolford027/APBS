import React, { useState, useEffect } from 'react'
import { Box, Modal, TextField, Typography, Button } from '@mui/material'
import { useDialogs } from '@toolpad/core'
import axios from 'axios'
import CloseIcon from '@mui/icons-material/Close'

export default function ViewEmp({ onOpen, onClose, emp_info, selectedEmployee }) {
    const [isEditable, setIsEditable] = useState(false);
    const [input, setInput] = useState([]);
    const [input1, setInput1] = useState([]);
    const [empId, setEmpId] = useState('');
    const [viewemp, setViewemp] = useState([]); // State to store employee list
    const dialogs = useDialogs();
    const [emp_Info, setEmpInfo] = useState(emp_info);
    

    const handleEdit = () => {
        if (isEditable) {
            // If currently in edit mode, save the changes
            saveChanges();
        }
        setIsEditable(!isEditable); // Toggle edit mode
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEmpInfo((prevInfo) => ({
            ...prevInfo,
            [name]: value
        }));
    };

    const saveChanges = async () => {
        try {
            const response = await axios.post('http://localhost:8800/save', emp_Info);
            if (response.data) {
                await dialogs.alert("Changes saved successfully!");
                onClose(); // Close the modal after saving
            }
        } catch (error) {
            console.error("Error saving changes:", error);
            await dialogs.alert("Failed to save changes.");
        }
    };
    
    useEffect(() => {
        setEmpInfo(emp_info);
    }, [emp_info])

    // Fetch employee list when the component mounts
    useEffect(() => {
        fetchAlldata();
    }, []);

       // Fetch educational background when an employee is selected
    useEffect(() => {
        if (empId) {
            fetchEducationalBackground(empId);  // Fetch educational background if empId is available
            fetchWorkExp(empId);  // Fetch work experience if empId is available
        }
    }, [empId]);  // This useEffect triggers when empId changes

    // Watch input1 state and log its value for debugging purposes
    useEffect(() => {
        console.log(input1);  // This will log the input1 state to check if data is properly fetched
    }, [input1]);

    // Inside ViewEmp function, after defining state variables
    useEffect(() => {
        if (selectedEmployee) {
            setEmpId(selectedEmployee.id); // Set empId when an employee is selected
        }
    }, [selectedEmployee]);

    const handleArchive = (id, is_archive) => {
        async function archiveEmployee() {
            const confirmed = await dialogs.confirm('Are you sure you want to Archive this employee?', {
                okText: 'Yes',
                cancelText: 'No',
            });
            if (confirmed) {
                try {
                    const response = await axios.put(`http://localhost:8800/emp/${id}`, { id: id, is_archive: is_archive });
                    if (response.data.status === 1) {
                        onClose(); // Close the modal
                    } else {
                        alert('Failed to update employee status');
                    }
                } catch (error) {
                    console.error('There was an error updating the employee status!', error);
                }
                await dialogs.alert("Archived Successfully");
                window.location.reload();
            } else {
                await dialogs.alert('Ok, forget about it!');
            }
        }
        archiveEmployee();
    };

    const EduBg = [
        { label: 'Highschool', id: 1, placeholder: 'Name of School', category: 'Grade' },
        { label: 'Senior Highschool', id: 2, placeholder: 'Name of School', category: 'Strand' },
        { label: 'College', id: 3, placeholder: 'Name of College or University', category: 'Course' },
        { label: 'Vocational', id: 4, placeholder: 'Name of School', category: 'Course' }
    ];


    // Function to fetch employee data
    const fetchAlldata = async () => {
        try {
            const res = await axios.get('http://localhost:8800/emp');
            setViewemp(res.data); // Set employee list
        } catch (err) {
            console.log(err);
        }
    };

    // Function to fetch educational background data
    const fetchEducationalBackground = async (id) => {
        try {
            const response = await axios.get(`http://localhost:8800/educationbg?emp_id=${id}`);
            const sortedData = response.data.sort((a, b) => a.school_uni_id - b.school_uni_id); // Sort by school_uni_id
            setInput(sortedData); // Set the sorted educational background data
        } catch (error) {
            console.error('Error fetching educational background:', error);
        }
    };

    // Fetch work experience and store it in input1 state
    const fetchWorkExp = async (id) => {
        try {
            const response = await axios.get(`http://localhost:8800/workexp?emp_id=${id}`);
            setInput1(response.data);  // Set the fetched data in input1
        } catch (error) {
            console.error('Error fetching work experience:', error);
        }
    };

    return (
        <>
            <Modal open={onOpen} onClose={onClose} closeAfterTransition>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', p: 2 }}>
                    <Box sx={{
                        backgroundColor: 'white',
                        padding: 4,
                        width: { xs: '90%', sm: '70%', md: '60%' },
                        height: { xs: '90%', sm: '70%', md: '80%' },
                        boxShadow: 24,
                        borderRadius: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        overflow: 'hidden',
                        overflowY: 'auto'
                    }}
                    >
                        <CloseIcon onClick={onClose} sx={{cursor: 'pointer', marginLeft: 80}} />
                        <Typography variant='h4' sx={{ marginBottom: 2 }}>Employee Information</Typography>
                        <Box sx={{ marginTop: 2, overscrollBehavior: 'contain' }}>
                            <Box sx={{ marginBottom: 5, display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Typography variant='h5'>Employee Personal Information</Typography>

                                <Box sx={{ display: 'flex', }}>
                                    <Button variant="contained" onClick={handleEdit}>
                                        {isEditable ? 'Save' : 'Edit'}
                                    </Button>
                                    <Button variant='contained' sx={{ marginLeft: 1 }} onClick={() => handleArchive(selectedEmployee?.id, true)}>Archive</Button>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                                <TextField label='Surname' inputProps={{ readOnly: true }} sx={{ width: '30%', marginLeft: 1 }} value={emp_Info.l_name} />
                                <TextField label='First Name' inputProps={{ readOnly: true }} sx={{ width: '30%', marginLeft: 1 }} value={emp_Info.f_name} />
                                <TextField label='Middle Name' inputProps={{ readOnly: true }} sx={{ width: '25%', marginLeft: 1 }} value={emp_Info.m_name} />
                                <TextField label='Suffix' inputProps={{ readOnly: true }} sx={{ width: '16%', marginLeft: 1 }} value={emp_Info.suffix} />
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 2 }}>
                                <TextField label='Civil Status' inputProps={{ readOnly: !isEditable }} name='civil_status' sx={{ width: '49%', marginLeft: 1 }} value={emp_Info.civil_status} onChange={handleInputChange} />
                                <TextField label='Sex' inputProps={{ readOnly: true }} sx={{ width: '49%', marginLeft: 1 }} value={emp_Info.sex} />
                                <TextField label='Citizenship' inputProps={{ readOnly: true }} sx={{ width: '49%', marginLeft: 1 }} value={emp_Info.emp_citi} />
                                <TextField label='Religion' inputProps={{ readOnly: true }} sx={{ width: '49%', marginLeft: 1 }} value={emp_Info.emp_religion} />
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 2 }}>
                                <TextField label='Date of Birth' inputProps={{ readOnly: true }} sx={{ width: '33%', marginLeft: 1 }} value={emp_Info.date_of_birth} />
                                <TextField label='Province of Birth ' inputProps={{ readOnly: true }} sx={{ width: '33%', marginLeft: 1 }} value={emp_Info.province_of_birth} />
                                <TextField label='City of Birth' inputProps={{ readOnly: true }} sx={{ width: '33%', marginLeft: 1 }} value={emp_Info.city_of_birth} />
                            </Box>
                            <Typography variant='h5' sx={{ marginTop: 3 }}>Contact Information</Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 2 }}>
                                <TextField label='Email Address' value={emp_Info.email} name='email' sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: !isEditable }} />
                                <TextField label='Mobile Number' value={emp_Info.mobile_num} name='mobile_num' sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: !isEditable }} />
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 2 }}>
                                <TextField label='Region' value={emp_Info.region} name='region' sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: !isEditable }} />
                                <TextField label='Province' value={emp_Info.province} name='province' sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: !isEditable }} />
                                <TextField label='Municipality/City' value={emp_Info.city} name='city' sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: !isEditable }} />
                                <TextField label='Barangay' value={emp_Info.barangay} sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: !isEditable }} />
                            </Box>

                            <TextField label='Street Address' inputProps={{ readOnly: !isEditable }} name='street_add' sx={{ marginLeft: 1, marginTop: 2, width: '99%' }} value={emp_Info.street_add} />

                            <Typography variant='h5' sx={{ marginTop: 5 }}>Employee Educational Attainment & Work Experience</Typography>
                            <Box sx={{ marginTop: 2, display: 'flex', flexDirection: 'column' }}>

                                {input.length > 0 ? (
                                    input.map((item, index) => {
                                        const educationDetail = EduBg.find(edu => edu.id === item.school_uni_id); // Find the matching educational label
                                        return (
                                            <Box key={index} sx={{ display: 'flex', flexDirection: 'row', marginBottom: 2 }}>
                                                <TextField
                                                    label={educationDetail ? educationDetail.placeholder : 'Unknown'} // Show the label based on the matched ID
                                                    sx={{ marginLeft: 1, width: '45%' }}
                                                    InputProps={{
                                                        readOnly: true,
                                                    }}
                                                    value={item.school_university} // Change this according to your API response structure
                                                />
                                                <TextField
                                                    label={educationDetail ? educationDetail.category : 'Unknown Category'} // Show the placeholder for the matched ID
                                                    sx={{ marginLeft: 1, width: '35%' }}
                                                    InputProps={{
                                                        readOnly: true,
                                                    }}
                                                    value={item.category} // Change this according to your API response structure
                                                />
                                                <TextField
                                                    label="Year"
                                                    value={item.year}
                                                    sx={{ marginLeft: 1, width: '20%' }}
                                                    InputProps={{
                                                        readOnly: true,
                                                    }}
                                                />
                                            </Box>
                                        );
                                    })
                                ) : (
                                    <Typography>No educational background data available.</Typography> // Message for no data
                                )}

                            </Box>
                            <Box sx={{ marginTop: 2, display: 'flex', gap: 2, flexDirection: 'column' }}>
                                {input1.length > 0 ? (
                                    input1.map((item1, index) => (
                                        <Box key={index} sx={{ display: 'flex', flexDirection: 'row' }}>
                                            <TextField
                                                label='Company Name'
                                                value={item1.company_name}
                                                sx={{ marginLeft: 1, width: '45%' }}
                                                inputProps={{ readOnly: true }} // Set the field as read-only
                                            />
                                            <TextField
                                                label='Position'
                                                value={item1.position}
                                                sx={{ marginLeft: 1, width: '35%' }}
                                                inputProps={{ readOnly: true }} // Set the field as read-only
                                            />
                                            <TextField
                                                label='Year'
                                                value={item1.year}
                                                sx={{ marginLeft: 1, width: '20%' }}
                                                inputProps={{ readOnly: true }} // Set the field as read-only
                                            />
                                        </Box>
                                    ))
                                ) : (
                                    <Typography>No Work Experience data available.</Typography>
                                )}
                            </Box>


                            <Typography variant='h5' sx={{ marginTop: 3 }}>Employee Information</Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 2 }}>
                                <TextField label='Employee ID' value={emp_Info.emp_id} name='emp_id' sx={{ marginLeft: 1, width: '20%' }} inputProps={{ readOnly: true }} />  
                                <TextField label='Status' value={emp_Info.emp_status} name='emp_status' sx={{ marginLeft: 1, width: '40%' }} inputProps={{ readOnly: !isEditable }} />
                                <TextField label='Employment Type' value={emp_Info.emp_emptype} name='emp_emptype' sx={{ marginLeft: 1, width: '40%' }} inputProps={{ readOnly: !isEditable }} />
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 2 }}>
                                 <TextField label='Position' value={emp_Info.emp_pos}  name='emp_pos' sx={{ marginLeft: 1, width: '33%' }} inputProps={{ readOnly: !isEditable }} />
                                <TextField
                                    label='Rate'
                                    value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP' }).format(emp_Info.emp_rate)}
                                    sx={{ marginLeft: 1, width: '33%' }}
                                    inputProps={{ readOnly: true }}
                                />
                                <TextField label='Rate Type' value={emp_Info.emp_ratetype} name='emp_ratetype' sx={{ marginLeft: 1, width: '33%' }} inputProps={{ readOnly: !isEditable }} />


                                
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 2 }}>
                                <TextField label='Department' value={emp_Info.emp_dept} name='emp_dept' sx={{ marginLeft: 1, width: '33%' }} inputProps={{ readOnly: !isEditable }} />
                                <TextField label='Date of Hired' value={emp_Info.emp_datehired} name='emp_datehired' sx={{ marginLeft: 1, width: '33%' }} inputProps={{ readOnly: !isEditable }} />
                                <TextField label='Date of End' value={emp_Info.emp_dateend} name='emp_dateend' sx={{ marginLeft: 1, width: '33%' }} inputProps={{ readOnly: !isEditable }} />
                            </Box>

                            <Typography variant='h5' sx={{ marginTop: 3 }}>Employee Government Numbers</Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 2 }}>

                                <TextField
                                    fullWidth
                                    sx={{ marginLeft: 1, width: '49%', marginTop: 2 }}
                                    label='Taxpayer Identification Number'
                                    inputProps={{ readOnly: true }}
                                    value={emp_Info.emp_tin}
                                />
                                <TextField
                                    sx={{ marginLeft: 1, width: '48%', marginTop: 2 }}
                                    label='Social Security System'
                                    inputProps={{ readOnly: true }}
                                    value={emp_Info.emp_sss}
                                />
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                                <TextField
                                    sx={{ marginLeft: 1, width: '49%', marginTop: 2 }}
                                    label='PhilHealth'
                                    inputProps={{ readOnly: true }}
                                    value={emp_Info.emp_philhealth}
                                />
                                <TextField
                                    sx={{ marginLeft: 1, width: '49%', marginTop: 2 }}
                                    label='Home Development Mutual Fund'
                                    inputProps={{ readOnly: true }}
                                    value={emp_Info.emp_hdmf}
                                />
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Modal>
        </>
    )
}
