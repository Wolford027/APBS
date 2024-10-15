import React, { useState } from 'react'
import { Box, Modal, TextField, Autocomplete, Typography, Button } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { useDialogs } from '@toolpad/core'
import axios from 'axios'
import dayjs from 'dayjs';

export default function ViewEmp({ onOpen, onClose, emp_Info, selectedEmployee }) {
    const [value1, setValue1] = useState(null)
    const dialogs = useDialogs();

    const provinceOptions = ['Province1', 'Province2', 'Province3'];
    const cityOptions = ['City1', 'City2', 'City3'];

    // Format date if available, to display only 'YYYY-MM-DD'
    const bday = emp_Info.date_of_birth ? dayjs(emp_Info.date_of_birth).format('MM-DD-YYYY') : '';

    const datehired = emp_Info.emp_datehired ? dayjs(emp_Info.emp_datehired).format('MM-DD-YYYY') : '';
    const dateend = emp_Info.emp_dateend ? dayjs(emp_Info.emp_dateend).format('MM-DD-YYYY') : '';

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

    return (
        <>
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
                    }}
                    >
                        <Typography variant='h4' sx={{ marginBottom: 2 }}>Employee Information</Typography>
                        <Box sx={{ marginTop: 2, overscrollBehavior: 'contain' }}>
                            <Box sx={{ marginBottom: 5, display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Typography variant='h5'>Employee Personal Information</Typography>

                                <Box sx={{ display: 'flex', }}>
                                    <Button variant='contained'>Edit</Button>
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
                                <TextField label='Civil Status' inputProps={{ readOnly: true }} sx={{ width: '49%', marginLeft: 1 }} value={emp_Info.civil_status} />
                                <TextField label='Sex' inputProps={{ readOnly: true }} sx={{ width: '49%', marginLeft: 1  }} value={emp_Info.sex} />
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'row',marginTop: 2 }}>
                                <TextField label='Date of Birth' inputProps={{ readOnly: true }} sx={{ width: '33%', marginLeft: 1 }} value={bday} />
                                <TextField label='Province of Birth ' inputProps={{ readOnly: true }} sx={{ width: '33%', marginLeft: 1 }} value={emp_Info.province_of_birth} />
                                <TextField label='City of Birth' inputProps={{ readOnly: true }} sx={{ width: '33%', marginLeft: 1 }} value={emp_Info.city_of_birth} />
                            </Box>
                            <Typography variant='h5' sx={{ marginTop: 3 }}>Contact Information</Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 2 }}>
                                <TextField label='Email Address' value={emp_Info.email}  sx={{ marginLeft: 1, width: '50%' }}inputProps={{ readOnly: true }}/>
                                <TextField label='Mobile Number'value={emp_Info.mobile_num}sx={{ marginLeft: 1, width: '50%' }}inputProps={{ readOnly: true }} />
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'row',  marginTop: 2 }}>
                                <TextField label='Region' value={emp_Info.region} sx={{ marginLeft: 1, width: '50%' }}inputProps={{ readOnly: true }}/>
                                <TextField label='Province'value={emp_Info.province} sx={{ marginLeft: 1, width: '50%' }}inputProps={{ readOnly: true }} />
                                <TextField label='Municipality/City' value={emp_Info.city}  sx={{ marginLeft: 1, width: '50%' }}inputProps={{ readOnly: true }}/>
                                <TextField label='Barangay'value={emp_Info.barangay} sx={{ marginLeft: 1, width: '50%' }}inputProps={{ readOnly: true }} />
                            </Box>

                            <TextField label='Street Address' inputProps={{ readOnly: true }}  name='StreetAddress' sx={{ marginLeft: 1, marginTop: 2, width: '99%' }} value={emp_Info.street_add}  />

                            <Typography variant='h5' sx={{ marginTop: 5 }}>Employee Educational Attainment & Work Experience</Typography>
                            <Box sx={{ marginTop: 2, display: 'flex', gap: 2, flexDirection: 'column' }}>
                                <TextField label='Highschool' sx={{ width: '45%', marginLeft: 1 }} inputProps={{ readOnly: true }} />
                                <TextField label='Senior Highschool' sx={{ width: '45%', marginLeft: 1 }} inputProps={{ readOnly: true }} />
                                <TextField label='College' sx={{ width: '45%', marginLeft: 1 }} inputProps={{ readOnly: true }} />
                                <TextField label='Vocational' sx={{ width: '45%', marginLeft: 1 }} inputProps={{ readOnly: true }} />
                            </Box>    
                            
                            <Typography variant='h5' sx={{ marginTop: 3 }}>Employee Information</Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 2 }}>
                                <TextField label='Position' value={emp_Info.emp_pos} sx={{ marginLeft: 1, width: '50%' }}inputProps={{ readOnly: true }}/>
                                <TextField label='Rate Type'value={emp_Info.emp_ratetype} sx={{ marginLeft: 1, width: '50%' }}inputProps={{ readOnly: true }} />
                              
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 2 }}>
                                <TextField label='Rate' value={emp_Info.emp_rate} sx={{ marginLeft: 1, width: '40%' }}inputProps={{ readOnly: true }}/>
                                <TextField label='Status'value={emp_Info.emp_status} sx={{ marginLeft: 1, width: '40%' }}inputProps={{ readOnly: true }} />
                                <TextField label='Employment Type'value={emp_Info.emp_emptype} sx={{ marginLeft: 1, width: '40%' }}inputProps={{ readOnly: true }} />
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 2 }}>
                                <TextField label='Date of Hired' value={datehired} sx={{ marginLeft: 1, width: '49%' }}inputProps={{ readOnly: true }}/>
                                <TextField label='Date of End'value={dateend} sx={{ marginLeft: 1, width: '49%' }}inputProps={{ readOnly: true }} />
                                
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
