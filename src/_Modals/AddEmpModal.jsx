import React, {useState, useEffect} from 'react'
import { Box, Modal, TextField, Autocomplete, Typography, Button } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import SexPicker from '../_JSON/Sex.json'
import axios from 'axios'

export default function AddEmpModal({onOpen, onClose}) {
    const [input, setInput] = useState([])
    const [secondLabel, setSecondLabel] = useState([])
    const [value1, setValue1] = useState(null)

    const provinceOptions = ['Province1', 'Province2', 'Province3'];
    const cityOptions = ['City1', 'City2', 'City3'];
    const EduBg = [
        {label: 'Senior Highschool', id: 1},
        {label: 'Highschool', id: 1},
        {label: 'College', id: 2},
        {label: 'Vocational', id: 2}
      ]

    const handleSelectEducBg = (event, newValue) => {
        if (newValue) {
          setInput([...input, newValue.label])
          if (newValue.id === 2 && newValue.label === 'College') {
            setSecondLabel('Course')
          } else {
            setSecondLabel('Strand')
          }
        }
    }

    const HandleRemoveEducBg = (index) => {
        const updatedInputs = input.filter((_,i) => i !== index)
        setInput(updatedInputs)
    }

  return (
    <>
        <Modal
            open={onOpen}
            onClose={onClose}
            closeAfterTransition>
                <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', p: 2}}>
                    <Box sx={{
                        backgroundColor: 'white',
                        padding: 4,
                        width: { xs: '80%', sm: '60%', md: '50%' },
                        height: { xs: '80%', sm: '60%', md: '70%'},
                        boxShadow: 24,
                        borderRadius: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        overflow: 'hidden',
                        overflowY: 'auto'}}
                        >
                        <Typography variant='h4' sx={{marginBottom: 1}}>
                                Add Employee Information
                        </Typography>

                        <Box sx={{overscrollBehavior: 'contain'}}>

                        <Typography variant='h5' sx={{marginTop: 2}}>Personal Information</Typography>
                        
                            <Box sx={{display: 'flex', flexDirection: 'row' , marginTop: 2 }}>
                                <TextField
                                    label="Surname"
                                    placeholder="Enter Surname"
                                    name='Surname'
                                    sx={{ width: '30%', marginLeft: 1}}
                                />
                                <TextField
                                    label="First Name"
                                    placeholder="Enter First Name"
                                    name='Firstname'
                                    sx={{ width: '30%', marginLeft: 1}}
                                />
                                <TextField
                                    label="Middle Name"
                                    placeholder="Enter Middle Name"
                                    name='Middlename'
                                    sx={{ width: '25%', marginLeft: 1}}
                                />
                                <TextField
                                    label="Suffix"
                                    placeholder="Enter Suffix"
                                    name='Suffix'
                                    sx={{ width: '16%', marginLeft: 1}}
                                />
                            </Box>
                            <Box sx={{display: 'flex', flexDirection: 'row'}}>
                                <Autocomplete
                                    sx={{width: '49%', marginLeft: 1, marginTop: 2}}
                                    renderInput={(params) => (
                                        <TextField {...params} label='Civil Status'></TextField>
                                    )}
                                    onChange={() => {}}
                                />
                                <Autocomplete
                                    sx={{width: '49%', marginLeft: 1, marginTop: 2}}
                                    renderInput={(params) => (
                                        <TextField {...params} label='Sex'></TextField>
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
                                />
                                <TextField
                                    label='Mobile Number'
                                    placeholder='Enter Mobile Number'
                                    name='mobile'
                                    sx={{marginLeft: 1, width: '50%'}}
                                    onChange={() => {}}
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
                                <Autocomplete
                                    sx={{marginLeft: 1, width: '50%'}}
                                    options={EduBg}
                                    onChange={handleSelectEducBg}
                                    renderInput={(params) => <TextField {...params} label='Choose' />} />
                                
                                {input.map((inputs, index) => (
                                    <Box sx={{display: 'flex', flexDirection: 'row'}} >
                                        <TextField key={index} placeholder={inputs} label={inputs} sx={{marginLeft: 1 , width: '45%'}} />
                                        <TextField label={secondLabel} placeholder={secondLabel} sx={{marginLeft: 1, width: '30%'}} />
                                        <Button variant='contained' onClick={() => HandleRemoveEducBg(index)} sx={{marginLeft: 1}} >Remove</Button>
                                    </Box>
                                ))}
                            </Box>

                            <Typography variant='h5' sx={{marginTop: 5}}>Employee Information</Typography>

                            <Box sx={{display: 'flex', flexDirection: 'row', marginTop: 2}}>
                                <Autocomplete
                                    sx={{marginLeft: 1, width: '50%'}}
                                    renderInput={(params) => (<TextField {...params} label='Positon' />)}
                                    onChange={() => {}}
                                />
                                <Autocomplete
                                    sx={{marginLeft: 1, width: '50%'}}
                                    renderInput={(params) => (<TextField {...params} label='Rate Type' />)} 
                                    onChange={() => {}}
                                />
                            </Box>
                            <Box sx={{display: 'flex', flexDirection: 'row', marginTop: 2}}>
                                <Autocomplete
                                    sx={{marginLeft: 1, width: '40%'}}
                                    disablePortal
                                    options={() => {}}
                                    renderInput={(params) => <TextField {...params} label='Rate' />}
                                />
                                <Autocomplete
                                    sx={{marginLeft: 1, width: '40%'}}
                                    disablePortal
                                    options={() => {}}
                                    renderInput={(params) => <TextField {...params} label='Status' />}
                                />
                                <Autocomplete
                                    sx={{marginLeft: 1, width: '40%'}}
                                    disablePortal
                                    options={() => {}}
                                    renderInput={(params) => <TextField {...params} label='Employment Type' />}
                                />
                            </Box>
                            <Box sx={{display: 'flex', flexDirection: 'row', marginTop: 2}}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        sx={{marginLeft: 1, width: '49%'}}
                                        label='Date of Hired'
                                        value={value1}
                                        onChange={(newValue) => setValue1(newValue)}
                                    />
                                </LocalizationProvider>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        sx={{marginLeft: 1, width: '49%'}}
                                        label='Date of End'
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
                                    placeholder='Enter TIN No.'
                                    name='tin'
                                    onChange={() => {}}
                                />
                                <TextField
                                    sx={{marginLeft: 1, width: '48%', marginTop: 2}}
                                    label='Social Security System'
                                    placeholder='Enter SSS No.'
                                    name='sss'
                                    onChange={() => {}}
                                />
                                </Box>
                            <Box sx={{display: 'flex', flexDirection: 'row'}}>
                                <TextField
                                    sx={{marginLeft: 1, width: '49%', marginTop: 2}}
                                    label='PhilHealth'
                                    placeholder='Enter PhilHealth No.'
                                    name='philhealth'
                                    onChange={() => {}}
                                />
                                <TextField
                                    sx={{marginLeft: 1, width: '49%', marginTop: 2}}
                                    label='Home Development Mutual Fund'
                                    placeholder='Enter HDMF No.'
                                    name='hdmf'
                                    onChange={() => {}}
                                />
                            </Box>
                            <Box sx={{display: 'flex', flexDirection: 'row'}}>
                                <Button
                                    sx={{borderRadius: 5, justifyContent: 'left', margin: 5}}
                                    type='submit'
                                    color='primary'
                                    variant='contained'
                                    onClick={() => {}}>Submit</Button>
                            </Box>
                        </Box>
                    </Box>
                </Box>
        </Modal>
    </>
  )
}