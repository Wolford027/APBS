import React, { useState, useEffect } from 'react'
import { Box, Modal, TextField, Autocomplete, Typography, Button, InputAdornment, Alert } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { useDialogs } from '@toolpad/core';
import Region from '../_Regions/Region.json'
import axios from 'axios'
import { styled } from '@mui/system'
import { position } from '@chakra-ui/react'

export default function AddEmpModal({ onOpen, onClose }) {
    // Styled component for red asterisk
    const RedAsterisk = styled('span')({
        color: 'red', // Change asterisk color to red
    });
    const [input, setInput] = useState([])
    const [input1, setInput1] = useState([])
    const [secondLabel, setSecondLabel] = useState([])
    const [value1, setValue1] = useState(null)
    const dialogs = useDialogs()

    const provinceOptions = ['Province1', 'Province2', 'Province3'];
    const cityOptions = ['City1', 'City2', 'City3'];
    const [input, setInput] = useState([]);
    const [input1, setInput1] = useState([]);

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

            // Set secondLabel and placeholder based on selected education type
            if (newValue.id === 3) {
                secondLabel = 'Course';
                placeholder = 'Enter your course';
            } else if (newValue.id === 1) {
                secondLabel = 'Grade';
                placeholder = 'e.g. Grade 7-10';
            } else if (newValue.id === 2) {
                secondLabel = 'Strand';
                placeholder = 'e.g. STEM';
            } else if (newValue.id === 4) {
                secondLabel = 'Course';
                placeholder = 'e.g. Bookkeeping';
            }

            const newEntry = {
                label: newValue.label,
                secondLabel,
                placeholder,
                institutionName: '',
                degree: '',
                year: '',
                school_uni_id: newValue.id
            };

            setInput([...input, newEntry]);
            console.log('Updated input:', [...input, newEntry]); // Log the updated input
        }
    };


    const handleRemoveEducBg = (index) => {
        const updatedInputs = input.filter((_, i) => i !== index);
        setInput(updatedInputs);
    };

    const handleInputChange = (index, field, value) => {
        const updatedInput = input.map((item, idx) => {
            if (idx === index) {
                return { ...item, [field]: value };
            }
            return item;
        });
        setInput(updatedInput);
        console.log('Input after change:', updatedInput); // Log after changing
    };


    const handleRemoveWorkExp = (index) => {
        const updatedInputs1 = input1.filter((_, i) => i !== index);
        setInput1(updatedInputs1);
    };

    const handleAddWorkExp = () => {
        setInput1([...input1, { company_name: '', position: '', year: '' }]);
    };

    const handleInputChange1 = (index, field, value) => {
        const updatedInput = input1.map((item, idx) => {
            if (idx === index) {
                return { ...item, [field]: value };
            }
            return item;
        });
        setInput1(updatedInput);
    };

    // Styled component for red asterisk
    const RedAsterisk = styled('span')({
        color: 'red', // Change asterisk color to red
    });

    const [value1, setValue1] = useState(null)

    // MOBILE NUMBER
    const [mobileNumber, setMobileNumber] = useState('');

    const handleMobileNumberChange = (event) => {
        const inputValue = event.target.value;

        // Optional: Allow only digits and ensure it does not exceed 10 digits
        if (/^\d*$/.test(inputValue) && inputValue.length <= 10) {
            setNumber(inputValue); // Update state with the digits
        }
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

    const [citizenship, setCitizenship] = useState([]);

    // Fetch civil status data from the backend
    useEffect(() => {
        const fetchCitizenship = async () => {
            try {
                const response = await axios.get('http://localhost:8800/citi');
                console.log(response.data); // Check the structure of the data
                setCitizenship(response.data);
            } catch (error) {
                console.error('Error fetching citizenship:', error);
            }
        };

        fetchCitizenship();
    }, []);

    const [religion, setReligion] = useState([]);

    // Fetch civil status data from the backend
    useEffect(() => {
        const fetchReligion = async () => {
            try {
                const response = await axios.get('http://localhost:8800/religion');
                console.log(response.data); // Check the structure of the data
                setReligion(response.data);
            } catch (error) {
                console.error('Error fetching religion:', error);
            }
        };

        fetchReligion();
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

    const [selectedPosition, setSelectedPosition] = useState(null);


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

        if (!value) {
            setSelectedRateType(null);
        }
    };

    const handleRateValueChange = (event, value) => {
        setSelectedRateValue(value);
        console.log('Selected Rate Value:', value); // Log selected value
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
        setSelectedEmploymentType(value);

        if (value?.employment_type_name === 'Provisionary' || value?.employment_type_name === 'Project-based') {
            setIsDateEndEnabled(true); // Enable the Date of End field
        } else {
            setIsDateEndEnabled(false); // Disable the Date of End field
            setdateend(null); // Clear the Date of End value
        }
        if (!value) {
            setSelectedStatus(null);
        }
    };

    const handleStatusChange = (event, value) => {
        setSelectedStatus(value);
        console.log('Selected Status:', value); // Log selected value
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
    }, []);

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

    // useEffect to auto-dismiss notifications after 3 seconds
    useEffect(() => {
        if (successMessage || errorMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage('');
                setErrorMessage('');
            }, 3000); // 3 seconds
            return () => clearTimeout(timer); // Cleanup timer
        }
    }, [successMessage, errorMessage]); // NEW

    const handleSubmit = async () => {
        // Check for required fields before proceeding
        if (!surname || !firstname || !middlename || !suffix || !selectedCivilStatus || !sex || !dateofbirth || !selectedProvince1 || !selectedMunicipality1 || !email || !number ||
            !selectedRegion || !selectedProvince || !selectedMunicipality || !selectedBarangay || !streetadd || !selectedStatus || !selectedEmploymentType || !selectedPosition || !selectedRateType ||
            !selectedRateValue || !selectedDepartment || !datestart || !sss || !philHealth || !tin || !hdmfNumber) {
            setSnackbarMessage("Please fill in all required fields.");
            setSnackbarSeverity('error');
            setSnackbarOpen(true); // Show Snackbar

            return;
        }

        try {
            // First, add the employee's personal info
            const AddEmp = {
                surname,
                firstname,
                middlename,
                suffix,
                civilStatusId: selectedCivilStatus?.cs_name, // Get civil status ID
                sexId: selectedSex?.sex_name, // Get sex ID
                citizenshipId: selectedCitizenship?.nationality,
                religionId: selectedReligion?.religion_name,
                dateOfBirth: dateofbirth ? dateofbirth.format('MM-DD-YYYY') : null, // Use ISO format
                provinceOfBirth: selectedProvince1,
                municipalityOfBirth: selectedMunicipality1,
                email,
                number,
                region: selectedRegion,
                province: selectedProvince,
                municipality: selectedMunicipality,
                barangay: selectedBarangay,
                streetadd,
                status: selectedStatus ? selectedStatus.emp_status_name : null,
                employmentType: selectedEmploymentType ? selectedEmploymentType.employment_type_name : null,
                position: selectedPosition ? selectedPosition.position : null,
                ratetype: selectedRateType ? selectedRateType.emp_rt_name : null,
                rateValue: selectedRateValue ? selectedRateValue.pos_rt_val : null,
                department: selectedDepartment ? selectedDepartment.emp_dept_name : null,
                datestart: datestart ? datestart.format('MM-DD-YYYY') : null,
                dateend: dateend ? dateend.format('MM-DD-YYYY') : null,
                sss,
                philHealth,
                hdmfNumber,
                tin
            };

            const empResponse = await axios.post('http://localhost:8800/AddEmp', AddEmp);
            const empId = empResponse.data.insertId; // Get the new emp_id
            console.log('New Employee ID:', empId);

            // Prepare educational background data if input is not empty
            const eduBgData = input.map(item => ({
                emp_id: empId,
                school_uni_id: item.school_uni_id,
                school_university: item.label,
                category: item.secondLabel,
                year: item.year,
            }));

            console.log('eduBgData:', eduBgData); // Log the data to check its format

            // Send educational background data to backend only if there's data to send
            if (eduBgData.length > 0) {
                await axios.post('http://localhost:8800/AddEducbg', eduBgData);
            } else {
                console.log('No educational background data to send.');
            }

            // Prepare work experience data if input1 is not empty
            const workExpData = input1.map(item => ({
                emp_id: empId,
                category_id: 5,
                company_name: item.company_name,
                position: item.position,
                year: item.year,
            }));

            console.log('workExpData:', workExpData); // Log the data to check its format

            // Send work experience data to backend only if there's data to send
            if (workExpData.length > 0) {
                await axios.post('http://localhost:8800/AddWorkExp', workExpData);
            } else {
                console.log('No work experience data to send.');
            }

            // Reset form after successful submission
            setInput([]);
            setInput1([]);

            // If all the requests are successful
            setSuccessMessage("Data saved successfully!");
            resetForm(); // Clear the form after successful submission
        } catch (error) {
            console.error('Error during submission:', error);
            setErrorMessage("Error saving data. Please check your input and try again.");
        }
    };


    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('error');

    const [confirmClose, setConfirmClose] = useState(false); // Confirm close dialog state

    const [surname, setSurname] = useState('');
    const [firstname, setFirstname] = useState('');
    const [middlename, setMiddlename] = useState('');
    const [suffix, setSuffix] = useState('');
    const [selectedCivilStatus, setSelectedCivilStatus] = useState(null);
    const [selectedCitizenship, setSelectedCitizenship] = useState(null);
    const [selectedReligion, setSelectedReligion] = useState(null);
    const [selectedSex, setSelectedSex] = useState(null);
    const [dateofbirth, setdateofbirth] = useState(null);
    const [email, setEmail] = useState('');
    const [number, setNumber] = useState('');

    const [streetadd, setStreetadd] = useState('');

    const [selectedStatus, setSelectedStatus] = useState(null);
    const [selectedEmploymentType, setSelectedEmploymentType] = useState(null);
    const [employment, setEmployment] = useState([]); // Assume this is fetched from your API

    const [selectedDepartment, setSelectedDepartment] = useState(null);


    const closeModal = () => {
        // Check if any field has data
        if (
            surname || firstname || middlename || suffix || selectedCivilStatus || selectedSex || dateofbirth ||
            selectedProvince1 || selectedMunicipality1 || email || number ||
            selectedRegion || selectedProvince || selectedMunicipality || selectedBarangay || streetadd ||
            selectedStatus || selectedEmploymentType || selectedPosition || selectedRateType ||
            selectedRateValue || selectedDepartment || datestart || dateend ||
            sss || philHealth || tin || hdmfNumber
        ) {
            setConfirmClose(true); // Show confirmation dialog
        } else {
            resetForm(); // Reset the form
            onClose(); // Close the modal
        }
    };

    const handleConfirmClose = (confirm) => {
        if (confirm) {
            resetForm(); // Clear form fields
            onClose(); // Close the modal
        }
        setConfirmClose(false); // Hide the confirmation dialog
    };


    const resetForm = () => {
        setSurname(''); setFirstname(''); setMiddlename(''); setSuffix('');
        setSelectedCivilStatus(null); setSelectedSex(null); setSelectedReligion(null); setSelectedCitizenship(null);
        setdateofbirth(null); setSelectedProvince1(null); setSelectedMunicipality1(null);

        setEmail(''); setNumber('');
        setSelectedRegion(null); setSelectedProvince(null); setSelectedMunicipality(null); setSelectedBarangay(null); setStreetadd('');

        setSelectedStatus(null); setSelectedEmploymentType(null);
        setSelectedPosition(null); setSelectedRateType(null); setSelectedRateValue(null);
        setSelectedDepartment(null); setdatestart(null); setdateend(null);

        setSSS(''); setPhilHealth(''); setTin(''); setHdmfNumber('');

        showSnackbar('All fields cleared');
    };

    const [snackbarOpen1, setSnackbarOpen1] = useState(false);
    const [snackbarMessage1, setSnackbarMessage1] = useState('');

    const showSnackbar = (message) => {
        setSnackbarMessage1(message);
        setSnackbarOpen1(true);
    };
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
          
                        <CloseIcon onClick={handleConfirmClose} sx={{cursor: 'pointer', marginLeft: 80}} />
                        <Typography variant='h4' sx={{ marginBottom: 1 }}>
                            Add Employee Information
                        </Typography>

                        <Box sx={{ overscrollBehavior: 'contain' }}>

                            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginTop: 2 }}>
                                <Typography variant='h5' >Personal Information</Typography>
                                <Typography sx={{ marginTop: 1 }}>
                                    <span >
                                        <RedAsterisk>* Required Fields</RedAsterisk>
                                    </span>
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1 }}>

                                <TextField
                                    label={
                                        <span>
                                            <RedAsterisk>*</RedAsterisk> First Name
                                        </span>
                                    }
                                    placeholder="Enter First Name"
                                    name='Firstname'
                                    sx={{ width: '30%', marginLeft: 1 }}
                                    value={firstname}
                                    onChange={(e) => setFirstname(e.target.value)} // Update surname state
                                />
                                <TextField
                                    label={
                                        <span>
                                            <RedAsterisk>*</RedAsterisk> Middle Name
                                        </span>
                                    }

                                    placeholder="Enter Middle Name"
                                    name='Middlename'
                                    sx={{ width: '25%', marginLeft: 1 }}
                                    value={middlename}
                                    onChange={(e) => setMiddlename(e.target.value)} // Update surname state
                                />
                                <TextField
                                    label={
                                        <span>
                                            <RedAsterisk>*</RedAsterisk> Surname
                                        </span>
                                    }
                                    placeholder="Enter Surname"
                                    name='Surname'
                                    sx={{ width: '30%', marginLeft: 1 }}
                                    value={surname}
                                    onChange={(e) => setSurname(e.target.value)} // Update surname state

                                />
                                <TextField
                                    label='Suffix'
                                    placeholder="Enter Suffix"
                                    name='Suffix'
                                    sx={{ width: '16%', marginLeft: 1 }}
                                    value={suffix}
                                    onChange={(e) => setSuffix(e.target.value)} // Update surname state
                                />
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                                <Autocomplete
                                    sx={{ width: '49%', marginLeft: 1, marginTop: 2 }}
                                    options={civilStatus || []} // Fallback to an empty array if civilStatus is undefined
                                    getOptionLabel={(option) => option.cs_name || ''} // Ensure the field exists
                                    value={selectedCivilStatus} // Bind the selected civil status value
                                    renderInput={(params) => (
                                        <TextField {...params} label={
                                            <span>
                                                <RedAsterisk>*</RedAsterisk> Civil Status
                                            </span>
                                        } />
                                    )}
                                    onChange={(event, value) => {
                                        setSelectedCivilStatus(value); // Store selected value
                                        console.log('Selected Civil Status:', value); // Log selected value

                                        // Clear the civil status if the value is null
                                        if (!value) {
                                            setSelectedCivilStatus(null); // Clear the civil status
                                        }
                                    }}
                                />
                                <Autocomplete
                                    sx={{ width: '49%', marginLeft: 1, marginTop: 2 }}
                                    options={sex} // Use the fetched data
                                    getOptionLabel={(option) => option.sex_name || ''} // Display the sex_name in the dropdown
                                    value={selectedSex}
                                    renderInput={(params) => (
                                        <TextField {...params} label={
                                            <span>
                                                <RedAsterisk>*</RedAsterisk> Sex
                                            </span>
                                        } />
                                    )}
                                    onChange={(event, value) => {
                                        setSelectedSex(value); // Store selected value
                                        console.log('Selected Sex:', value); // Handle selection

                                        // Clear the civil status if the value is null
                                        if (!value) {
                                            setSelectedSex(null); // Clear the sex
                                        }
                                    }}
                                />

                                <Autocomplete
                                    sx={{ width: '49%', marginLeft: 1, marginTop: 2 }}
                                    options={citizenship || []} // Fallback to an empty array if civilStatus is undefined
                                    getOptionLabel={(option) => option.nationality || ''} // Ensure the field exists
                                    value={selectedCitizenship} // Bind the selected civil status value
                                    renderInput={(params) => (
                                        <TextField {...params} label={
                                            <span>
                                                <RedAsterisk>*</RedAsterisk> Citizenship
                                            </span>
                                        } />
                                    )}
                                    onChange={(event, value) => {
                                        setSelectedCitizenship(value); // Store selected value
                                        console.log('Selected Citizenship:', value); // Log selected value

                                        // Clear the civil status if the value is null
                                        if (!value) {
                                            setSelectedCitizenship(null); // Clear the civil status
                                        }
                                    }}
                                />
                                <Autocomplete
                                    sx={{ width: '49%', marginLeft: 1, marginTop: 2 }}
                                    options={religion} // Use the fetched data
                                    getOptionLabel={(option) => option.religion_name || ''} // Display the sex_name in the dropdown
                                    value={selectedReligion}
                                    renderInput={(params) => (
                                        <TextField {...params} label={
                                            <span>
                                                <RedAsterisk>*</RedAsterisk> Religion
                                            </span>
                                        } />
                                    )}
                                    onChange={(event, value) => {
                                        setSelectedReligion(value); // Store selected value
                                        console.log('Selected Religion:', value); // Handle selection

                                        // Clear the civil status if the value is null
                                        if (!value) {
                                            setSelectedReligion(null); // Clear the sex
                                        }
                                    }}
                                />

                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 2 }}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        sx={{ width: '33%', marginLeft: 1 }}
                                        label={
                                            <span>
                                                <RedAsterisk>*</RedAsterisk> Date of Birth
                                            </span>
                                        }
                                        value={dateofbirth}
                                        onChange={(newValue) => setdateofbirth(newValue)} />
                                </LocalizationProvider>

                                <Autocomplete
                                    sx={{ marginLeft: 1, width: '33%' }}

                                    options={provinces1} // Ensure correct state variable
                                    getOptionLabel={(option) => option}
                                    renderInput={(params) => <TextField {...params} label={
                                        <span>
                                            <RedAsterisk>*</RedAsterisk> Province of Birth
                                        </span>
                                    } />}
                                    onChange={handleProvinceChange1}
                                    value={selectedProvince1}

                                />
                                <Autocomplete
                                    sx={{ marginLeft: 1, width: '33%' }}

                                    options={municipalities1} // Ensure correct state variable
                                    getOptionLabel={(option) => option}
                                    onChange={(event, value) => {
                                        console.log("Selected municipality:", value); // Debugging log
                                        setSelectedMunicipality1(value); // Set selected municipality
                                    }}
                                    renderInput={(params) => <TextField {...params} label={
                                        <span>
                                            <RedAsterisk>*</RedAsterisk> City of Birth
                                        </span>
                                    } />}
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
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <TextField
                                    label={
                                        <span>
                                            <RedAsterisk>*</RedAsterisk> Mobile Number
                                        </span>
                                    }
                                    placeholder='Enter Mobile Number'
                                    name='mobile'
                                    value={number} // Set only the digits in the state
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
                                    renderInput={(params) => <TextField {...params} label={
                                        <span>
                                            <RedAsterisk>*</RedAsterisk> Region
                                        </span>
                                    } />}
                                    value={selectedRegion} // Bind selected region
                                />
                                <Autocomplete
                                    sx={{ marginLeft: 1, width: '50%' }}

                                    options={provinces}
                                    getOptionLabel={(option) => option}
                                    onChange={handleProvinceChange}
                                    renderInput={(params) => <TextField {...params} label={
                                        <span>
                                            <RedAsterisk>*</RedAsterisk> Province
                                        </span>
                                    } />}
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
                                    renderInput={(params) => <TextField {...params} label={
                                        <span>
                                            <RedAsterisk>*</RedAsterisk> Municipality
                                        </span>
                                    } />}
                                    disabled={!selectedProvince} // Disable if no province is selected
                                    value={selectedMunicipality} // Bind selected municipality
                                />
                                <Autocomplete
                                    sx={{ marginLeft: 1, width: '50%' }}

                                    options={barangays}
                                    getOptionLabel={(option) => option}
                                    onChange={(event, value) => setSelectedBarangay(value)} // Handle barangay change
                                    renderInput={(params) => <TextField {...params} label={
                                        <span>
                                            <RedAsterisk>*</RedAsterisk> Barangay
                                        </span>
                                    } />}
                                    disabled={!selectedMunicipality} // Disable if no municipality is selected
                                    value={selectedBarangay} // Bind selected barangay
                                />
                            </Box>
                            <TextField label={
                                <span>
                                    <RedAsterisk>*</RedAsterisk> Street Address
                                </span>
                            } placeholder='House No./Street' name='StreetAddress' sx={{ marginLeft: 1, marginTop: 2, width: '99%' }}
                                value={streetadd}
                                onChange={(e) => setStreetadd(e.target.value)} />

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
                                            placeholder={item.placeholder}
                                            sx={{ marginLeft: 1, width: '45%' }}
                                            value={item.institutionName}
                                            onChange={(event) => handleInputChange(index, 'institutionName', event.target.value)}
                                        />
                                        <TextField
                                            label={item.secondLabel}
                                            placeholder={item.placeholder}
                                            sx={{ marginLeft: 1, width: '25%' }}
                                            value={item.degree}
                                            onChange={(event) => handleInputChange(index, 'degree', event.target.value)}
                                        />
                                        <TextField
                                            label="Year"
                                            placeholder="e.g. 2012-2016"
                                            value={item.year}
                                            onChange={(event) => handleInputChange(index, 'year', event.target.value)}
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
                                            value={item.company_name}
                                            onChange={(event) => handleInputChange1(index1, 'company_name', event.target.value)}
                                        />
                                        <TextField
                                            label='Position'
                                            placeholder='e.g. Manager'
                                            sx={{ marginLeft: 1, width: '25%' }}
                                            value={item.position}
                                            onChange={(event) => handleInputChange1(index1, 'position', event.target.value)}
                                        />
                                        <TextField
                                            label='Year'
                                            placeholder='e.g. 2012-2016'
                                            sx={{ marginLeft: 1, width: '20%' }}
                                            value={item.year}
                                            onChange={(event) => handleInputChange1(index1, 'year', event.target.value)}
                                        />
                                        <Button
                                            variant='contained'
                                            onClick={() => handleRemoveWorkExp(index1)}
                                            sx={{ marginLeft: 1 }}
                                        >
                                            Remove
                                        </Button>
                                    </Box>
                                ))}
                                <Button
                                    variant='contained'
                                    onClick={handleAddWorkExp}
                                    sx={{ marginLeft: 1, width: '50%' }}
                                >
                                    Add Work Experience
                                </Button>
                            </Box>

                            <Typography variant='h5' sx={{ marginTop: 3 }}>Employee Information</Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 2 }}>

                                <Autocomplete
                                    sx={{ width: '50%', marginLeft: 1 }}

                                    options={status} // Use the filtered data
                                    getOptionLabel={(option) => option.emp_status_name || ''}
                                    value={selectedStatus}
                                    renderInput={(params) => <TextField {...params} label={
                                        <span>
                                            <RedAsterisk>*</RedAsterisk> Status
                                        </span>
                                    } />}
                                    onChange={(event, value) => {
                                        console.log('Selected status:', value);
                                        setSelectedStatus(value);

                                        if (!value) {
                                            setSelectedStatus(null);
                                        }
                                    }}
                                />

                                <Autocomplete
                                    sx={{ width: '50%', marginLeft: 1 }}
                                    options={employement}
                                    value={selectedEmploymentType}
                                    getOptionLabel={(option) => option.employment_type_name || ''}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label={
                                                <span>
                                                    <RedAsterisk>*</RedAsterisk> Employment Type
                                                </span>
                                            }
                                        />
                                    )}
                                    onChange={handleEmploymentChange}
                                />
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 2 }}>

                                <Autocomplete
                                    sx={{ width: '33%', marginLeft: 1 }}
                                    options={ratetypevaluepos}
                                    value={selectedPosition}
                                    getOptionLabel={(option) => option.position || ''} // Ensure `option.position` exists
                                    renderInput={(params) => <TextField {...params} label={
                                        <span>
                                            <RedAsterisk>*</RedAsterisk> Position
                                        </span>
                                    } />}
                                    onChange={(event, value) => {
                                        console.log('Selected Position:', value); // Handle 
                                        setSelectedPosition(value); // Save selected status to state

                                        if (!value) {
                                            setSelectedPosition(null);
                                        }
                                    }}
                                />

                                <Autocomplete
                                    sx={{ marginLeft: 1, width: '33%' }}
                                    value={selectedRateType}
                                    options={ratetype}
                                    getOptionLabel={(option) => option.emp_rt_name || ""}
                                    renderInput={(params) => <TextField {...params} label={
                                        <span>
                                            <RedAsterisk>*</RedAsterisk> Rate Type
                                        </span>
                                    } />}
                                    onChange={handleRateTypeChange}
                                />
                                <Autocomplete
                                    sx={{ marginLeft: 1, width: '33%' }}

                                    options={filteredRateValues}
                                    getOptionLabel={(option) =>
                                        new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(option.pos_rt_val) // Format as PHP currency
                                    }
                                    renderInput={(params) => <TextField {...params} label={
                                        <span>
                                            <RedAsterisk>*</RedAsterisk> Rate Value
                                        </span>
                                    } />}
                                    disabled={!selectedRateType} // Disable if no rate type selected
                                    onChange={handleRateValueChange} // Handle rate value selection
                                    value={selectedRateValue} // Bind selected rate value
                                />
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 2 }}>
                                <Autocomplete
                                    sx={{ width: '33%', marginLeft: 1 }}
                                    options={department}
                                    value={selectedDepartment}
                                    getOptionLabel={(option) => option.emp_dept_name || ''}
                                    onChange={(event, value) => {
                                        setSelectedDepartment(value);

                                        if (!value) {
                                            setSelectedDepartment(null); // Clear the sex
                                        }
                                    }}
                                    renderInput={(params) => <TextField {...params} label={
                                        <span>
                                            <RedAsterisk>*</RedAsterisk> Department
                                        </span>
                                    } />}
                                />

                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        sx={{ marginLeft: 1, width: '33%' }}
                                        label={
                                            <span>
                                                <RedAsterisk>*</RedAsterisk>Date of Hired
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
                                                {isDateEndEnabled ? <RedAsterisk>*</RedAsterisk> : null} Date of End
                                            </span>
                                        }
                                        value={dateend}
                                        onChange={(newValue) => setdateend(newValue)}
                                        renderInput={(params) => <TextField {...params} required={isDateEndEnabled} />} // Mark as required if enabled
                                        disabled={!isDateEndEnabled} // Disable or enable based on state       
                                    />
                                </LocalizationProvider>

                            </Box>
                            <Typography variant='h5' sx={{ marginTop: 5 }}>Employee Government Numbers</Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 2 }}>

                                <TextField
                                    fullWidth
                                    sx={{ marginLeft: 1, width: '49%', marginTop: 2 }}
                                    label={
                                        <span>
                                            <RedAsterisk>*</RedAsterisk>Taxpayer Identification Number
                                        </span>
                                    }
                                    placeholder='000-000-000-000'
                                    name='tin'
                                    value={tin} // Set the value to the formatted TIN
                                    onChange={handleTINChange} // Handle input changes
                                    inputProps={{ maxLength: 15 }} // Limit length to 14 characters
                                    renderInput={(params) => <TextField {...params} required />} // Mark as required
                                />

                                <TextField
                                    sx={{ marginLeft: 1, width: '48%', marginTop: 2 }}
                                    label={
                                        <span>
                                            <RedAsterisk>*</RedAsterisk>Social Security System
                                        </span>
                                    }
                                    placeholder='00-0000000-0'
                                    name='sss'
                                    value={sss} // Set the value to the formatted SSS
                                    onChange={handleSSSChange} // Handle input changes
                                    inputProps={{ maxLength: 12 }} // Limit length to 12 characters (including hyphens)
                                    renderInput={(params) => <TextField {...params} required />} // Mark as required
                                />
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                                <TextField
                                    sx={{ marginLeft: 1, width: '49%', marginTop: 2 }}
                                    label={
                                        <span>
                                            <RedAsterisk>*</RedAsterisk>PhilHealth
                                        </span>
                                    }
                                    placeholder='00-000000000-0'
                                    name='philhealth'
                                    value={philHealth} // Set the value to the formatted PhilHealth number
                                    onChange={handlePhilHealthChange} // Handle input changes
                                    inputProps={{ maxLength: 15 }} // Limit length to 15 characters (including hyphens)
                                    renderInput={(params) => <TextField {...params} required />} // Mark as required
                                />
                                <TextField
                                    sx={{ marginLeft: 1, width: '49%', marginTop: 2 }}
                                    label={
                                        <span>
                                            <RedAsterisk>*</RedAsterisk>Home Development Mutual Fund
                                        </span>
                                    }
                                    placeholder='0000-0000-0000'
                                    name='hdmf'
                                    value={hdmfNumber} // Set the value to the formatted HDMF number
                                    onChange={handleHdmfChange} // Handle input changes
                                    inputProps={{ maxLength: 15 }} // Limit length to 15 characters (including hyphens)
                                    renderInput={(params) => <TextField {...params} required />} // Mark as required
                                />
                            </Box>
                            {confirmClose && (
                                <Snackbar
                                    open={confirmClose}
                                    onClose={() => handleConfirmClose(false)}
                                    autoHideDuration={6000}
                                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                                >
                                    <Alert
                                        severity="warning"
                                        action={
                                            <>
                                                <Button color="inherit" size="small" onClick={() => handleConfirmClose(true)}>
                                                    Yes
                                                </Button>
                                                <Button color="inherit" size="small" onClick={() => handleConfirmClose(false)}>
                                                    No
                                                </Button>
                                            </>
                                        }
                                    >
                                        Are you sure you want to close this? The data filled will not be saved.
                                    </Alert>
                                </Snackbar>
                            )}

                            {/* Success and Error Notifications (NEW) */}
                            {successMessage && (
                                <Snackbar
                                    open={!!successMessage}
                                    autoHideDuration={3000}
                                    onClose={() => setSuccessMessage('')}
                                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                                >
                                    <Alert onClose={() => setSuccessMessage('')} severity="success" sx={{ width: '100%' }}>
                                        {successMessage}
                                    </Alert>
                                </Snackbar>
                            )}

                            {errorMessage && (
                                <Snackbar
                                    open={!!errorMessage}
                                    autoHideDuration={3000}
                                    onClose={() => setErrorMessage('')}
                                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                                >
                                    <Alert onClose={() => setErrorMessage('')} severity="error" sx={{ width: '100%' }}>
                                        {errorMessage}
                                    </Alert>
                                </Snackbar>
                            )}

                            <Snackbar
                                open={snackbarOpen}
                                autoHideDuration={3000} // 3 seconds duration
                                onClose={() => setSnackbarOpen(false)}
                                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                            >
                                <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
                                    {snackbarMessage}
                                </Alert>
                            </Snackbar>
                            <Box sx={{ display: 'flex', marginLeft: 'auto', flexDirection: 'row', justifyContent: 'flex-end' }}>


                                <Button sx={{ borderRadius: 5, marginTop: 5, marginBottom: 3 }}

                                    color='primary'
                                    variant='outlined'
                                    onClick={resetForm}>Reset
                                </Button>

                                <Button
                                    sx={{ borderRadius: 5, marginTop: 5, marginBottom: 3, marginLeft: 1 }}
                                    type='submit'
                                    color='primary'
                                    variant='contained'
                                    onClick={handleSubmit}>Submit

                                </Button>
                                <Snackbar
                                    open={snackbarOpen1}
                                    autoHideDuration={3000} // Duration for which the Snackbar is visible
                                    onClose={() => setSnackbarOpen1(false)} // Ensure this uses the correct state
                                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                                >
                                    <Alert onClose={() => setSnackbarOpen1(false)} severity="success" sx={{ width: '100%' }}>
                                        {snackbarMessage1}
                                    </Alert>
                                </Snackbar>


                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Modal >
        </>
    )
}