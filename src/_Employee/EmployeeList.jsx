import { useEffect, useState } from 'react'
import * as React from 'react';
import SideNav from '../Components/SideNav'
import Box from '@mui/material/Box'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { Button, Modal,TextField , Autocomplete } from '@mui/material'
import axios from 'axios'
import Table from '@mui/joy/Table'
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SearchBar from '../Components/SearchBar'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { useDialogs } from '@toolpad/core';
import regionsData from '../_Regions/Region.json'
import Grid from '@mui/joy/Grid';
import style from '../Components/style.css'

const drawerWidth = 240;

export default function EmployeeList() {
  const [openModalAddEmp, setOpenModalAddEmp] = useState(false);
  const [openModalViewEmp, setOpenModalViewEmp] = useState(false);
  const [viewemp, setviewemp] = useState([]);
  const [selectedOption, setSelectedOption] = useState('')
  const [input, setInput] = useState([])
  const [secondLabel, setSecondLabel] = useState('Strand')
  const [selectedId, setSelectedId] = useState([]);
  const dialogs = useDialogs();
  const [province, setProvince] = useState('');

  const handleProvinceChange = (event, value) => {
    setProvince(value);
  };
  
  const filteredCities = province
    ? Object.keys(regionsData).reduce((acc, regionCode) => {
        const region = regionsData[regionCode];
        const provinceList = region.province_list;
        if (provinceList.hasOwnProperty(province)) {
          return [...acc, ...Object.keys(provinceList[province].municipality_list)];
        }
        return acc;
      }, [])
    : [];
  
//View Employee information (PRE WAG MO NA AYUSIN TO HAHAHA)
  const [emp_info, setemp_info] = useState({ 
    f_name: "" 
  });

//fetch data
useEffect(() => {
  fetchAlldata();
}, []);

const fetchAlldata = async () => {
  try {
    const res = await axios.get('http://localhost:8800/emp');
    console.log(res.data)
    setviewemp(res.data);
  } catch (err) {
    console.log(err);
  }
};


  const handleSelect = (event, newValue) => {
    if (newValue) {
      setSelectedOption(newValue)
      setInput([...input, newValue.label])
      if (newValue.id === 2 && newValue.label === 'College') {
        setSecondLabel('Course')
      } else {
        setSecondLabel('Strand')
      }
    }
  }

  const handleRemove = (index) => {
    const updatedInputs = input.filter((_,i) => i !== index)
    setInput(updatedInputs)
  }

   const handleOpenModalViewEmp = async (id) => {
    setSelectedId(id);
    try {
      const res = await axios.get(`http://localhost:8800/emp/${id}`);
      setemp_info({
        f_name: res.data[0].f_name,
        m_name: res.data[0].m_name,
        l_name: res.data[0].l_name,
        suffix: res.data[0].suffix,
        civil_status: res.data[0].civil_status,
        sex: res.data[0].sex,
        date_of_birth: res.data[0].date_of_birth,
        city_of_birth: res.data[0].city_of_birth,
        province_of_birth: res.data[0].province_of_birth,
        email: res.data[0].email,
        mobile_num: res.data[0].mobile_num, 
        street_add: res.data[0].street_add, 
        region: res.data[0].region, 
        city: res.data[0].city, 
        province: res.data[0].province, 
        barangay: res.data[0].barangay, 
        emp_pos: res.data[0].emp_pos, 
        emp_ratetype: res.data[0].emp_ratetype, 
        emp_rate: res.data[0].emp_rate, 
        emp_status: res.data[0].emp_status, 
        emp_datehired: res.data[0].emp_datehired, 
        emp_tin: res.data[0].emp_tin, 
        emp_sss: res.data[0].emp_sss, 
        emp_philhealth: res.data[0].emp_philhealth, 
        emp_hdmf: res.data[0].emp_hdmf, 
       
      });
      setOpenModalViewEmp(true);
    } catch (err) {
      console.log(err);
    }
  };

  const handleCloseModalViewEmp = () => {
    setOpenModalViewEmp(false);
  };

  //AUTO COMPLETE CIVIL STATUS LIST
  const [cs_list, setcs_list] = useState([])

  const cs_data ={
    options: cs_list,
    getOptionLabel: (options) => options.cs_name
  }
  const getcsdata = (data) => {
    console.log(data);
  }

  useEffect(()=>{
      fetch('http://localhost:8800/cs').then (resp =>{
        return resp.json();
      }).then(res=>{
        setcs_list(res)
      }).catch(e => {
        console.log(e.message);
      })
  }, [])

   //AUTO COMPLETE SEX LIST
   const [sex_list, setsex_list] = useState([])
 
   const sex_data ={
     options: sex_list,
     getOptionLabel: (options) => options.sex_name
   }
   const getsexdata = (data) => {
     console.log(data);
   }
 //
   useEffect(()=>{
       fetch('http://localhost:8800/sex').then (resp =>{
         return resp.json();
       }).then(res=>{
         setsex_list(res)
       }).catch(e => {
         console.log(e.message);
       })
   }, [])

   //AUTO COMPLETE RATE TYPE
      const [ratetype_list, setratetype_list] = useState([])
 
   const ratetype_data ={
     options: ratetype_list,
     getOptionLabel: (options) => options.rt_name
   }
   const getratetypedata = (data) => {
     console.log(data);
   }
 //
   useEffect(()=>{
       fetch('http://localhost:8800/ratetype').then (resp =>{
         return resp.json();
       }).then(res=>{
        setratetype_list(res)
       }).catch(e => {
         console.log(e.message);
       })
   }, [])

  //Style
  const marginstyle = { margin: 8};
  const buttonstyle = { borderRadius: 5, justifyContent: 'left' , margin: 5 };


  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setInput(values => ({...values, [name]: value}));
  }



  //Add Employee information
  const handleOpenModalAddEmp = () => {
    setOpenModalAddEmp(true);
  };

  const handleCloseModalAddEmp = () => {
    setOpenModalAddEmp(false);
  };

  const [value1, setValue1] = useState(null);

  const CivilStatus = [
    {label: 'Single'},{label: 'Married'}
  ];

  const educationBg = [
    {label: 'Senior Highschool', id: 1},
    {label: 'Highschool', id: 1},
    {label: 'College', id: 2},
    {label: 'Vocational', id: 2}
  ]


  const handleArchive = (id, is_archive) => {
    async function archiveEmployee() {
      const confirmed = await dialogs.confirm('Are you sure you want to Archive this employee?', {
        okText: 'Yes',
        cancelText: 'No',
      });
      if (confirmed) {
        try {
          const response = await axios.put(`http://localhost:8800/emp/${id}`, { id: id, is_archive: is_archive });
          console.log(response.data);
          if (response.data.status === 1) {
            fetchAlldata(); // Refresh the employee list after updating status
            setOpenModalViewEmp(false);
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
   
      <Box sx={{ display: "flex" }}>
        <SideNav />
        <AppBar
          position="fixed"
          sx={{ 
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            ml: { sm: `${drawerWidth}px` },
          }}
        >
          <Toolbar>
            <Typography variant="h6" noWrap component="div">
              Employee List
            </Typography>
            
          </Toolbar>
         
        </AppBar>
        <Box sx={{ flexGrow: 1, p: 3, mt: 7, ml: -11 }}>
        <Grid container spacing={0} direction="row" sx={{ flexGrow: 1, justifyContent: "space-between", alignItems: "center" }} >
            <Grid size={4} sx={{ marginLeft:-3 }}>
            <SearchBar  /> 
            </Grid>
            <Grid size={4}>
            <Button type='Submit' color="primary" variant="contained" sx={{ marginRight: 3, }} onClick={handleOpenModalAddEmp} > Add Employee</Button>
            </Grid>
          </Grid>
          
        <Table hoverRow sx={{}} borderAxis='both'>
          <thead>
            <tr>
              <th style={{ width: '10%' }}>Employee ID</th>
              <th style={{ width: '30%' }}>Employee Name</th>
              <th style={{ width: '10%' }}>Employee Position</th>
              <th style={{ width: '10%' }}>Mobile Number</th>
            </tr>
          </thead>
          <tbody>
          {viewemp.map((vm,i)=>(

          <tr key={i}>
            <td style={{ cursor: 'pointer' }} onClick={() => handleOpenModalViewEmp(vm.emp_id)}>{vm.emp_id}</td>
            <td style={{ cursor: 'pointer' }} onClick={() => handleOpenModalViewEmp(vm.emp_id)}>{vm.f_name + " " + vm.l_name}</td>
            <td style={{ cursor: 'pointer' }} onClick={() => handleOpenModalViewEmp(vm.emp_id)}>{vm.emp_position}</td>
            <td style={{ cursor: 'pointer' }} onClick={() => handleOpenModalViewEmp(vm.emp_id)}>{vm.mobile_num}</td>
          </tr>

          ))}
              
        
          </tbody>
        </Table>

        {/* View Employee */}
        <Modal open={openModalViewEmp} onClose={handleCloseModalViewEmp} closeAfterTransition>
          <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', p: 2}}>
            <Box className='modal-scroll' sx={{backgroundColor: 'white', padding: 4, width: { xs: '80%', sm: '60%', md: '50%' }, height: { xs: '80%', sm: '60%', md: '70%'}, boxShadow: 24, borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden', overflowY: 'scroll'}}>
              <Typography variant="h4" sx={{ marginBottom: 2 }}>Employee Information</Typography>
              
              <Box sx={{ marginTop: 2 }}>
                <div style={{ marginBottom: '1.25rem', display: 'flex', flexDirection: 'row' }} >
                  <Typography variant="h5" component="h2"  style= {{display: 'flex'}}>Employee Personal Information</Typography>
                  <div style={{display:'flex', justifyContent:'right', marginLeft:'15rem' }}>
                    <Button variant='contained' style={{ marginRight: 5, width: '10%', fontSize: '0.75rem', fontWeight: 'bold' }} >Edit</Button>
                    <Button variant='contained' style={{ marginRight: 5, width: '10%', fontSize: '0.75rem', fontWeight: 'bold' }} onClick={() => handleArchive(selectedId, true)} >Archive</Button>
                  </div>
                </div>

                <div className='rowC'>
                  <TextField id="outlined-read-only-input"  label="Surname" defaultValue="Surname" InputProps={{ readOnly: true,}} style={marginstyle}  value={emp_info.l_name} sx={{ width: '25%'  }}  />
                  <TextField id="outlined-read-only-input" label="First Name" defaultValue="First Name" InputProps={{ readOnly: true,}} style={marginstyle}  value={emp_info.f_name} sx={{ width: '27%'  }} />
                  <TextField id="outlined-read-only-input" label="Middle Name" defaultValue="Middle Name" InputProps={{ readOnly: true,}} style={marginstyle} value={emp_info.m_name}  sx={{ width: '25%'  }} />
                  <TextField id="outlined-read-only-input" label="Suffix" defaultValue="" InputProps={{ readOnly: true,}} style={marginstyle} value={emp_info.suffix}  sx={{ width: '14%'  }} />
                </div>
            
                <div className='rowC'>
                  <TextField id="outlined-read-only-input" label="Civil Status" defaultValue="" InputProps={{ readOnly: true,}} style={marginstyle}  value={emp_info.civil_status} sx={{ width: '48%'  }} />
                  <TextField id="outlined-read-only-input" label="Sex" defaultValue="" InputProps={{ readOnly: true,}} style={marginstyle} value={emp_info.sex}  sx={{ width: '47%'  }} />   
                </div>

                <div className='rowC'>
                  <TextField id="outlined-read-only-input" label="Date of Birth" defaultValue="" InputProps={{ readOnly: true,}} style={marginstyle}  value={emp_info.civil_status} sx={{ width: '32%'  }} />
                  <TextField id="outlined-read-only-input" label="City of Birth" defaultValue="" InputProps={{ readOnly: true,}} style={marginstyle} value={emp_info.city_of_birth}  sx={{ width: '31%'  }} />
                  <TextField id="outlined-read-only-input" label="Province of Birth" defaultValue="" InputProps={{ readOnly: true,}} style={marginstyle}  value={emp_info.province_of_birth} sx={{ width: '30%'  }} />
                </div>
                <Typography variant="h5" component="h2" sx={{ marginBottom: 0 }}>
                  Contact Information
                </Typography>
                <div className='rowC'>
                  <TextField id="outlined-read-only-input" label="Email Address" defaultValue="Email Address" InputProps={{ readOnly: true,}} value={emp_info.email} style={marginstyle}  sx={{ width: '48%'  }} />
                  <TextField id="outlined-read-only-input" label="Mobile Number" defaultValue="Mobile Number" InputProps={{ readOnly: true,}} value={emp_info.mobile_num} style={marginstyle}  sx={{ width: '47%'  }} />
                </div>
               
                <div className='rowC'>
                  <TextField id="outlined-read-only-input" label="Region" defaultValue="Region" InputProps={{ readOnly: true,}}  value={emp_info.region}style={marginstyle}  sx={{ width: '48%'  }} />
                  <TextField id="outlined-read-only-input" label="City" defaultValue="City" InputProps={{ readOnly: true,}} value={emp_info.city} style={marginstyle}  sx={{ width: '47%'  }} />
               </div>
                <div className='rowC'>
                   <TextField id="outlined-read-only-input" label="Municipality" defaultValue="Municipality" InputProps={{ readOnly: true,}}  value={emp_info.province}style={marginstyle}  sx={{ width: '48%'  }} />
                  <TextField id="outlined-read-only-input" label="Barangay" defaultValue="Barangay" InputProps={{ readOnly: true,}} value={emp_info.barangay} style={marginstyle}  sx={{ width: '47%'  }} />
                </div>
                 
                <TextField id="outlined-read-only-input" label="Street Address" defaultValue="Street Address" InputProps={{ readOnly: true,}}  value={emp_info.street_add} style={marginstyle}  sx={{ width: '97%'  }} />


              <Typography variant="h5" component="h2" sx={{ marginBottom: 0 }}>
                Employee Educational Attainment & Work Expirience
              </Typography >

              <div className='rowC'>
              <TextField id="outlined-read-only-input" label="Name of Highschool" defaultValue="Name of Highschool" InputProps={{ readOnly: true,}} style={marginstyle}  sx={{ width: '43%'  }} />
              <TextField id="outlined-read-only-input" label="Strand" defaultValue="Strand" InputProps={{ readOnly: true,}} style={marginstyle}  sx={{ width: '30%'  }} />
              <TextField id="outlined-read-only-input" label="Year Graduated" defaultValue="Year Graduated" InputProps={{ readOnly: true,}} style={marginstyle}  sx={{ width: '20%'  }} />
              </div>
              <div className='rowC'>
              <TextField id="outlined-read-only-input" label="Name of University or College" defaultValue="Name of University or College" InputProps={{ readOnly: true,}} style={marginstyle}  sx={{ width: '43%'  }} />
              <TextField id="outlined-read-only-input" label="Course" defaultValue="Course" InputProps={{ readOnly: true,}} style={marginstyle}  sx={{ width: '30%'  }} />
              <TextField id="outlined-read-only-input" label="Year Graduated" defaultValue="Year Graduated" InputProps={{ readOnly: true,}} style={marginstyle}  sx={{ width: '20%'  }} />
              </div>
              <div className='rowC'>

              <TextField id="outlined-read-only-input" label="Name Vocational School" defaultValue="Name Vocational School" InputProps={{ readOnly: true,}} style={marginstyle}  sx={{ width: '43%'  }} />
              <TextField id="outlined-read-only-input" label="Subject" defaultValue="Subject" InputProps={{ readOnly: true,}} style={marginstyle}  sx={{ width: '30%'  }} />
              <TextField id="outlined-read-only-input" label="Year Graduated" defaultValue="Year Graduated" InputProps={{ readOnly: true,}} style={marginstyle}  sx={{ width: '20%'  }} />

              </div>

              <Typography variant="h5" component="h2" sx={{ marginBottom: 0 }}>

                  Employment Information

                </Typography>

                <div className='rowC'>
                <Autocomplete style= {marginstyle}
                      disablePortal
                      id="readOnly"
                      readOnly
                      options={CivilStatus}
                    sx={{ width: '48%' }}
                    renderInput={(params) => <TextField {...params} label="Position" />} 
                  />
                  <Autocomplete style= {marginstyle}
                      disablePortal
                      id="readOnly"
                      readOnly
                      options={CivilStatus}
                    sx={{ width: '47%' }}
                    renderInput={(params) => <TextField {...params} label="Rate type" />} 
                  />
                  </div>
                  <div  className='rowC'>

                    <Autocomplete style= {marginstyle}
                      disablePortal
                      id="readOnly"
                      readOnly
                      options={CivilStatus}
                    sx={{ width: '33%' }}
                    renderInput={(params) => <TextField {...params} label="Rate" />} 
                  />

                  <Autocomplete style= {marginstyle}
                      disablePortal
                      id="readOnly"
                      readOnly
                      options={CivilStatus}
                    sx={{ width: '30%' }}
                    renderInput={(params) => <TextField {...params} label="Status" />} 
                  />

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                   <DatePicker style={marginstyle}
                     label="Date Hired"
                     readOnly={true} 
                     value={value1}
                     onChange={(newValue) => setValue1(newValue)}
                     sx={{ width: '30%' , marginTop: 1 , marginLeft: 1 }}
                   />
                   </LocalizationProvider>
                   
              </div>

              <Typography variant="h5" component="h2" sx={{ marginBottom: 0 }}>
                  Employee Goverment Numbers
              </Typography>
              <div className='rowC'>
              <TextField id="outlined-read-only-input" label="Taxpayer Identification Number" defaultValue="Taxpayer Identification Number" InputProps={{ readOnly: true,}} style={marginstyle}  sx={{ width: '48%'  }} />
              <TextField id="outlined-read-only-input" label="Social Security System" defaultValue="Social Security System" InputProps={{ readOnly: true,}} style={marginstyle}  sx={{ width: '47%'  }} />
              </div>
              <div className='rowC'>
              <TextField id="outlined-read-only-input" label="PhilHealth" defaultValue="PhilHealth" InputProps={{ readOnly: true,}} style={marginstyle}  sx={{ width: '48%'  }} />
              <TextField id="outlined-read-only-input" label="Home Development Mutual Fund" defaultValue="Home Development Mutual Fund" InputProps={{ readOnly: true,}} style={marginstyle}  sx={{ width: '47%'  }} />
         
              </div>
               
              </Box>
            </Box>
          </Box>
        </Modal>

        <Modal   //Add Employee 
          open={openModalAddEmp}
          onClose={handleCloseModalAddEmp}
          closeAfterTransition
        >
          <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', p: 2}}>
            <Box className='modal-scroll' sx={{ backgroundColor: 'white', padding: 4, width: { xs: '80%', sm: '60%', md: '50%' }, height: { xs: '80%', sm: '60%', md: '70%'}, boxShadow: 24, borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden', overflowY: 'scroll'}}>
              <Typography variant="h4" sx={{ marginBottom: 2 }}>
                Add Employee Information
              </Typography>
              <Box sx={{ marginTop: 2 }}>
                <Typography variant="h5" component="h2" sx={{ marginBottom: 0 }}>
                  Employee Personal Information
                </Typography>
              <div>
                <div className='rowC'>
                  <TextField label="Surname" placeholder="Enter Surname" name='Surname' style={marginstyle} sx={{ width: '25%'  }} />
                  <TextField label="First Name" placeholder="Enter First Name" name='First Name' style={marginstyle} sx={{ width: '27%'  }} />
                  <TextField label="Middle Name" placeholder="Enter Middle Name" name='Middle Name' style={marginstyle} sx={{ width: '25%'  }} />
                  <TextField label="Suffix" placeholder="Enter Suffix" name='Suffix' style={marginstyle} sx={{ width: '14%'  }} />
                </div>
             
                <div className='rowC'>
                  <Autocomplete style= {marginstyle}
                        {...cs_data}        //options={CivilStatus}
                    sx={{ width: '48%' }}
                    renderInput={(params) => (
                    <TextField {...params} label="Civil Status" ></TextField>
                  )} 
                    onChange={(event, value)=> getcsdata (value)} 

                  />
                   <Autocomplete style={marginstyle}
                          {...sex_data}        //options={CivilStatus}
                          sx={{ width: '47%' }}
                          renderInput={(params) => (
                          <TextField {...params} label="Sex" ></TextField>
                        )} 
                          onChange={(event, value)=> getsexdata (value)} 
      
                        />
                </div>

                <div className='rowC'>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                   <DatePicker style={marginstyle}
                     label="Date of Birth"
                     value={value1}
                     onChange={(newValue) => setValue1(newValue)}
                     sx={{ width: '33%' , marginTop: 1 , marginLeft: 1 }}
                   />
                   </LocalizationProvider>

                   <Autocomplete style={marginstyle}
                      disablePortal
                      id="Province"
                      options={Object.keys(regionsData).reduce((acc, regionCode) => {
                        const region = regionsData[regionCode];
                        return [...acc, ...Object.keys(region.province_list)];
                      }, [])}                    
                      sx={{ width: '30%'  }}
                      renderInput={(params) => <TextField {...params} label="Province of Birth" />} 
                      onChange={handleProvinceChange}
                   />
                  <Autocomplete style= {marginstyle}
                      disablePortal
                      id="City"
                      options={filteredCities}
                    sx={{ width: '31%' }}
                    renderInput={(params) => <TextField {...params} label="City of Birth" />} 
                  />
                </div>

                <Typography variant="h5" component="h2" sx={{ marginBottom: 0 }}>Contact Information</Typography>
                <div className='rowC'>
                  <TextField label="Email Address" placeholder="Enter Email Address" name='Email Address' style={marginstyle} onChange={handleChange} sx={{ width: '48%'  }} />
                  <TextField label="Mobile Number" placeholder="Enter Mobile Number" name='Mobile Number' style={marginstyle} onChange={handleChange} sx={{ width: '47%'  }} />
                </div>
                <div className='rowC'>
                  <Autocomplete style= {marginstyle}
                      disablePortal
                      id="civil-status"
                      options={CivilStatus}
                    sx={{ width: '48%' }}
                    renderInput={(params) => <TextField {...params} label="Region" />} 
                  />
                   <Autocomplete style={marginstyle}
                      disablePortal
                      id="sex"
                      options={CivilStatus}
                    sx={{ width: '47%'  }}
                   renderInput={(params) => <TextField {...params} label="City" />} 
                   />
                  </div>
                  <div className='rowC'>
                  <Autocomplete style= {marginstyle}
                      disablePortal
                      id="civil-status"
                      options={CivilStatus}
                    sx={{ width: '48%' }}
                    renderInput={(params) => <TextField {...params} label="Municipality" />} 
                  />
                   <Autocomplete style={marginstyle}
                      disablePortal
                      id="sex"
                      options={CivilStatus}
                    sx={{ width: '47%'  }}
                   renderInput={(params) => <TextField {...params} label="Barangay" />} 
                   />
                  </div>
                <TextField label="Street Address" placeholder="House number/Street" name='Street Address' style={marginstyle} onChange={handleChange} sx={{ width: '97%'  }} />
           

                <Typography variant="h5" component="h2" sx={{ marginBottom: 0 }}>Employee Educational Attainment & Work Expirience</Typography >
                <Autocomplete sx={{ width: '50%' }} options={educationBg} onChange={handleSelect} renderInput={(params) => <TextField {...params} label='Choose' />}/>
                {input.map((inputs, index) => (
                  <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                    <TextField key={index} placeholder={inputs} label={inputs} fullWidth />
                    {selectedOption === 'College' && (
                      <TextField label="Course" placeholder="Enter Course" fullWidth />
                    )}
                    <TextField label={secondLabel} placeholder={secondLabel} fullWidth />
                    <TextField label={'Year'} placeholder={'Year'} fullWidth />
                    <Button variant='contained' onClick={() => handleRemove(index)}>Remove</Button>
                  </Box>
                ))}

                <Typography variant="h5" component="h2" sx={{ marginBottom: 0 }}>Employment Information</Typography>
                <div className='rowC'>
                  <Autocomplete style={marginstyle}
                          {...ratetype_data}        //options={CivilStatus}
                          sx={{ width: '48%' }}
                          renderInput={(params) => (
                          <TextField {...params} label="Positon" ></TextField>
                        )} 
                          onChange={(event, value)=> getratetypedata (value)} 
      
                        />
                  <Autocomplete style={marginstyle}
                          {...ratetype_data}        //options={CivilStatus}
                          sx={{ width: '47%' }}
                          renderInput={(params) => (
                          <TextField {...params} label="Rate Type" ></TextField>
                        )} 
                          onChange={(event, value)=> getratetypedata (value)} 
                        />
                </div>

              <div className='rowC'>
              
                <Autocomplete style= {marginstyle}
                
                      disablePortal
                      id=""
                      options={CivilStatus}
                    sx={{ width: '33%' }}
                    renderInput={(params) => <TextField {...params} label="Rate" />} 
                  />
                  <Autocomplete style= {marginstyle}
                      disablePortal
                      id=""
                      options={CivilStatus}
                    sx={{ width: '30%' }}
                    renderInput={(params) => <TextField {...params} label="Status" />} 
                  />
                  
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                   <DatePicker style={marginstyle}
                     label="Date Hired"
                     value={value1}
                     onChange={(newValue) => setValue1(newValue)}
                     sx={{ width: '30%' , marginTop: 1 , marginLeft: 1 }}
                   />
                   </LocalizationProvider>
                   
              </div>

              <Typography variant="h5" component="h2" sx={{ marginBottom: 0 }}>
                  Employee Goverment Numbers
              </Typography>

              <div className='rowC'>
              <TextField label="Taxpayer Identification Number" placeholder="Enter TIN" name='TIN' style={marginstyle}  onChange={handleChange}  sx={{ width: '48%'  }} />
                <TextField label="Social Security System" placeholder="Enter Social Security System Number" name='SSS' style={marginstyle}  onChange={handleChange}  sx={{ width: '47%'  }} />
               
              </div>

              <div className='rowC'>
                <TextField label="PhilHealth" placeholder="Enter PhilHealth Number" name='PhilHealth' style={marginstyle}  onChange={handleChange}  sx={{ width: '48%'  }} />
                <TextField label="Home Development Mutual Fund" placeholder="Enter Home Development Mutual Fund Number" name='HMDF' style={marginstyle}  onChange={handleChange}  sx={{ width: '47%'  }} />
               </div>
                
              </div>

              <div style= {{display: 'flex', justifyContent: 'flex-end'}}>
                  <div onClick={handleOpenModalAddEmp} >
                  <Button type='Submit' color="primary" variant="contained" style={buttonstyle} onClick={handleCloseModalAddEmp} > Submit</Button>
                  </div>
                </div>

              </Box>
            </Box>
          </Box>
        </Modal>
      </Box>
      </Box>
    </>
  );
}