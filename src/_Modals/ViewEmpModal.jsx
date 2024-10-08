import React,{ useState } from 'react'
import { Box, Modal, TextField, Autocomplete, Typography, Button } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { useDialogs } from '@toolpad/core'
import axios from 'axios'

export default function ViewEmp({onOpen, onClose, emp_Info, selectedEmployee}) {
    const [value1, setValue1] = useState(null)
    const dialogs = useDialogs();

    const provinceOptions = ['Province1', 'Province2', 'Province3'];
    const cityOptions = ['City1', 'City2', 'City3'];

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
          } else {
            await dialogs.alert('Ok, forget about it!');
          }
        }
        archiveEmployee();
    };

  return (
    <>
        <Modal open={onOpen} onClose={onClose} closeAfterTransition>
            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', p: 2}}>
                <Box sx={{
                    backgroundColor: 'white',
                    padding: 4,
                    width: {xs: '80%', sm: '60%', md: '50%'},
                    height: {xs: '80%', sm: '60%', md: '70%'},
                    boxShadow: 24,
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    overflow: 'hidden',
                    overflowY: 'auto'}}
                >
                    <Typography variant='h4' sx={{marginBottom: 2}}>Employee Information</Typography>
                    <Box sx={{marginTop: 3, overscrollBehavior: 'contain'}}>
                        <Box sx={{marginBottom: 5, display: 'flex', flexDirection: 'row'}}>
                            <Typography variant='h4'>Employee Personal Information</Typography>
                            <Box sx={{display: 'flex', justifyContent: 'right'}}>
                                <Button variant='contained'>Edit</Button>
                                <Button variant='contained' sx={{marginLeft: 3}} onClick={() => handleArchive(selectedEmployee?.id, true)}>Archive</Button>
                            </Box>
                        </Box>
                        <Box sx={{display: 'flex', flexDirection: 'row'}}>
                            <TextField label='Surname' inputProps={{readOnly: true}} sx={{width: '25%', marginLeft: 3}} value={emp_Info.l_name} />
                            <TextField label='First Name' inputProps={{readOnly: true}} sx={{width: '25%', marginLeft: 3}} value={emp_Info.f_name} />
                            <TextField label='Middle Name' inputProps={{readOnly: true}} sx={{width: '25%', marginLeft: 3}} value={emp_Info.m_name} />
                            <TextField label='Suffix' inputProps={{readOnly: true}} sx={{width: '25%', marginLeft: 3}} value={emp_Info.suffix} />
                        </Box>
                        <Box sx={{display: 'flex', flexDirection: 'row'}}>
                            <Autocomplete
                                sx={{width: '30%', marginLeft: 3, marginTop: 3}}
                                renderInput={(params) => (
                                    <TextField {...params} label='Civil Status' />
                                )}
                                onChange={() => {}}
                            />
                            <Autocomplete
                                sx={{width: '30%', marginLeft: 3, marginTop: 3}}
                                renderInput={(params) => (
                                    <TextField {...params} label='Sex' />
                                )}
                                onChange={() => {}}
                            />
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    sx={{width: '30%', marginTop: 3, marginLeft: 3}}
                                    label='Date of Birth'
                                    value={value1}
                                    onChange={(newValue) => setValue1(newValue)} />
                            </LocalizationProvider>
                        </Box>
                        <Box sx={{display: 'flex', flexDirection: 'row'}}>
                            <Autocomplete
                                sx={{width: '30%', marginLeft: 3, marginTop: 3}}
                                disablePortal
                                id='Province'
                                options={provinceOptions}
                                renderInput={(params) => <TextField {...params} label='Province of Birth' />}
                                onChange={() => {}}
                            />
                            <Autocomplete
                                sx={{width: '30%', marginLeft: 3, marginTop: 3}}
                                disablePortal
                                id='City'
                                options={cityOptions}
                                renderInput={(params) => <TextField {...params} label='City of Birth' />}
                                onChange={() => {}}
                            />
                        </Box>
                        <Typography variant='h5' sx={{marginTop: 5}}>Contact Information</Typography>
                        <Box sx={{display: 'flex', flexDirection: 'row', marginTop: 3}}>
                            <TextField
                                label='Email Address'
                                placeholder='Enter Email'
                                name='email'
                                sx={{marginLeft: 3, width: '50%'}}
                                onChange={() => {}}
                                inputProps={{readOnly: true}}
                            />
                            <TextField
                                label='Mobile Number'
                                placeholder='Enter Mobile Number'
                                name='mobile'
                                sx={{marginLeft: 3, width: '50%'}}
                                onChange={() => {}}
                                inputProps={{readOnly: true}}
                            />
                        </Box>
                        <Box sx={{display: 'flex', flexDirection: 'row'}}>
                            <Autocomplete
                                sx={{marginLeft: 3, marginTop:3, width: '50%'}}
                                disablePortal
                                id='Region'
                                options={provinceOptions}
                                renderInput={(params) => <TextField {...params} label='Region' />}
                                onChange={() => {}}
                            />
                            <Autocomplete
                                sx={{marginLeft: 3, marginTop:3, width: '50%'}}
                                disablePortal
                                id='Province'
                                options={provinceOptions}
                                renderInput={(params) => <TextField {...params} label='Province' />}
                                onChange={() => {}}
                            />
                            <Autocomplete
                                sx={{marginLeft: 3, marginTop:3, width: '50%'}}
                                disablePortal
                                id='Municipality/City'
                                options={provinceOptions}
                                renderInput={(params) => <TextField {...params} label='Municipality/City' />}
                                onChange={() => {}}
                            />
                            <Autocomplete
                                sx={{marginLeft: 3, marginTop:3, width: '50%'}}
                                disablePortal
                                id='Barangay'
                                options={provinceOptions}
                                renderInput={(params) => <TextField {...params} label='Barangay' />}
                                onChange={() => {}}
                            />
                        </Box>
                        <Typography variant='h5' sx={{marginTop: 5}}>Employee Educational Attainment & Work Experience</Typography>
                        <Box sx={{marginTop: 3, display: 'flex', gap: 2, flexDirection: 'column'}}>
                            <TextField label='Highschool' sx={{width: '45%', marginLeft: 3}} inputProps={{readOnly: true}} />
                            <TextField label='Senior Highschool' sx={{width: '45%', marginLeft: 3}} inputProps={{readOnly: true}} />
                            <TextField label='College' sx={{width: '45%', marginLeft: 3}} inputProps={{readOnly: true}} />
                            <TextField label='Vocational' sx={{width: '45%', marginLeft: 3}} inputProps={{readOnly: true}} />
                        </Box>
                        <Typography variant='h5' sx={{marginTop: 5}}>Employee Information</Typography>
                        <Box sx={{display: 'flex', flexDirection: 'column', marginTop: 3, gap: 2}}>
                            <Autocomplete
                                sx={{marginLeft: 3, width: '50%'}}
                                renderInput={(params) => (<TextField {...params} label='Positon' />)}
                                onChange={() => {}}
                            />
                            <Autocomplete
                                sx={{marginLeft: 3, width: '50%'}}
                                renderInput={(params) => (<TextField {...params} label='Rate Type' />)} 
                                onChange={() => {}}
                            />
                            <TextField
                                label='Rate'
                                inputProps={{readOnly: true}}
                                sx={{width: '50%', marginLeft: 3}}
                            />
                            <Autocomplete
                                sx={{marginLeft: 3, width: '50%'}}
                                renderInput={(params) => (<TextField {...params} label='Status' />)} 
                                onChange={() => {}}
                            />
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    sx={{marginLeft: 3, width: '40%'}}
                                    label='Date of Hired'
                                    value={value1}
                                    onChange={(newValue) => setValue1(newValue)}
                                />
                            </LocalizationProvider>
                        </Box>
                        <Typography variant='h5' sx={{marginTop: 5}}>Employee Government Numbers</Typography>
                        <Box sx={{display: 'flex', flexDirection: 'column', marginTop: 3}}>
                            <TextField
                                fullWidth
                                sx={{marginLeft: 3, width: '50%'}}
                                label='Taxpayer Identification Number'
                                placeholder='Enter TIN No.'
                                name='tin'
                                onChange={() => {}}
                            />
                            <TextField
                                sx={{marginLeft: 3, width: '50%', marginTop: 3}}
                                label='Social Security System'
                                placeholder='Enter SSS No.'
                                name='sss'
                                onChange={() => {}}
                            />
                            <TextField
                                sx={{marginLeft: 3, width: '50%', marginTop: 3}}
                                label='PhilHealth'
                                placeholder='Enter PhilHealth No.'
                                name='philhealth'
                                onChange={() => {}}
                            />
                            <TextField
                                sx={{marginLeft: 3, width: '50%', marginTop: 3}}
                                label='Home Development Mutual Fund'
                                placeholder='Enter HDMF No.'
                                name='hdmf'
                                onChange={() => {}}
                            />
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Modal>
    </>
  )
}
