import React, { useState, useEffect } from 'react'
import { Box, Modal, TextField, Autocomplete, Typography, Button, InputAdornment } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import SexPicker from '../_JSON/Sex.json'
import axios from 'axios'

export default function AddEmpModal({ onOpen, onClose }) {
    const [input, setInput] = useState([])
    const [input1, setInput1] = useState([])
    const [secondLabel, setSecondLabel] = useState([])
    const [value1, setValue1] = useState(null)

    const provinceOptions = ['Province1', 'Province2', 'Province3'];
    const cityOptions = ['City1', 'City2', 'City3'];

    const EduBg = [
        { label: 'Highschool', id: 1, placeholder: 'Enter name of School' },
        { label: 'Senior Highschool', id: 2, placeholder: 'Enter name of School' },
        { label: 'College', id: 3, placeholder: 'Enter name of College or University' },
        { label: 'Vocational', id: 4, placeholder: 'Enter name of School' }
    ];

    const handleSelectEducBg = (event, newValue) => {
        if (newValue) {
            let secondLabel = '';
            let placeholder = '';

            if (newValue.id === 3 && newValue.label === 'College') {
                secondLabel = 'Course';
                placeholder = 'Enter your course';
            } else if (newValue.id === 1 && newValue.label === 'Highschool') {
                secondLabel = 'Grade';
                placeholder = 'Enter your grade';
            } else if (newValue.id === 2 && newValue.label === 'Senior Highschool') {
                secondLabel = 'Strand';
                placeholder = 'Enter your strand';
            } else if (newValue.id === 4 && newValue.label === 'Vocational') {
                secondLabel = 'Course';
                placeholder = 'Enter your course';
            } else {
                secondLabel = 'Error';
            }

            // Append both the label, secondLabel, and placeholder as an object to the input array
            setInput([...input, { label: newValue.label, secondLabel, placeholder }]); // Ensure placeholder is included here
        }
    };

    const handleRemoveEducBg = (index) => {
        const updatedInputs = input.filter((_, i) => i !== index);
        setInput(updatedInputs);
    };

    const handleYearChange = (index, event) => {
        const updatedInputs = [...input];
        updatedInputs[index].year = event.target.value; // Update the year based on the input
        setInput(updatedInputs);
    };

    // MOBILE NUMBER
    const [mobileNumber, setMobileNumber] = useState('');

    const handleMobileNumberChange = (event) => {
        // Allow only digits and set the mobile number
        const input = event.target.value.replace(/\D/g, '');
        setMobileNumber(input);
    };

    //TIN
    const [tin, setTin] = useState('');

    const handleTINChange = (event) => {
        const input = event.target.value.replace(/\D/g, ''); // Allow only digits
        let formattedTIN = '';

        // Format the TIN in the format 000-123-456-001
        if (input.length > 0) formattedTIN += input.substring(0, 3);
        if (input.length > 3) formattedTIN += '-' + input.substring(3, 6);
        if (input.length > 6) formattedTIN += '-' + input.substring(6, 9);
        if (input.length > 9) formattedTIN += '-' + input.substring(9, 12);

        setTin(formattedTIN); // Update state with formatted TIN
    };

    //SSS

    const [sss, setSSS] = useState('');

    const handleSSSChange = (event) => {
        const input = event.target.value.replace(/\D/g, ''); // Remove non-digit characters
        let formattedSSS = '';

        // Format the SSS number in the format 33-3335151-3
        if (input.length > 0) formattedSSS += input.substring(0, 2);
        if (input.length > 2) formattedSSS += '-' + input.substring(2, 9);
        if (input.length > 8) formattedSSS += '-' + input.substring(9, 10);

        setSSS(formattedSSS); // Update state with formatted SSS
    };

    //Philhealth
    const [philHealth, setPhilHealth] = useState('');

    const handlePhilHealthChange = (event) => {
        const input = event.target.value.replace(/\D/g, ''); // Remove non-digit characters
        let formattedPhilHealth = '';

        // Format the PhilHealth number in the format 02-515151234-5
        if (input.length > 0) formattedPhilHealth += input.substring(0, 2);
        if (input.length > 2) formattedPhilHealth += '-' + input.substring(2, 11);
        if (input.length > 10) formattedPhilHealth += '-' + input.substring(11, 12);

        setPhilHealth(formattedPhilHealth); // Update state with formatted PhilHealth number
    };

    //HDMF
    const [hdmfNumber, setHdmfNumber] = useState('');

    const handleHdmfChange = (event) => {
        const input = event.target.value.replace(/\D/g, ''); // Remove non-digit characters
        let formattedHdmf = '';

        // Format the HDMF number in the format 1123-5845-4541
        if (input.length > 0) formattedHdmf += input.substring(0, 4); // First 4 digits
        if (input.length > 4) formattedHdmf += '-' + input.substring(4, 8); // Next 4 digits
        if (input.length > 8) formattedHdmf += '-' + input.substring(8, 12); // Last 4 digits

        setHdmfNumber(formattedHdmf); // Update state with formatted HDMF number
    };
    //WORK EXP

    const handleRemoveWorkExp = (index1) => {
        const updatedInputs1 = input1.filter((_, i) => i !== index1);
        setInput1(updatedInputs1);
    };

    const handleAddWorkExp = () => {
        setInput1([...input1, { company: '', position: '', year: '' }]); // Add a new blank entry
    };


    return (
        <>
            <Modal open={onOpen}
                onClose={onClose}
                closeAfterTransition>

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

                        <Typography variant='h4' sx={{ marginBottom: 1 }}>
                            Add Employee Information
                        </Typography>

                        <Box sx={{ overscrollBehavior: 'contain' }}>

                            <Typography variant='h5' sx={{ marginTop: 2 }}>Personal Information</Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 2 }}>
                                <TextField
                                    label="Surname"
                                    placeholder="Enter Surname"
                                    name='Surname'
                                    sx={{ width: '30%', marginLeft: 1 }}
                                />
                                <TextField
                                    label="First Name"
                                    placeholder="Enter First Name"
                                    name='Firstname'
                                    sx={{ width: '30%', marginLeft: 1 }}
                                />
                                <TextField
                                    label="Middle Name"
                                    placeholder="Enter Middle Name"
                                    name='Middlename'
                                    sx={{ width: '25%', marginLeft: 1 }}
                                />
                                <TextField
                                    label="Suffix"
                                    placeholder="Enter Suffix"
                                    name='Suffix'
                                    sx={{ width: '16%', marginLeft: 1 }}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                                <Autocomplete
                                    sx={{ width: '49%', marginLeft: 1, marginTop: 2 }}
                                    renderInput={(params) => (
                                        <TextField {...params} label='Civil Status'></TextField>
                                    )}
                                    onChange={() => { }}
                                />
                                <Autocomplete
                                    sx={{ width: '49%', marginLeft: 1, marginTop: 2 }}
                                    renderInput={(params) => (
                                        <TextField {...params} label='Sex'></TextField>
                                    )}
                                    onChange={() => { }}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        sx={{ width: '33%', marginTop: 2, marginLeft: 1 }}
                                        label='Date of Birth'
                                        value={value1}
                                        onChange={(newValue) => setValue1(newValue)} />
                                </LocalizationProvider>
                                <Autocomplete
                                    sx={{ width: '33%', marginLeft: 1, marginTop: 2 }}
                                    disablePortal
                                    id='Province'
                                    options={provinceOptions}
                                    renderInput={(params) => <TextField {...params} label='Province of Birth' />}
                                    onChange={() => { }}
                                />
                                <Autocomplete
                                    sx={{ width: '33%', marginLeft: 1, marginTop: 2 }}
                                    disablePortal
                                    id='City'
                                    options={cityOptions}
                                    renderInput={(params) => <TextField {...params} label='City of Birth' />}
                                    onChange={() => { }}
                                />
                            </Box>

                            <Typography variant='h5' sx={{ marginTop: 5 }}>Contact Information</Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 2 }}>
                                <TextField
                                    label='Email Address'
                                    placeholder='Enter Email'
                                    name='email'
                                    sx={{ marginLeft: 1, width: '50%' }}
                                    onChange={() => { }}
                                />
                                <TextField
                                    label='Mobile Number'
                                    placeholder='Enter Mobile Number'
                                    name='mobile'
                                    value={mobileNumber} // Set only the digits in the state
                                    onChange={handleMobileNumberChange} // Handle input changes
                                    sx={{ marginLeft: 1, width: '50%' }}
                                    inputProps={{ maxLength: 10 }} // Limit length to 10 digits after +63
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">+63</InputAdornment> // Display +63 as an adornment
                                        ),
                                    }}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                                <Autocomplete
                                    sx={{ marginLeft: 1, marginTop: 3, width: '50%' }}
                                    disablePortal
                                    id='Region'
                                    options={provinceOptions}
                                    renderInput={(params) => <TextField {...params} label='Region' />}
                                    onChange={() => { }}
                                />
                                <Autocomplete
                                    sx={{ marginLeft: 1, marginTop: 3, width: '50%' }}
                                    disablePortal
                                    id='Province'
                                    options={provinceOptions}
                                    renderInput={(params) => <TextField {...params} label='Province' />}
                                    onChange={() => { }}
                                />
                                <Autocomplete
                                    sx={{ marginLeft: 1, marginTop: 3, width: '50%' }}
                                    disablePortal
                                    id='Municipality/City'
                                    options={provinceOptions}
                                    renderInput={(params) => <TextField {...params} label='Municipality/City' />}
                                    onChange={() => { }}
                                />
                                <Autocomplete
                                    sx={{ marginLeft: 1, marginTop: 3, width: '50%' }}
                                    disablePortal
                                    id='Barangay'
                                    options={provinceOptions}
                                    renderInput={(params) => <TextField {...params} label='Barangay' />}
                                    onChange={() => { }}
                                />
                            </Box>
                            <TextField label='Street Address' placeholder='House No./Street' name='StreetAddress' sx={{ marginLeft: 1, marginTop: 2, width: '99%' }} />

                            <Typography variant='h5' sx={{ marginTop: 5 }}>Employee Educational Attainment & Work Experience</Typography>

                            <Box sx={{ marginTop: 2, display: 'flex', gap: 2, flexDirection: 'column' }}>
                                <Autocomplete
                                    sx={{ marginLeft: 1, width: '50%' }}
                                    options={EduBg}
                                    onChange={handleSelectEducBg}
                                    renderInput={(params) => <TextField {...params} label='Choose' />}
                                />

                                {input.map((item, index) => (
                                    <Box key={index} sx={{ display: 'flex', flexDirection: 'row' }}>
                                        <TextField
                                            label={item.label}
                                            placeholder={EduBg.find(bg => bg.label === item.label)?.placeholder} // Set placeholder based on original EduBg
                                            sx={{ marginLeft: 1, width: '45%' }}
                                        />
                                        <TextField
                                            label={item.secondLabel}
                                            placeholder={item.placeholder} // Use the dynamically set placeholder
                                            sx={{ marginLeft: 1, width: '25%' }}
                                        />
                                        <TextField
                                            label="Year"
                                            placeholder="e.g. 2012-2016"
                                            value={item.year}
                                            onChange={(event) => handleYearChange(index, event)} // Handle year input change
                                            sx={{ marginLeft: 1, width: '20%' }}
                                        />
                                        <Button
                                            variant='contained'
                                            onClick={() => handleRemoveEducBg(index)}
                                            sx={{ marginLeft: 1 }}
                                        >
                                            Remove
                                        </Button>
                                    </Box>
                                ))}
                            </Box>

                            <Box sx={{ marginTop: 2, display: 'flex', gap: 2, flexDirection: 'column' }}>
                                {input1.map((item, index1) => (
                                    <Box key={index1} sx={{ display: 'flex', flexDirection: 'row' }}>
                                        <TextField
                                            label='Company Name'
                                            placeholder='e.g. Hood Land Inc.'
                                            sx={{ marginLeft: 1, width: '45%' }}
                                        />
                                        <TextField
                                            label='Position'
                                            placeholder='e.g. Manager'
                                            sx={{ marginLeft: 1, width: '25%' }}
                                        />
                                        <TextField
                                            label='Year'
                                            placeholder='e.g. 2012-2016'
                                            sx={{ marginLeft: 1, width: '20%' }}
                                        />
                                        <Button
                                            variant='contained'
                                            onClick={() => handleRemoveWorkExp(index1)} // Function to handle removing the work experience
                                            sx={{ marginLeft: 1 }}
                                        >
                                            Remove
                                        </Button>
                                    </Box>
                                ))}
                                <Button
                                    variant='contained'
                                    onClick={handleAddWorkExp}
                                    sx={{ marginLeft: 1, width: '50%' }} // Function to handle adding new work experience
                                >
                                    Add Work Experience
                                </Button>
                            </Box>



                            <Typography variant='h5' sx={{ marginTop: 5 }}>Employee Information</Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 2 }}>
                                <Autocomplete
                                    sx={{ marginLeft: 1, width: '50%' }}
                                    renderInput={(params) => (<TextField {...params} label='Positon' />)}
                                    onChange={() => { }}
                                />
                                <Autocomplete
                                    sx={{ marginLeft: 1, width: '50%' }}
                                    renderInput={(params) => (<TextField {...params} label='Rate Type' />)}
                                    onChange={() => { }}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 2 }}>
                                <Autocomplete
                                    sx={{ marginLeft: 1, width: '40%' }}
                                    disablePortal
                                    options={() => { }}
                                    renderInput={(params) => <TextField {...params} label='Rate' />}
                                />
                                <Autocomplete
                                    sx={{ marginLeft: 1, width: '40%' }}
                                    disablePortal
                                    options={() => { }}
                                    renderInput={(params) => <TextField {...params} label='Status' />}
                                />
                                <Autocomplete
                                    sx={{ marginLeft: 1, width: '40%' }}
                                    disablePortal
                                    options={() => { }}
                                    renderInput={(params) => <TextField {...params} label='Employment Type' />}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 2 }}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        sx={{ marginLeft: 1, width: '49%' }}
                                        label='Date of Hired'
                                        value={value1}
                                        onChange={(newValue) => setValue1(newValue)}
                                    />
                                </LocalizationProvider>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        sx={{ marginLeft: 1, width: '49%' }}
                                        label='Date of End'
                                        value={value1}
                                        onChange={(newValue) => setValue1(newValue)}
                                    />
                                </LocalizationProvider>
                            </Box>
                            <Typography variant='h5' sx={{ marginTop: 5 }}>Employee Government Numbers</Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 2 }}>

                                <TextField
                                    fullWidth
                                    sx={{ marginLeft: 1, width: '49%', marginTop: 2 }}
                                    label='Taxpayer Identification Number'
                                    placeholder='000-000-000-000'
                                    name='tin'
                                    value={tin} // Set the value to the formatted TIN
                                    onChange={handleTINChange} // Handle input changes
                                    inputProps={{ maxLength: 15 }} // Limit length to 14 characters
                                />

                                <TextField
                                    sx={{ marginLeft: 1, width: '48%', marginTop: 2 }}
                                    label='Social Security System'
                                    placeholder='00-0000000-0'
                                    name='sss'
                                    value={sss} // Set the value to the formatted SSS
                                    onChange={handleSSSChange} // Handle input changes
                                    inputProps={{ maxLength: 12 }} // Limit length to 12 characters (including hyphens)
                                />
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                                <TextField
                                    sx={{ marginLeft: 1, width: '49%', marginTop: 2 }}
                                    label='PhilHealth'
                                    placeholder='00-000000000-0'
                                    name='philhealth'
                                    value={philHealth} // Set the value to the formatted PhilHealth number
                                    onChange={handlePhilHealthChange} // Handle input changes
                                    inputProps={{ maxLength: 15 }} // Limit length to 15 characters (including hyphens)
                                />
                                <TextField
                                    sx={{ marginLeft: 1, width: '49%', marginTop: 2 }}
                                    label='Home Development Mutual Fund'
                                    placeholder='0000-0000-0000'
                                    name='hdmf'
                                    value={hdmfNumber} // Set the value to the formatted HDMF number
                                    onChange={handleHdmfChange} // Handle input changes
                                    inputProps={{ maxLength: 15 }} // Limit length to 15 characters (including hyphens)
                                />
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                                <Button
                                    sx={{ borderRadius: 5, marginLeft: 'auto', marginTop: 5, marginBottom: 3 }}
                                    type='submit'
                                    color='primary'
                                    variant='contained'
                                    onClick={() => { }}>Submit</Button>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Modal >
        </>
    )
}