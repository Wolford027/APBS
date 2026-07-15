import React, { useState, useEffect } from 'react';
import { Box, Modal, TextField, Autocomplete, Typography, Button, InputAdornment, Alert, Snackbar, IconButton, Grid, alpha } from '@mui/material';
import { motion } from 'motion/react';
import { modalPop } from '../../../shared/animations';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import Region from '../utils/Region.json'
import axios from 'axios'
import { styled } from '@mui/material/styles'
import ImageUpload from './ImageUpload'
import countries from '../../../shared/utils/countries.json'

function SectionHeader({ step, title, description, first }) {
    return (
        <Box sx={{ mt: first ? 0 : 4, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Box
                    sx={{
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 13,
                        fontWeight: 700,
                        color: 'primary.main',
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                        flexShrink: 0,
                    }}
                >
                    {step}
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {title}
                </Typography>
            </Box>
            {description && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, ml: '38px' }}>
                    {description}
                </Typography>
            )}
        </Box>
    );
}

export default function AddEmp({onOpen, onClose}) {
    const [input, setInput] = useState([]);
    const [input1, setInput1] = useState([]);
    const [input2, setinput2] = useState([]);
    const [file, setFile] = useState('');
    const [tin, setTin] = useState('');
    const [sss, setSss] = useState('');
    const [hdmf, setHdmf] = useState('');
    const [employment, setEmployment] = useState([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('error');
    const [confirmClose, setConfirmClose] = useState(false);
    const [surname, setSurname] = useState('');
    const [firstname, setFirstname] = useState('');
    const [middlename, setMiddlename] = useState('');
    const [suffix, setSuffix] = useState('');
    const [selectedCivilStatus, setSelectedCivilStatus] = useState(null);
    const [selectedCitizenship, setSelectedCitizenship] = useState(null);
    const [selectedReligion, setSelectedReligion] = useState(null);
    const [selectedSex, setSelectedSex] = useState(null);
    const [dateofbirth, setdateofbirth] = useState(null)
    const [email, setEmail] = useState('');
    const [number, setNumber] = useState('');
    const [streetadd, setStreetadd] = useState('');
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [selectedAllowStatus, setSelectedAllowStatus] = useState(null);
    const [selectedEmploymentType, setSelectedEmploymentType] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [citizenship, setCitizenship] = useState([]);
    const [civilStatus, setCivilStatus] = useState([]);
    const [philHealth, setPhilHealth] = useState('');
    const [religion, setReligion] = useState([]);
    const [sex, setSex] = useState([]);
    const [ratetype, setRatetype] = useState([]);
    const [ratetypevalue, setRatetypevalue] = useState([]);
    const [filteredRateValues, setFilteredRateValues] = useState([]);
    const [selectedRateType, setSelectedRateType] = useState(null);
    const [selectedRateValue, setSelectedRateValue] = useState(null);
    const [selectedPosition, setSelectedPosition] = useState(null);
    const [status, setstatus] = useState([]);
    const [allowstatus, setallowstatus] = useState([]);
    const [department, setdepartment] = useState([]);
    const [snackbarOpen1, setSnackbarOpen1] = useState(false);
    const [snackbarMessage1, setSnackbarMessage1] = useState('');
    const [ratetypevaluepos, setRatetypevaluepos] = useState([]);
    const [datestart, setdatestart] = useState(null);
    const [employmentType, setEmploymentType] = useState(null);
    const [dateend, setdateend] = useState(null);
    const [dateact, setdateact] = useState(null);
    const [isDateEndEnabled, setIsDateEndEnabled] = useState(false);
    const [regions, setRegions] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [municipalities, setMunicipalities] = useState([]);
    const [barangays, setBarangays] = useState([]);
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [selectedProvince, setSelectedProvince] = useState(null);
    const [selectedMunicipality, setSelectedMunicipality] = useState(null);
    const [selectedBarangay, setSelectedBarangay] = useState(null);
    const [provinces1, setProvinces1] = useState([]);
    const [municipalities1, setMunicipalities1] = useState([]);
    const [selectedProvince1, setSelectedProvince1] = useState(null);
    const [selectedMunicipality1, setSelectedMunicipality1] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [values, setValues] = useState({
            riceSubsidy: '0.00',
            clothingAllowance: '0.00',
            laundryAllowance: '0.00',
            medicalAllowance: '0.00',
            medicalAssistant: '0.00',
            achivementAwards: '0.00',
        });


    const RedAsterisk = styled('span')(({ theme }) => ({
        color: 'red', //If not Filled
    }));

    const EduBg = [
        {label: 'HighSchool', id: 1, placeholder: 'Enter name of School'},
        {label: 'Senior HighSchool', id: 2, placeholder: 'Enter name of School'},
        {label: 'College', id: 3, placeholder: 'Enter name of School'},
        {label: 'Vocational', id: 4, placeholder: 'Enter name of School'},
    ]

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
                school_id: newValue.id
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

    const handleMobileNumberChange = (event) => {
        const inputValue = event.target.value;

        // Optional: Allow only digits and ensure it does not exceed 10 digits
        if (/^\d*$/.test(inputValue) && inputValue.length <= 10) {
            setNumber(inputValue); // Update state with the digits
        }
    };

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

    const handleSSSChange = (event) => {
        const input = event.target.value.replace(/\D/g, ''); // Remove non-digit characters
        let formattedSSS = '';

        // Format the SSS number in the format 33-3335151-3
        if (input.length > 0) formattedSSS += input.substring(0, 2);
        if (input.length > 2) formattedSSS += '-' + input.substring(2, 9);
        if (input.length > 8) formattedSSS += '-' + input.substring(9, 10);

        setSss(formattedSSS); // Update state with formatted SSS
    };

    const handlePhilHealthChange = (event) => {
        const input = event.target.value.replace(/\D/g, ''); // Remove non-digit characters
        let formattedPhilHealth = '';

        // Format the PhilHealth number in the format 02-515151234-5
        if (input.length > 0) formattedPhilHealth += input.substring(0, 2);
        if (input.length > 2) formattedPhilHealth += '-' + input.substring(2, 11);
        if (input.length > 10) formattedPhilHealth += '-' + input.substring(11, 12);

        setPhilHealth(formattedPhilHealth); // Update state with formatted PhilHealth number
    };

    const handleHdmfChange = (event) => {
        const input = event.target.value.replace(/\D/g, ''); // Remove non-digit characters
        let formattedHdmf = '';

        // Format the HDMF number in the format 1123-5845-4541
        if (input.length > 0) formattedHdmf += input.substring(0, 4); // First 4 digits
        if (input.length > 4) formattedHdmf += '-' + input.substring(4, 8); // Next 4 digits
        if (input.length > 8) formattedHdmf += '-' + input.substring(8, 12); // Last 4 digits

        setHdmf(formattedHdmf); // Update state with formatted HDMF number
    };

    const handleRateTypeChange = (event, value) => {
        setSelectedRateType(value);
        if (value) {
            const filteredValues = ratetypevalue
                .filter(rt => rt.emp_ratetype_id === value.rt_id)
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

    const handleSubmit = async () => {
        // Check for required fields before proceeding
        if (!surname || !firstname || !selectedCivilStatus || !sex || !dateofbirth || !selectedProvince1 || !selectedMunicipality1 || !email || !number ||
            !selectedRegion || !selectedProvince || !selectedMunicipality || !selectedBarangay || !streetadd || !selectedStatus || !selectedEmploymentType || !selectedPosition || !selectedRateType ||
            !selectedRateValue || !selectedDepartment || !datestart || !sss || !philHealth || !tin || !hdmf) {
            setSnackbarMessage("Please fill in all required fields.");
            setSnackbarSeverity('error');
            setSnackbarOpen(true); // Show Snackbar
            return;
        }
        try {
            // Add the employee's personal info
            const AddEmp = {
                file,
                surname,
                firstname,
                middlename,
                suffix,
                civilStatusId: selectedCivilStatus?.cs_name,
                sexId: selectedSex?.sex_name,
                citizenshipId: selectedCitizenship?.nationality,
                religionId: selectedReligion?.religion_name,
                dateOfBirth: dateofbirth ? dateofbirth.format('MM-DD-YYYY') : null,
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
                ratetype: selectedRateType ? selectedRateType.rt_name : null,
                rateValue: selectedRateValue ? selectedRateValue.pos_rt_val : null,
                department: selectedDepartment ? selectedDepartment.dept_name : null,
                datestart: datestart ? datestart.format('MM-DD-YYYY') : null,
                dateend: dateend ? dateend.format('MM-DD-YYYY') : null,
                sss,
                philHealth,
                hdmf,
                tin
            };

            const empResponse = await axios.post('http://localhost:8800/AddEmp', AddEmp);
            const empId = empResponse.data.insertId;
            console.log('New Employee ID:', empId);

            await handleImageUpload(empId); // Upload image after employee is added

            // Prepare educational background data
            const eduBgData = input.map(item => ({
                emp_id: empId,
                school_id: item.school_id,
                school_university: item.institutionName,
                category: item.degree,
                year: item.year,
            }));
            if (eduBgData.length > 0) {
                await axios.post('http://localhost:8800/AddEducbg', eduBgData);
            }

            // Prepare work experience data
            const workExpData = input1.map(item => ({
                emp_id: empId,
                category_id: 5,
                company_name: item.company_name,
                position: item.position,
                year: item.year,
            }));
            if (workExpData.length > 0) {
                await axios.post('http://localhost:8800/AddWorkExp', workExpData);
            }

            const deminimisAllow = {
                emp_id: empId,
                riceSubsidy: values.riceSubsidy,
                clothingAllowance: values.clothingAllowance,
                laundryAllowance: values.laundryAllowance,
                medicalAllowance: values.medicalAllowance,
                allowance_type: 'Monthly',
                status: selectedAllowStatus,
                date: dateact
            };
            //const response = await axios.post('http://localhost:8800/AddEarningsDeMinimisM', deminimisAllow);

            const addAllow = input2.map(item => ({
                emp_id: empId,
                name: item.name,
                value: item.value,
                allowanceType: item.allowanceType,
            }));
            if (addAllow.length > 0) {
                await axios.post('http://localhost:8800/AddEmpBenefits', addAllow);
            }

            // Reset form after successful submission
            setInput([]);
            setInput1([]);
            setinput2([]);
            setFile(null);
            setSuccessMessage("Data saved successfully!");
            resetForm(); // Clear the form after successful submission
            onClose();
        } catch (error) {
            console.error('Error during submission:', error);
            setErrorMessage("Error saving data. Please check your input and try again.");
        }
    };

    const handleImageUpload = async (empId) => {
        if (!file) {
            console.log("No file selected");
            return;
        }

        const formData = new FormData();
        formData.append("image", file);

        try {
            const uploadRes = await axios.post(`http://localhost:8800/upload/${empId}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        console.log("Image Upload Response:", uploadRes.data);
        if (uploadRes.data.Status !== "Success") {
            console.error("Image upload failed");
            return;
        }
        console.log("Image uploaded successfully");
        } catch (error) {
            console.error("Error uploading image:", error);
        }
    };

    const closeModal = () => {
        // Check if any field has data
        if (
            surname || firstname || middlename || suffix || selectedCivilStatus || selectedSex || dateofbirth ||
            selectedProvince1 || selectedMunicipality1 || email || number ||
            selectedRegion || selectedProvince || selectedMunicipality || selectedBarangay || streetadd ||
            selectedStatus || selectedEmploymentType || selectedPosition || selectedRateType ||
            selectedRateValue || selectedDepartment || datestart || dateend ||
            sss || philHealth || tin || hdmf ||  dateact || selectedAllowStatus 
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
        setFile(null);
        setSurname('');
        setFirstname('');
        setMiddlename('');
        setSuffix('');
        setSelectedCivilStatus(null);
        setSelectedSex(null);
        setSelectedReligion(null);
        setSelectedCitizenship(null);
        setdateofbirth(null);
        setSelectedProvince1(null);
        setSelectedMunicipality1(null);
        setEmail('');
        setNumber('');
        setSelectedRegion(null);
        setSelectedProvince(null);
        setSelectedMunicipality(null);
        setSelectedBarangay(null);
        setStreetadd('');
        setSelectedStatus(null);
        setSelectedEmploymentType(null);
        setSelectedPosition(null);
        setSelectedRateType(null);
        setSelectedRateValue(null);
        setSelectedDepartment(null);
        setdatestart(null);
        setdateend(null);
        setSss('');
        setPhilHealth('');
        setTin('');
        setHdmf('');
        setSnackbarOpen1(true);
        setValues({
            riceSubsidy: '0.00',
            clothingAllowance: '0.00',
            laundryAllowance: '0.00',
            medicalAllowance: '0.00',
            medicalAssistant: '0.00',
            achivementAwards: '0.00',
        });
        setInput([]);
        setInput1([]);
        setinput2([]);
        setdateact(null);
        setSelectedAllowStatus(null);
    };

    const showSnackbar = (message) => {
        setSnackbarMessage1(message);
        setSnackbarOpen1(true);
    };

    const handleChange2 = (field, value) => {
        setValues((prevValues) => ({
            ...prevValues,
            [field]: value,
        }));
    };

    const handleFocus = (field) => {
        setValues((prevValues) => ({
            ...prevValues,
            [field]: prevValues[field] === '0.00' ? '' : prevValues[field], // Clear '0.00' when focused
        }));
    };

    const handleBlur = (field) => {
        setValues((prevValues) => {
            let updatedValue = prevValues[field];

            // If the value is empty, set it back to '0.00'
            if (updatedValue === '') {
                updatedValue = '0.00';
            } else if (!updatedValue.includes('.')) {
                // Ensure two decimal places
                updatedValue = `${updatedValue}.00`;
            } else {
                // Truncate the decimal to two places
                const [integerPart, decimalPart] = updatedValue.split('.');
                updatedValue = `${integerPart}.${decimalPart.substring(0, 2)}`;
            }

            return {
                ...prevValues,
                [field]: updatedValue,
            };
        });
    };

    const handleRemoveBenefitsAllowance = (index) => {
        const newinput2 = input2.filter((_, i) => i !== index); // Remove entry by index
        setinput2(newinput2);
    };

    const handleAddBenefitsAllowance = () => {
        setinput2([...input2, { name: '', value: '', allowanceType: '' }]); // Add new entry
    };

    // Handle change in input fields for name or value
    const handleInputChange3 = (index, field, value) => {
        const newinput2 = [...input2]; // Create a copy of the state
        newinput2[index] = { ...newinput2[index], [field]: value }; // Update the specific field
        setinput2(newinput2); // Update the state with the new array
    };

    // Fetching
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
        const fetchCitizenship = async () => {
            const demonyms = countries.map((country) => ({
                name: country.name,
                demonym: country.demonym,
            }))
            console.log('Fetched citizenship data:', demonyms); // Log the fetched data
            setCitizenship(demonyms);
        };
        const fetchReligion = async () => {
            try {
                const response = await axios.get('http://localhost:8800/religion');
                console.log(response.data); // Check the structure of the data
                setReligion(response.data);
            } catch (error) {
                console.error('Error fetching religion:', error);
            }
        };
        const fetchSex = async () => {
            try {
                const response = await axios.get('http://localhost:8800/sex');
                setSex(response.data); // Set the fetched data in state
                console.log('Fetched sex data:', response.data); // Log the data
            } catch (error) {
                console.error('Error fetching sex data:', error);
            }
        };
        const fetchEmployement = async () => {
            try {
                const response = await axios.get('http://localhost:8800/employment_type');
                setEmployment(response.data); // Set the fetched data in state
                console.log('Fetched employment type data:', response.data); // Log the data
            } catch (error) {
                console.error('Error fetching employment type data:', error);
            }
        };
        const fetchStatus = async () => {
            try {
                const response = await axios.get('http://localhost:8800/status');
                setstatus(response.data); // Set the fetched data in state
                setallowstatus(response.data);
                console.log('Fetched status data:', response.data); // Log the data
            } catch (error) {
                console.error('Error fetching statusdata:', error);
            }
        };
        const fetchDepartment = async () => {
            try {
                const response = await axios.get('http://localhost:8800/fetch-department');
                setdepartment(response.data); // Set the fetched data in state
                console.log('Fetched status data:', response.data); // Log the data
            } catch (error) {
                console.error('Error fetching statusdata:', error);
            }
        };
        const fetchRatetype = async () => {
            try {
                const response = await axios.get('http://localhost:8800/rate-type');
                setRatetype(response.data);
            } catch (error) {
                console.error('Error fetching rate type data:', error);
            }
        };
        const fetchRatetypevalue = async () => {
            try {
                const response = await axios.get('http://localhost:8800/rate-type-value');
                setRatetypevalue(response.data);
            } catch (error) {
                console.error('Error fetching rate type value data:', error);
            }
        };
        const fetchPosition = async () => {
            try {
                const response = await axios.get('http://localhost:8800/rate-type-value');
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

        fetchCivilStatus();
        fetchCitizenship();
        fetchReligion();
        fetchSex();
        fetchEmployement();
        fetchStatus();
        fetchDepartment();
        fetchRatetype();
        fetchRatetypevalue();
        fetchPosition();
    }, []);

    useEffect(() => {
        // Extract regions from the JSON structure
        const regionsArray = Object.values(Region).map(region => ({
            region_name: region.region_name,
            province_list: region.province_list
        }));
        setRegions(regionsArray);
    }, []);

    useEffect(() => {
            const provincesArray1 = Object.values(Region).flatMap(region =>
                Object.keys(region.province_list)
            );
            console.log("Loaded provinces:", provincesArray1); // Debugging log
            setProvinces1(provincesArray1);
    }, []);

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



  return (
    <Modal open={onOpen} onClose={closeModal} closeAfterTransition>
        <Box component={motion.div} variants={modalPop} initial="hidden" animate="visible" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', p: 2 }}>
            <Box
                sx={{
                    bgcolor: 'background.paper',
                    width: '100%',
                    maxWidth: 960,
                    height: { xs: '94%', md: '88%' },
                    borderRadius: 3.5,
                    boxShadow: '0 24px 64px rgba(15, 23, 42, 0.28)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    outline: 'none',
                }}
            >
                {/* Header */}
                <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 2, borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="h6">Add Employee</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Fields marked with <RedAsterisk>*</RedAsterisk> are required
                        </Typography>
                    </Box>
                    <IconButton onClick={closeModal} aria-label="Close" edge="end">
                        <CloseIcon />
                    </IconButton>
                </Box>

                {/* Scrollable body */}
                <Box sx={{ px: 3, py: 3, flexGrow: 1, overflowY: 'auto', overscrollBehavior: 'contain' }}>
                    <SectionHeader
                        first
                        step={1}
                        title="Personal Information"
                        description="The employee's identity, photo, and place of birth"
                    />
                    <ImageUpload onChange={(file) => setFile(file)} />
                    <Grid container spacing={2} sx={{ mt: 0 }}>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                fullWidth
                                label={
                                    <span>
                                        <RedAsterisk>*</RedAsterisk> First Name
                                    </span>
                                }
                                placeholder="Enter First Name"
                                name='Firstname'
                                value={firstname}
                                onChange={(e) => setFirstname(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label='Middle Name'
                                placeholder="Enter Middle Name"
                                name='Middlename'
                                value={middlename}
                                onChange={(e) => setMiddlename(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label={
                                    <span>
                                        <RedAsterisk>*</RedAsterisk> Surname
                                    </span>
                                }
                                placeholder="Enter Surname"
                                name='Surname'
                                value={surname}
                                onChange={(e) => setSurname(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                            <TextField
                                fullWidth
                                label='Suffix'
                                placeholder="e.g. Jr."
                                name='Suffix'
                                value={suffix}
                                onChange={(e) => setSuffix(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Autocomplete
                                options={civilStatus || []}
                                getOptionLabel={(option) => option.cs_name || ''}
                                value={selectedCivilStatus}
                                renderInput={(params) => (
                                    <TextField {...params} label={
                                        <span>
                                            <RedAsterisk>*</RedAsterisk> Civil Status
                                        </span>
                                    } />
                                )}
                                onChange={(event, value) => {
                                    setSelectedCivilStatus(value);
                                    if (!value) {
                                        setSelectedCivilStatus(null);
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Autocomplete
                                options={sex}
                                getOptionLabel={(option) => option.sex_name || ''}
                                value={selectedSex}
                                renderInput={(params) => (
                                    <TextField {...params} label={
                                        <span>
                                            <RedAsterisk>*</RedAsterisk> Sex
                                        </span>
                                    } />
                                )}
                                onChange={(event, value) => {
                                    setSelectedSex(value);
                                    if (!value) {
                                        setSelectedSex(null);
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Autocomplete
                                options={citizenship || []}
                                getOptionLabel={(option) => option.demonym || ''}
                                value={selectedCitizenship}
                                renderInput={(params) => (
                                    <TextField {...params} label={
                                        <span>
                                            <RedAsterisk>*</RedAsterisk> Citizenship
                                        </span>
                                    } />
                                )}
                                onChange={(event, value) => {
                                    setSelectedCitizenship(value);
                                    if (!value) {
                                        setSelectedCitizenship(null);
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Autocomplete
                                options={religion}
                                getOptionLabel={(option) => option.religion_name || ''}
                                value={selectedReligion}
                                renderInput={(params) => (
                                    <TextField {...params} label={
                                        <span>
                                            <RedAsterisk>*</RedAsterisk> Religion
                                        </span>
                                    } />
                                )}
                                onChange={(event, value) => {
                                    setSelectedReligion(value);
                                    if (!value) {
                                        setSelectedReligion(null);
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    sx={{ width: '100%' }}
                                    label={
                                        <span>
                                            <RedAsterisk>*</RedAsterisk> Date of Birth
                                        </span>
                                    }
                                    value={dateofbirth}
                                    onChange={(newValue) => setdateofbirth(newValue)} />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Autocomplete
                                options={provinces1}
                                getOptionLabel={(option) => option}
                                renderInput={(params) => <TextField {...params} label={
                                    <span>
                                        <RedAsterisk>*</RedAsterisk> Province of Birth
                                    </span>
                                } />}
                                onChange={handleProvinceChange1}
                                value={selectedProvince1}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Autocomplete
                                options={municipalities1}
                                getOptionLabel={(option) => option}
                                onChange={(event, value) => {
                                    setSelectedMunicipality1(value);
                                }}
                                renderInput={(params) => <TextField {...params} label={
                                    <span>
                                        <RedAsterisk>*</RedAsterisk> City of Birth
                                    </span>
                                } />}
                                disabled={!selectedProvince1}
                                value={selectedMunicipality1}
                            />
                        </Grid>
                    </Grid>

                    <SectionHeader
                        step={2}
                        title="Contact & Address"
                        description="How to reach the employee and where they live"
                    />
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label='Email Address'
                                placeholder='Enter Email'
                                name='email'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label={
                                    <span>
                                        <RedAsterisk>*</RedAsterisk> Mobile Number
                                    </span>
                                }
                                placeholder='Enter Mobile Number'
                                name='mobile'
                                value={number}
                                onChange={handleMobileNumberChange}
                                inputProps={{ maxLength: 10 }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">+63</InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Autocomplete
                                options={regions}
                                getOptionLabel={(option) => option.region_name}
                                onChange={handleRegionChange}
                                renderInput={(params) => <TextField {...params} label={
                                    <span>
                                        <RedAsterisk>*</RedAsterisk> Region
                                    </span>
                                } />}
                                value={selectedRegion}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Autocomplete
                                options={provinces}
                                getOptionLabel={(option) => option}
                                onChange={handleProvinceChange}
                                renderInput={(params) => <TextField {...params} label={
                                    <span>
                                        <RedAsterisk>*</RedAsterisk> Province
                                    </span>
                                } />}
                                disabled={!selectedRegion}
                                value={selectedProvince}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Autocomplete
                                options={municipalities}
                                getOptionLabel={(option) => option}
                                onChange={handleMunicipalityChange}
                                renderInput={(params) => <TextField {...params} label={
                                    <span>
                                        <RedAsterisk>*</RedAsterisk> Municipality
                                    </span>
                                } />}
                                disabled={!selectedProvince}
                                value={selectedMunicipality}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Autocomplete
                                options={barangays}
                                getOptionLabel={(option) => option}
                                onChange={(event, value) => setSelectedBarangay(value)}
                                renderInput={(params) => <TextField {...params} label={
                                    <span>
                                        <RedAsterisk>*</RedAsterisk> Barangay
                                    </span>
                                } />}
                                disabled={!selectedMunicipality}
                                value={selectedBarangay}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label={
                                    <span>
                                        <RedAsterisk>*</RedAsterisk> Street Address
                                    </span>
                                }
                                placeholder='House No./Street'
                                name='StreetAddress'
                                value={streetadd}
                                onChange={(e) => setStreetadd(e.target.value)}
                            />
                        </Grid>
                    </Grid>

                    <SectionHeader
                        step={3}
                        title="Education & Work Experience"
                        description="Educational attainment and previous employment"
                    />
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Autocomplete
                                options={EduBg}
                                onChange={handleSelectEducBg}
                                renderInput={(params) => <TextField {...params} label='Add education level' />}
                            />
                        </Grid>
                        {input.map((item, index) => (
                            <Grid item xs={12} key={index}>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            fullWidth
                                            label={item.label}
                                            placeholder={item.placeholder}
                                            value={item.institutionName}
                                            onChange={(event) => handleInputChange(index, 'institutionName', event.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <TextField
                                            fullWidth
                                            label={item.secondLabel}
                                            placeholder={item.placeholder}
                                            value={item.degree}
                                            onChange={(event) => handleInputChange(index, 'degree', event.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <TextField
                                            fullWidth
                                            label="Year"
                                            placeholder="e.g. 2012-2016"
                                            value={item.year}
                                            onChange={(event) => handleInputChange(index, 'year', event.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={2}>
                                        <Button
                                            fullWidth
                                            variant='outlined'
                                            color='error'
                                            onClick={() => handleRemoveEducBg(index)}
                                        >
                                            Remove
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Grid>
                        ))}
                        {input1.map((item, index1) => (
                            <Grid item xs={12} key={index1}>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            fullWidth
                                            label='Company Name'
                                            placeholder='e.g. Hood Land Inc.'
                                            value={item.company_name}
                                            onChange={(event) => handleInputChange1(index1, 'company_name', event.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <TextField
                                            fullWidth
                                            label='Position'
                                            placeholder='e.g. Manager'
                                            value={item.position}
                                            onChange={(event) => handleInputChange1(index1, 'position', event.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <TextField
                                            fullWidth
                                            label='Year'
                                            placeholder='e.g. 2012-2016'
                                            value={item.year}
                                            onChange={(event) => handleInputChange1(index1, 'year', event.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={2}>
                                        <Button
                                            fullWidth
                                            variant='outlined'
                                            color='error'
                                            onClick={() => handleRemoveWorkExp(index1)}
                                        >
                                            Remove
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Grid>
                        ))}
                        <Grid item xs={12}>
                            <Button
                                variant='outlined'
                                startIcon={<AddIcon />}
                                onClick={handleAddWorkExp}
                            >
                                Add work experience
                            </Button>
                        </Grid>
                    </Grid>

                    <SectionHeader
                        step={4}
                        title="Employment Details"
                        description="Role, compensation rate, and department assignment"
                    />
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Autocomplete
                                options={status}
                                getOptionLabel={(option) => option.emp_status_name || ''}
                                value={selectedStatus}
                                renderInput={(params) => <TextField {...params} label={
                                    <span>
                                        <RedAsterisk>*</RedAsterisk> Status
                                    </span>
                                } />}
                                onChange={(event, value) => {
                                    setSelectedStatus(value);
                                    if (!value) {
                                        setSelectedStatus(null);
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Autocomplete
                                options={employment}
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
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Autocomplete
                                options={ratetypevaluepos}
                                value={selectedPosition}
                                getOptionLabel={(option) => option.position || ''}
                                renderInput={(params) => <TextField {...params} label={
                                    <span>
                                        <RedAsterisk>*</RedAsterisk> Position
                                    </span>
                                } />}
                                onChange={(event, value) => {
                                    setSelectedPosition(value);
                                    if (!value) {
                                        setSelectedPosition(null);
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Autocomplete
                                value={selectedRateType}
                                options={ratetype}
                                getOptionLabel={(option) => option.rt_name || ""}
                                renderInput={(params) => <TextField {...params} label={
                                    <span>
                                        <RedAsterisk>*</RedAsterisk> Rate Type
                                    </span>
                                } />}
                                onChange={handleRateTypeChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Autocomplete
                                options={filteredRateValues}
                                getOptionLabel={(option) =>
                                    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(option.pos_rt_val)
                                }
                                renderInput={(params) => <TextField {...params} label={
                                    <span>
                                        <RedAsterisk>*</RedAsterisk> Rate Value
                                    </span>
                                } />}
                                disabled={!selectedRateType}
                                onChange={handleRateValueChange}
                                value={selectedRateValue}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Autocomplete
                                options={department}
                                value={selectedDepartment}
                                getOptionLabel={(option) => option.dept_name || ''}
                                onChange={(event, value) => {
                                    setSelectedDepartment(value);
                                    if (!value) {
                                        setSelectedDepartment(null);
                                    }
                                }}
                                renderInput={(params) => <TextField {...params} label={
                                    <span>
                                        <RedAsterisk>*</RedAsterisk> Department
                                    </span>
                                } />}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    sx={{ width: '100%' }}
                                    label={
                                        <span>
                                            <RedAsterisk>*</RedAsterisk> Date of Hired
                                        </span>
                                    }
                                    value={datestart}
                                    onChange={(newValue) => setdatestart(newValue)}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    sx={{ width: '100%' }}
                                    label={
                                        <span>
                                            {isDateEndEnabled ? <RedAsterisk>*</RedAsterisk> : null} Date of End
                                        </span>
                                    }
                                    value={dateend}
                                    onChange={(newValue) => setdateend(newValue)}
                                    disabled={!isDateEndEnabled}
                                />
                            </LocalizationProvider>
                        </Grid>
                    </Grid>

                    <SectionHeader
                        step={5}
                        title="Government Numbers"
                        description="Statutory identification numbers for contributions and tax"
                    />
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label={
                                    <span>
                                        <RedAsterisk>*</RedAsterisk> Taxpayer Identification Number
                                    </span>
                                }
                                placeholder='000-000-000-000'
                                name='tin'
                                value={tin}
                                onChange={handleTINChange}
                                inputProps={{ maxLength: 15 }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label={
                                    <span>
                                        <RedAsterisk>*</RedAsterisk> Social Security System
                                    </span>
                                }
                                placeholder='00-0000000-0'
                                name='sss'
                                value={sss}
                                onChange={handleSSSChange}
                                inputProps={{ maxLength: 12 }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label={
                                    <span>
                                        <RedAsterisk>*</RedAsterisk> PhilHealth
                                    </span>
                                }
                                placeholder='00-000000000-0'
                                name='philhealth'
                                value={philHealth}
                                onChange={handlePhilHealthChange}
                                inputProps={{ maxLength: 15 }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label={
                                    <span>
                                        <RedAsterisk>*</RedAsterisk> Home Development Mutual Fund
                                    </span>
                                }
                                placeholder='0000-0000-0000'
                                name='hdmf'
                                value={hdmf}
                                onChange={handleHdmfChange}
                                inputProps={{ maxLength: 15 }}
                            />
                        </Grid>
                    </Grid>

                    <SectionHeader
                        step={6}
                        title="De Minimis Benefits"
                        description="Monthly non-taxable allowances"
                    />
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="Rice Subsidy"
                                value={values.riceSubsidy}
                                onChange={(e) => handleChange2('riceSubsidy', e.target.value)}
                                onFocus={() => handleFocus('riceSubsidy')}
                                onBlur={() => handleBlur('riceSubsidy')}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="Uniform or Clothing Allowance"
                                value={values.clothingAllowance}
                                onChange={(e) => handleChange2('clothingAllowance', e.target.value)}
                                onFocus={() => handleFocus('clothingAllowance')}
                                onBlur={() => handleBlur('clothingAllowance')}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="Laundry Allowance"
                                value={values.laundryAllowance}
                                onChange={(e) => handleChange2('laundryAllowance', e.target.value)}
                                onFocus={() => handleFocus('laundryAllowance')}
                                onBlur={() => handleBlur('laundryAllowance')}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="Medical Cash Allowance"
                                value={values.medicalAllowance}
                                onChange={(e) => handleChange2('medicalAllowance', e.target.value)}
                                onFocus={() => handleFocus('medicalAllowance')}
                                onBlur={() => handleBlur('medicalAllowance')}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Autocomplete
                                options={allowstatus}
                                getOptionLabel={(option) => option.emp_status_name || ''}
                                value={selectedAllowStatus}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Status"
                                    />
                                )}
                                onChange={(event, value) => {
                                    setSelectedAllowStatus(value);
                                    if (!value) {
                                        setSelectedAllowStatus(null);
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    sx={{ width: '100%' }}
                                    label="Date Activate"
                                    value={dateact}
                                    disabled={!selectedAllowStatus || selectedAllowStatus.emp_status_name === 'Active'}
                                    onChange={(newValue) => setdateact(newValue)}
                                />
                            </LocalizationProvider>
                        </Grid>
                    </Grid>

                    <SectionHeader
                        step={7}
                        title="Additional Benefits or Allowances"
                        description="Extra recurring benefits specific to this employee"
                    />
                    <Grid container spacing={2}>
                        {input2.map((item, index1) => (
                            <Grid item xs={12} key={index1}>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            fullWidth
                                            label="Allowance or Benefits Names"
                                            placeholder="e.g. Transport Allowance"
                                            value={item.name}
                                            onChange={(e) => handleInputChange3(index1, 'name', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <TextField
                                            fullWidth
                                            label="Value"
                                            placeholder="e.g. 1,000.00"
                                            value={item.value}
                                            onChange={(e) => handleInputChange3(index1, 'value', e.target.value)}
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <Autocomplete
                                            value={item.allowanceType}
                                            onChange={(event, newValue) => handleInputChange3(index1, 'allowanceType', newValue)}
                                            options={['Monthly', 'Annually']}
                                            renderInput={(params) => (
                                                <TextField {...params} label="Allowance Type" />
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={2}>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            color="error"
                                            onClick={() => handleRemoveBenefitsAllowance(index1)}
                                        >
                                            Remove
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Grid>
                        ))}
                        <Grid item xs={12}>
                            <Button
                                variant="outlined"
                                startIcon={<AddIcon />}
                                onClick={handleAddBenefitsAllowance}
                            >
                                Add benefits or allowance
                            </Button>
                        </Grid>
                    </Grid>
                </Box>

                {/* Sticky footer */}
                <Box
                    sx={{
                        px: 3,
                        py: 2,
                        borderTop: 1,
                        borderColor: 'divider',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 1.5,
                        flexShrink: 0,
                        bgcolor: 'background.paper',
                    }}
                >
                    <Button color='primary' variant='outlined' onClick={resetForm}>
                        Reset
                    </Button>
                    <Button color='primary' variant='contained' onClick={handleSubmit}>
                        Save Employee
                    </Button>
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
                    autoHideDuration={3000}
                    onClose={() => setSnackbarOpen(false)}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                    <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
                        {snackbarMessage}
                    </Alert>
                </Snackbar>
                <Snackbar
                    open={snackbarOpen1}
                    autoHideDuration={3000}
                    onClose={() => setSnackbarOpen1(false)}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                    <Alert onClose={() => setSnackbarOpen1(false)} severity="success" sx={{ width: '100%' }}>
                        {snackbarMessage1}
                    </Alert>
                </Snackbar>
            </Box>
        </Box>
    </Modal>
  )
}
