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
                    <Box sx={{marginTop: 2, overscrollBehavior: 'contain'}}>
                        <Box sx={{marginBottom: 5, display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                            <Typography variant='h5'>Employee Personal Information</Typography>

                            <Box sx={{display: 'flex', }}>
                                <Button variant='contained'>Edit</Button>
                                <Button variant='contained' sx={{marginLeft: 1}} onClick={() => handleArchive(selectedEmployee?.id, true)}>Archive</Button>
                            </Box>
                        </Box>
                        <Box sx={{display: 'flex', flexDirection: 'row'}}>
                            <TextField label='Surname' inputProps={{readOnly: true}} sx={{width: '30%', marginLeft: 1}} value={emp_Info.l_name} />
                            <TextField label='First Name' inputProps={{readOnly: true}} sx={{width: '30%', marginLeft: 1}} value={emp_Info.f_name} />
                            <TextField label='Middle Name' inputProps={{readOnly: true}} sx={{width: '25%', marginLeft: 1}} value={emp_Info.m_name} />
                            <TextField label='Suffix' inputProps={{readOnly: true}} sx={{width: '16%', marginLeft: 1}} value={emp_Info.suffix} />
                        </Box>
                        <Box sx={{display: 'flex', flexDirection: 'row'}}>
                            <Autocomplete
                                sx={{width: '49%', marginLeft: 1, marginTop: 2}}
                                renderInput={(params) => (
                                    <TextField {...params} label='Civil Status' />
                                )}
                                onChange={() => {}}
                            />
                            <Autocomplete
                                sx={{width: '49%', marginLeft: 1, marginTop: 2}}
                                renderInput={(params) => (
                                    <TextField {...params} label='Sex' />
                                )}
                                onChange={() => {}}
                            />
                           
                        </Box>
                        <Box sx={{display: 'flex', flexDirection: 'row'}}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    sx={{width: '33%', marginTop: 2, marginLeft: 1}}
                                    label='Date of Birth'
                                    value={value1}
                                    onChange={(newValue) => setValue1(newValue)} />
                            </LocalizationProvider>
                            <Autocomplete
                                sx={{width: '33%', marginLeft: 1, marginTop: 2}}
                                disablePortal
                                id='Province'
                                options={provinceOptions}
                                renderInput={(params) => <TextField {...params} label='Province of Birth' />}
                                onChange={() => {}}
                            />
                            <Autocomplete
                                sx={{width: '33%', marginLeft: 1, marginTop: 2}}
                                disablePortal
                                id='City'
                                options={cityOptions}
                                renderInput={(params) => <TextField {...params} label='City of Birth' />}
                                onChange={() => {}}
                            />
                        </Box>
                        <Typography variant='h5' sx={{marginTop: 5}}>Contact Information</Typography>
                        <Box sx={{display: 'flex', flexDirection: 'row', marginTop: 2}}>
                            <TextField
                                label='Email Address'
                                placeholder='Enter Email'
                                name='email'
                                sx={{marginLeft: 1, width: '50%'}}
                                onChange={() => {}}
                                inputProps={{readOnly: true}}
                            />
                            <TextField
                                label='Mobile Number'
                                placeholder='Enter Mobile Number'
                                name='mobile'
                                sx={{marginLeft: 1, width: '50%'}}
                                onChange={() => {}}
                                inputProps={{readOnly: true}}
                            />
                        </Box>
                        <Box sx={{display: 'flex', flexDirection: 'row'}}>
                            <Autocomplete
                                sx={{marginLeft: 1, marginTop:3, width: '50%'}}
                                disablePortal
                                id='Region'
                                options={provinceOptions}
                                renderInput={(params) => <TextField {...params} label='Region' />}
                                onChange={() => {}}
                            />
                            <Autocomplete
                                sx={{marginLeft: 1, marginTop:3, width: '50%'}}
                                disablePortal
                                id='Province'
                                options={provinceOptions}
                                renderInput={(params) => <TextField {...params} label='Province' />}
                                onChange={() => {}}
                            />
                            <Autocomplete
                                sx={{marginLeft: 1, marginTop:3, width: '50%'}}
                                disablePortal
                                id='Municipality/City'
                                options={provinceOptions}
                                renderInput={(params) => <TextField {...params} label='Municipality/City' />}
                                onChange={() => {}}
                            />
                            <Autocomplete
                                sx={{marginLeft: 1, marginTop:3, width: '50%'}}
                                disablePortal
                                id='Barangay'
                                options={provinceOptions}
                                renderInput={(params) => <TextField {...params} label='Barangay' />}
                                onChange={() => {}}
                            />
                        </Box>
                        <TextField label='Street Address' placeholder='House No./Street' name='StreetAddress' sx={{marginLeft: 1, marginTop: 2, width: '99%'}} />

                        <Typography variant='h5' sx={{marginTop: 5}}>Employee Educational Attainment & Work Experience</Typography>
                        <Box sx={{marginTop: 2, display: 'flex', gap: 2, flexDirection: 'column'}}>
                            <TextField label='Highschool' sx={{width: '45%', marginLeft: 1}} inputProps={{readOnly: true}} />
                            <TextField label='Senior Highschool' sx={{width: '45%', marginLeft: 1}} inputProps={{readOnly: true}} />
                            <TextField label='College' sx={{width: '45%', marginLeft: 1}} inputProps={{readOnly: true}} />
                            <TextField label='Vocational' sx={{width: '45%', marginLeft: 1}} inputProps={{readOnly: true}} />
                        </Box>    <Typography variant='h5' sx={{marginTop: 5}}>Employee Information</Typography>

                            <Box sx={{display: 'flex', flexDirection: 'row', marginTop: 2}}>
                                <Autocomplete
                                    sx={{marginLeft: 1, width: '50%'}}
                                    inputProps={{readOnly: true}}
                                    renderInput={(params) => (<TextField {...params} label='Positon' />)}
                                    onChange={() => {}}
                                />
                                <Autocomplete
                                    sx={{marginLeft: 1, width: '50%'}}
                                    inputProps={{readOnly: true}}
                                    renderInput={(params) => (<TextField {...params} label='Rate Type' />)} 
                                    onChange={() => {}}
                                />
                            </Box>
                            <Box sx={{display: 'flex', flexDirection: 'row', marginTop: 2}}>
                                <Autocomplete
                                    sx={{marginLeft: 1, width: '40%'}}
                                    disablePortal
                                    inputProps={{readOnly: true}}
                                    options={() => {}}
                                    renderInput={(params) => <TextField {...params} label='Rate' />}
                                />
                                <Autocomplete
                                    sx={{marginLeft: 1, width: '40%'}}
                                    disablePortal
                                    inputProps={{readOnly: true}}
                                    options={() => {}}
                                    renderInput={(params) => <TextField {...params} label='Status' />}
                                />
                                <Autocomplete
                                    sx={{marginLeft: 1, width: '40%'}}
                                    disablePortal
                                    inputProps={{readOnly: true}}
                                    options={() => {}}
                                    renderInput={(params) => <TextField {...params} label='Employment Type' />}
                                />
                            </Box>
                            <Box sx={{display: 'flex', flexDirection: 'row', marginTop: 2}}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        sx={{marginLeft: 1, width: '49%'}}
                                        label='Date of Hired'
                                        inputProps={{readOnly: true}}
                                        value={value1}
                                        onChange={(newValue) => setValue1(newValue)}
                                    />
                                </LocalizationProvider>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        sx={{marginLeft: 1, width: '49%'}}
                                        label='Date of End'
                                        inputProps={{readOnly: true}}
                                        value={value1}
                                        onChange={(newValue) => setValue1(newValue)}
                                    />
                                </LocalizationProvider>
                            </Box>
                            <Typography variant='h5' sx={{marginTop: 5}}>Employee Government Numbers</Typography>

                            <Box sx={{display: 'flex', flexDirection: 'row', marginTop: 2}}>

                                <TextField
                                    fullWidth
                                    sx={{marginLeft: 1, width: '49%' ,marginTop: 2}}
                                    label='Taxpayer Identification Number'
                                    inputProps={{readOnly: true}}                                    
                                    name='tin'
                                    onChange={() => {}}
                                />
                                <TextField
                                    sx={{marginLeft: 1, width: '48%', marginTop: 2}}
                                    label='Social Security System'
                                    inputProps={{readOnly: true}}
                                    name='sss'
                                    onChange={() => {}}
                                />
                                </Box>
                            <Box sx={{display: 'flex', flexDirection: 'row'}}>
                                <TextField
                                    sx={{marginLeft: 1, width: '49%', marginTop: 2}}
                                    label='PhilHealth'
                                    inputProps={{readOnly: true}}
                                    name='philhealth'
                                    onChange={() => {}}
                                />
                                <TextField
                                    sx={{marginLeft: 1, width: '49%', marginTop: 2}}
                                    label='Home Development Mutual Fund'
                                    inputProps={{readOnly: true}}
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
