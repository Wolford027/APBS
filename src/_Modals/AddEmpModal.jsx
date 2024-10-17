import React, { useState, useEffect } from 'react'
import { Box, Modal, TextField, Autocomplete, Typography, Button, InputAdornment, Alert } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import Region from '../_Regions/Region.json'
import axios from 'axios'
import { styled } from '@mui/system'

export default function AddEmpModal({ onOpen, onClose }) {

    // Styled component for red asterisk
    const RedAsterisk = styled('span')({
        color: 'red', // Change asterisk color to red
    });
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
        { label: 'Vocational School', id: 4, placeholder: 'Enter name of School' }
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
                placeholder = 'e.g. Grade 7-10';
            } else if (newValue.id === 2 && newValue.label === 'Senior Highschool') {
                secondLabel = 'Strand';
                placeholder = 'e.g. STEM';
            } else if (newValue.id === 4 && newValue.label === 'Vocational School') {
                secondLabel = 'Course';
                placeholder = 'e.g. Bookkepping ';
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

    const [civilStatus, setCivilStatus] = useState([]);

    // Fetch civil status data from the backend
    useEffect(() => {
        const fetchCivilStatus = async () => {
            try {
                const response = await axios.get('http://localhost:8800/cs');
                console.log(response.data); // Check the structure of the data
                setCivilStatus(response.data);
            } catch (error) {
                console.error('Error fetching civil status data:', error);
            }
        };

        fetchCivilStatus();
    }, []);

    const [sex, setSex] = useState([]);

    // Fetch sex data from the backend
    useEffect(() => {
        const fetchSex = async () => {
            try {
                const response = await axios.get('http://localhost:8800/sex');
                setSex(response.data); // Set the fetched data in state
                console.log('Fetched sex data:', response.data); // Log the data
            } catch (error) {
                console.error('Error fetching sex data:', error);
            }
        };

        fetchSex();
    }, []);

    const [employement, setemployement] = useState([]);
    // Fetch employment type data from the backend
    useEffect(() => {
        const fetchemployement = async () => {
            try {
                const response = await axios.get('http://localhost:8800/employment_type');
                setemployement(response.data); // Set the fetched data in state
                console.log('Fetched employment type data:', response.data); // Log the data
            } catch (error) {
                console.error('Error fetching employment type data:', error);
            }
        };

        fetchemployement();
    }, []);

    const [status, setstatus] = useState([]);
    // Fetch employment type data from the backend
    useEffect(() => {
        const fetchstatus = async () => {
            try {
                const response = await axios.get('http://localhost:8800/status');
                setstatus(response.data); // Set the fetched data in state
                console.log('Fetched status data:', response.data); // Log the data
            } catch (error) {
                console.error('Error fetching statusdata:', error);
            }
        };

        fetchstatus();
    }, []);

    const [department, setdepartment] = useState([]);
    // Fetch employment type data from the backend
    useEffect(() => {
        const fetchdepartment = async () => {
            try {
                const response = await axios.get('http://localhost:8800/department');
                setdepartment(response.data); // Set the fetched data in state
                console.log('Fetched status data:', response.data); // Log the data
            } catch (error) {
                console.error('Error fetching statusdata:', error);
            }
        };

        fetchdepartment();
    }, []);

    const [ratetype, setRatetype] = useState([]);
    const [ratetypevalue, setRatetypevalue] = useState([]);
    const [filteredRateValues, setFilteredRateValues] = useState([]);
    const [selectedRateType, setSelectedRateType] = useState(null);
    const [selectedRateValue, setSelectedRateValue] = useState(null);

    useEffect(() => {
        const fetchRatetype = async () => {
            try {
                const response = await axios.get('http://localhost:8800/ratetype');
                setRatetype(response.data);
            } catch (error) {
                console.error('Error fetching rate type data:', error);
            }
        };

        fetchRatetype();
    }, []);

    useEffect(() => {
        const fetchRatetypevalue = async () => {
            try {
                const response = await axios.get('http://localhost:8800/ratetypevalue');
                setRatetypevalue(response.data);
            } catch (error) {
                console.error('Error fetching rate type value data:', error);
            }
        };

        fetchRatetypevalue();
    }, []);

    const handleRateTypeChange = (event, value) => {
        setSelectedRateType(value);
        if (value) {
            const filteredValues = ratetypevalue
                .filter(rt => rt.emp_ratetype_id === value.emp_rt_id)
                .reduce((acc, current) => {
                    const existing = acc.find(item => item.pos_rt_val === current.pos_rt_val);
                    if (!existing) {
                        acc.push(current);
                    }
                    return acc;
                }, [])
                .sort((a, b) => a.pos_rt_val - b.pos_rt_val);

            setFilteredRateValues(filteredValues);
        } else {
            // Clear rate value when rate type is cleared
            setFilteredRateValues([]);
            setSelectedRateValue(null)
        }
    };


    const [ratetypevaluepos, setRatetypevaluepos] = useState([]);

    useEffect(() => {
        const fetchPosition = async () => {
            try {
                const response = await axios.get('http://localhost:8800/ratetypevalue');
                console.log('Fetched data:', response.data); // Debugging log

                // Filter out duplicates by 'position'
                const uniquePositions = response.data.filter(
                    (value, index, self) =>
                        index === self.findIndex((t) => t.position === value.position)
                );

                console.log('Unique positions:', uniquePositions); // Debugging log
                setRatetypevaluepos(uniquePositions); // Set the unique options in state
            } catch (error) {
                console.error('Error fetching positions:', error);
            }
        };

        fetchPosition();
    }, []);

    // DATE START AND END 

    const [datestart, setdatestart] = useState(null); // Date of start value
    const [employmentType, setEmploymentType] = useState(null); // Employment type state
    const [dateend, setdateend] = useState(null); // Date of End state
    const [isDateEndEnabled, setIsDateEndEnabled] = useState(false); // State to control whether Date of End is enabled

    const handleEmploymentChange = (event, value) => {
        setEmploymentType(value);

        if (value?.employment_type_name === 'Provisionary' || value?.employment_type_name === 'Project-based') {
            setIsDateEndEnabled(true); // Enable the Date of End field
        } else {
            setIsDateEndEnabled(false); // Disable the Date of End field
            setdateend(null); // Clear the Date of End value
        }
    };

    // REGION ETC
    const [regions, setRegions] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [municipalities, setMunicipalities] = useState([]);
    const [barangays, setBarangays] = useState([]);

    const [selectedRegion, setSelectedRegion] = useState(null);
    const [selectedProvince, setSelectedProvince] = useState(null);
    const [selectedMunicipality, setSelectedMunicipality] = useState(null);
    const [selectedBarangay, setSelectedBarangay] = useState(null); // Add state for selected barangay

    useEffect(() => {
        // Extract regions from the JSON structure
        const regionsArray = Object.values(Region).map(region => ({
            region_name: region.region_name,
            province_list: region.province_list
        }));
        setRegions(regionsArray);
    }, []);

    const handleRegionChange = (event, value) => {
        setSelectedRegion(value);
        if (value) {
            // Set provinces based on selected region
            setProvinces(Object.keys(value.province_list));
            // Clear municipalities, barangays, and their selections
            setMunicipalities([]);
            setBarangays([]);
            setSelectedProvince(null);
            setSelectedMunicipality(null);
            setSelectedBarangay(null);
        } else {
            // Clear everything if region is cleared
            setProvinces([]);
            setMunicipalities([]);
            setBarangays([]);
            setSelectedProvince(null);
            setSelectedMunicipality(null);
            setSelectedBarangay(null); // Clear selected barangay as well
        }
    };

    const handleProvinceChange = (event, value) => {
        setSelectedProvince(value);
        if (value && selectedRegion) {
            // Set municipalities based on selected province
            setMunicipalities(Object.keys(selectedRegion.province_list[value].municipality_list));
            // Clear barangays and their selection
            setBarangays([]);
            setSelectedMunicipality(null);
            setSelectedBarangay(null);
        } else {
            // Clear municipalities and barangays if province is cleared
            setMunicipalities([]);
            setBarangays([]);
            setSelectedMunicipality(null);
            setSelectedBarangay(null);
        }
    };

    const handleMunicipalityChange = (event, value) => {
        setSelectedMunicipality(value);
        if (value && selectedRegion && selectedProvince) {
            // Set barangays based on selected municipality
            setBarangays(selectedRegion.province_list[selectedProvince].municipality_list[value].barangay_list);
        } else {
            // Clear barangays if municipality is cleared
            setBarangays([]);
            setSelectedBarangay(null);
        }
    };

    const [provinces1, setProvinces1] = useState([]);
    const [municipalities1, setMunicipalities1] = useState([]);
    const [selectedProvince1, setSelectedProvince1] = useState(null);
    const [selectedMunicipality1, setSelectedMunicipality1] = useState(null); // New state for selected municipality

    useEffect(() => {
        const provincesArray1 = Object.values(Region).flatMap(region =>
            Object.keys(region.province_list)
        );
        console.log("Loaded provinces:", provincesArray1); // Debugging log
        setProvinces1(provincesArray1);
    }, [Region]);

    const handleProvinceChange1 = (event, value) => {
        console.log("Selected province:", value); // Debugging log
        setSelectedProvince1(value); // Ensure correct state variable

        if (value) {
            const selectedRegion1 = Object.values(Region).find(region =>
                region.province_list.hasOwnProperty(value)
            );
            if (selectedRegion1) {
                const municipalitiesArray1 = Object.keys(selectedRegion1.province_list[value].municipality_list);
                console.log("Loaded municipalities:", municipalitiesArray1); // Debugging log
                setMunicipalities1(municipalitiesArray1); // Set municipalities based on the selected province
            }
        } else {
            console.log("Province removed, clearing municipalities"); // Debugging log
            setMunicipalities1([]); // Clear municipalities if province is removed
            setSelectedMunicipality1(null); // Clear selected municipality
        }
    };

    const [successMessage, setSuccessMessage] = useState(''); // Success message state
    const [errorMessage, setErrorMessage] = useState(''); // Error message state

    // EMP ADD

    // Function to handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent default form submission

        // Validation
        if (!surname || !dateend || !selectedRateType) {
            setErrorMessage('Please fill in all required fields.');
            return;
        } else {
            setErrorMessage(''); // Clear error message if fields are filled
        }

        const AddEmp = {
            surname,
            dateend: dateend ? dateend.format('MMMM-DD-YYYY') : null, // Format date as needed
            ratetype: selectedRateType ? selectedRateType.emp_rt_name : null // Get name from selected rate type
        };

        try {
            const response = await axios.post('http://localhost:8800/AddEmp', AddEmp);
            console.log(response.data);
            setSuccessMessage('Data saved successfully!'); // Set success message
            resetForm();
        } catch (error) {
            console.error('Error submitting form:', error);
            setErrorMessage('Error saving data.');
        }
    };

    const closeModal = () => {
        if (surname || dateend || selectedRateType) {
            setConfirmClose(true); // Show confirmation if fields are filled
        } else {
            resetForm();
            onClose(); // Close the modal
        }
    };

    const handleConfirmClose = (confirm) => {
        if (confirm) {
            resetForm(); // Clear form fields
        }
        setConfirmClose(false); // Close the confirmation dialog
        onClose(); // Close the modal
    };

    const resetForm = () => {
        setSurname('');
        setdateend(null);
        setSelectedRateType(null);
    };

    const [confirmClose, setConfirmClose] = useState(false); // Confirm close dialog state

    const [surname, setSurname] = useState('');
    const [firstname, setfirstname] = useState('');
    const [middlename, setmiddlename] = useState('');
    const [suffix, setsuffix] = useState('');

    return (
        <>
            <Modal open={onOpen}
                onClose={closeModal}
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
                                    label={
                                        <span>
                                            Surname <RedAsterisk>*</RedAsterisk>
                                        </span>
                                    }
                                    placeholder="Enter Surname"
                                    name='Surname'
                                    sx={{ width: '30%', marginLeft: 1 }}
                                    value={surname}
                                    onChange={(e) => setSurname(e.target.value)} // Update surname state

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
                                    options={civilStatus} // Fallback to an empty array if civilStatus is undefined
                                    getOptionLabel={(option) => option.cs_name || ''} // Ensure the field exists
                                    renderInput={(params) => (
                                        <TextField {...params} label='Civil Status' />
                                    )}
                                    onChange={(event, value) => {
                                        console.log('Selected Civil Status:', value); // Log selected value
                                    }}
                                />
                                <Autocomplete
                                    sx={{ width: '49%', marginLeft: 1, marginTop: 2 }}
                                    options={sex} // Use the fetched data
                                    getOptionLabel={(option) => option.sex_name || ""} // Display the sex_name in the dropdown
                                    renderInput={(params) => (
                                        <TextField {...params} label='Sex' />
                                    )}
                                    onChange={(event, value) => {
                                        console.log('Selected Sex:', value); // Handle selection
                                    }}
                                />

                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 2 }}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        sx={{ width: '33%', marginLeft: 1 }}
                                        label='Date of Birth'
                                        value={value1}
                                        onChange={(newValue) => setValue1(newValue)} />
                                </LocalizationProvider>

                                <Autocomplete
                                    sx={{ marginLeft: 1, width: '33%' }}
                                    options={provinces1} // Ensure correct state variable
                                    getOptionLabel={(option) => option}
                                    onChange={handleProvinceChange1}
                                    renderInput={(params) => <TextField {...params} label="Province of Birth" />}
                                />
                                <Autocomplete
                                    sx={{ marginLeft: 1, width: '33%' }}
                                    options={municipalities1} // Ensure correct state variable
                                    getOptionLabel={(option) => option}
                                    onChange={(event, value) => {
                                        console.log("Selected municipality:", value); // Debugging log
                                        setSelectedMunicipality1(value); // Set selected municipality
                                    }}
                                    renderInput={(params) => <TextField {...params} label="City of Birth" />}
                                    disabled={!selectedProvince1} // Disable if no province is selected
                                    value={selectedMunicipality1} // Bind selected municipality
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
                            <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 2 }}>
                                <Autocomplete
                                    sx={{ marginLeft: 1, width: '50%' }}
                                    options={regions}
                                    getOptionLabel={(option) => option.region_name}
                                    onChange={handleRegionChange}
                                    renderInput={(params) => <TextField {...params} label="Region" />}
                                    value={selectedRegion} // Bind selected region
                                />
                                <Autocomplete
                                    sx={{ marginLeft: 1, width: '50%' }}
                                    options={provinces}
                                    getOptionLabel={(option) => option}
                                    onChange={handleProvinceChange}
                                    renderInput={(params) => <TextField {...params} label="Province" />}
                                    disabled={!selectedRegion} // Disable if no region is selected
                                    value={selectedProvince} // Bind selected province
                                />
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 2 }}>
                                <Autocomplete
                                    sx={{ marginLeft: 1, width: '50%' }}
                                    options={municipalities}
                                    getOptionLabel={(option) => option}
                                    onChange={handleMunicipalityChange}
                                    renderInput={(params) => <TextField {...params} label="Municipality" />}
                                    disabled={!selectedProvince} // Disable if no province is selected
                                    value={selectedMunicipality} // Bind selected municipality
                                />
                                <Autocomplete
                                    sx={{ marginLeft: 1, width: '50%' }}
                                    options={barangays}
                                    getOptionLabel={(option) => option}
                                    onChange={(event, value) => setSelectedBarangay(value)} // Handle barangay change
                                    renderInput={(params) => <TextField {...params} label="Barangay" />}
                                    disabled={!selectedMunicipality} // Disable if no municipality is selected
                                    value={selectedBarangay} // Bind selected barangay
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



                            <Typography variant='h5' sx={{ marginTop: 3 }}>Employee Information</Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 2 }}>

                                <Autocomplete
                                    sx={{ width: '50%', marginLeft: 1 }}
                                    options={status} // Use the filtered data
                                    getOptionLabel={(option) => option.emp_status_name || ''} // Ensure `option.position` exists
                                    defaultValue={status.find((s) => s.emp_status_name === "Active")} // Set default to "Active"
                                    renderInput={(params) => <TextField {...params} label='Status' />}
                                    onChange={(event, value) => {
                                        console.log('Selected status:', value); // Handle selection
                                    }}
                                />

                                <Autocomplete
                                    sx={{ width: '50%', marginLeft: 1 }}
                                    options={employement} // Use the filtered data
                                    getOptionLabel={(option) => option.employment_type_name || ''}
                                    renderInput={(params) => <TextField {...params} label='Employment Type' />}
                                    onChange={handleEmploymentChange}
                                />
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 2 }}>

                                <Autocomplete
                                    sx={{ width: '33%', marginLeft: 1 }}
                                    options={ratetypevaluepos} // Use the filtered data
                                    getOptionLabel={(option) => option.position || ''} // Ensure `option.position` exists
                                    renderInput={(params) => <TextField {...params} label='Position' />}
                                    onChange={(event, value) => {
                                        console.log('Selected Position:', value); // Handle selection
                                    }}
                                />

                                <Autocomplete
                                    sx={{ marginLeft: 1, width: '33%' }}
                                    options={ratetype}
                                    getOptionLabel={(option) => option.emp_rt_name || ""}
                                    renderInput={(params) => (
                                        <TextField {...params} label='Rate Type' />
                                    )}
                                    onChange={(event, newValue) => setSelectedRateType(newValue)} // Set selected rate type
                                />
                                <Autocomplete
                                    sx={{ marginLeft: 1, width: '33%' }}
                                    options={filteredRateValues}
                                    getOptionLabel={(option) =>
                                        new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(option.pos_rt_val) // Format as PHP currency
                                    }
                                    renderInput={(params) => <TextField {...params} label='Rate Value' />}
                                    disabled={!selectedRateType} // Disable if no rate type selected
                                    value={selectedRateValue}
                                />
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 2 }}>
                                <Autocomplete
                                    sx={{ width: '33%', marginLeft: 1 }}
                                    options={department} // Use the filtered data
                                    getOptionLabel={(option) => option.emp_dept_name || ''} // Ensure `option.position` exists
                                    renderInput={(params) => <TextField {...params} label='Department' />}
                                    onChange={(event, value) => {
                                        console.log('Selected Department:', value); // Handle selection
                                    }}
                                />

                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        sx={{ marginLeft: 1, width: '33%' }}
                                        label={
                                            <span>
                                                Date of Hired <RedAsterisk>*</RedAsterisk>
                                            </span>
                                        }
                                        value={datestart}
                                        onChange={(newValue) => setdatestart(newValue)}
                                    />
                                </LocalizationProvider>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        sx={{ marginLeft: 1, width: '33%' }}
                                        label={
                                            <span>
                                                Date of End <RedAsterisk>*</RedAsterisk>
                                            </span>
                                        }
                                        value={dateend}
                                        onChange={(newValue) => setdateend(newValue)}
                                        renderInput={(params) => <TextField {...params} required />} // Mark as required
                                        disabled={!isDateEndEnabled} // Disable or enable based on state       
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
                            {confirmClose && (
                                <Alert severity="warning" sx={{ marginTop: 2 }}>
                                    Are you sure you want to close this? The data filled will not be saved.
                                    <Button onClick={() => handleConfirmClose(true)}>Yes</Button>
                                    <Button onClick={() => handleConfirmClose(false)}>No</Button>
                                </Alert>
                            )}
                            {successMessage && <Alert severity="success">{successMessage}</Alert>}
                            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
                            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                                <Button
                                    sx={{ borderRadius: 5, marginLeft: 'auto', marginTop: 5, marginBottom: 3 }}
                                    type='submit'
                                    color='primary'
                                    variant='contained'
                                    onClick={handleSubmit}>Submit</Button>
                            </Box>

                        </Box>
                    </Box>
                </Box>
            </Modal >
        </>
    )
}