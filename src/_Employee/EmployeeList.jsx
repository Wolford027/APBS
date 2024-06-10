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
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import ModalClose from '@mui/joy/ModalClose';
import Icon from '@mui/material/Icon';
import style from '../Components/style.css'

const drawerWidth = 240;

export default function EmployeeList() {
  const [openModalAddEmp, setOpenModalAddEmp] = useState(false);
  const [addemp, setAddEmp] = useState([]);

  const [openModalAddEmp1, setOpenModalAddEmp1] = useState(false);
  const [addemp1, setAddEmp1] = useState([]);

  const [openModalViewEmp, setOpenModalViewEmp] = useState(false);
  const [viewemp, setViewemp] = useState([]);

  useEffect(() => {
    getEmp();
  }, []);

  //Style
  const marginstyle = { margin: 8};
  const marginstyle1 = { marginbutton: 5};
  const buttonstyle = { borderRadius: 5, justifyContent: 'left' , margin: 5 };
  const martop = {marginTop: 5}

  const navigate = useNavigate(); // Initialize useNavigate hook
  const [inputs, setInputs] = React.useState({});
  const [error, setError] = React.useState(null);

  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setInputs(values => ({...values, [name]: value}));
  }


  function getEmp() {
    axios.get('http://localhost/Another1/APBS/api/emplist/').then(function (response) {
      console.log(response.data);
      setViewemp(response.data);
    });
  }
  //Add Employee information
  const handleOpenModalAddEmp = () => {
    setOpenModalAddEmp(true);
  };

  const handleCloseModalAddEmp = () => {
    setOpenModalAddEmp(false);
  };

  const handleOpenModalAddEmp1 = () => {
    setOpenModalAddEmp1(true);
  };

  const handleCloseModalAddEmp1 = () => {
    setOpenModalAddEmp1(false);
  };

   //View Employee information
   const handleOpenModalViewEmp = () => {
    setOpenModalViewEmp(true);
  };

  const handleCloseModalViewEmp = () => {
    setOpenModalViewEmp(false);
  };


  const [value1, setValue1] = useState(null);

  const CivilStatus = [
    {label: 'Single'},{label: 'Married'}
  ];
  const Sex = [
    {label: 'Male'},{label: 'Female'}
  ];
  

  const handleArchive = (id, is_archived) => {
    axios.put('http://localhost/Another1/APBS/api/emplist/', { id: id, is_archived: is_archived })
      .then(response => {
        console.log(response.data);
        if (response.data.status === 1) {
          getEmp(); // Refresh the employee list after updating status
        } else {
          alert('Failed to update employee status');
        }
      })
      .catch(error => {
        console.error('There was an error updating the employee status!', error);
      });
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
            <SearchBar />
          </Toolbar>
          <AddCircleIcon color='primary' fontSize='large' style={{cursor: 'pointer', position: 'absolute', top: 550 , right:10}}  onClick={handleOpenModalAddEmp}   />
        </AppBar>

        <Table hoverRow sx={{ marginTop: 10, marginLeft: -12 }} borderAxis='both'>
          <thead>
            <tr>
              <th style={{ width: '10%' }}>Employee Id</th>
              <th style={{ width: '30%' }}>Employee Name</th>
              <th style={{ width: '10%' }}>Employee Position</th>
              <th style={{ width: '10%' }}>Mobile Number</th>
              <th style={{ width: '10%' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {viewemp.map((emp, key) =>
              <tr key={key}>
                <td style={{ cursor: 'pointer' }} onClick={handleOpenModalViewEmp}>{emp.id}</td>
                <td style={{ cursor: 'pointer' }} onClick={handleOpenModalViewEmp}>{emp.empName}</td>
                <td style={{ cursor: 'pointer' }} onClick={handleOpenModalViewEmp}>{emp.position}</td>
                <td style={{ cursor: 'pointer' }} onClick={handleOpenModalViewEmp}>{emp.mobilenum}</td>
                <td>
                  <Button variant='contained' onClick={() => handleArchive(emp.id, !emp.is_archived)} style={{fontSize: 12, fontWeight: 'bold'}}>
                    {emp.is_archived ? 'Unarchive' : 'Archive'}
                  </Button>
                </td>
              </tr>
            )}
          </tbody>
        </Table>


        <Modal //View Employee
          open={openModalViewEmp}
          onClose={handleCloseModalViewEmp}
          closeAfterTransition
        >
          <Box 
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100vh',
              p: 2,
            }}
          >
            <Box className='modal-scroll'
              sx={{
                backgroundColor: 'white',
                padding: 4,
                width: { xs: '80%', sm: '60%', md: '50%' },
                height: { xs: '80%', sm: '60%', md: '70%'},
                boxShadow: 24,
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            ><ModalClose onClick={handleCloseModalViewEmp} />
              <Typography variant="h4" sx={{ marginBottom: 2 }}>
                Employee Information
              </Typography>
              <Box sx={{ marginTop: 2 }}>
              

              <div className='rowC'  style={{ marginBottom: 20 }} >
                <Typography variant="h5" component="h2"  style= {{display: 'flex', justifyContent: 'flex-start'}}>
                Employee Personal Information
              </Typography>

              <div style= {{display: 'flex', justifyContent: 'flex-end' , marginLeft:260}} >
              <Button variant='contained' style={{ marginRight: 5, width: '10%', fontSize: 12, fontWeight: 'bold' }} >Edit</Button>
              </div>
              </div>

              <div>
                
                <TextField id="outlined-read-only-input" label="Surname" defaultValue="Surname" InputProps={{ readOnly: true,}} style={marginstyle}  sx={{ width: '25%'  }} />
                <TextField id="outlined-read-only-input" label="First Name" defaultValue="First Name" InputProps={{ readOnly: true,}} style={marginstyle}  sx={{ width: '27%'  }} />
                <TextField id="outlined-read-only-input" label="Middle Name" defaultValue="Middle Name" InputProps={{ readOnly: true,}} style={marginstyle}  sx={{ width: '25%'  }} />
                <TextField id="outlined-read-only-input" label="Suffix" defaultValue="Suffix" InputProps={{ readOnly: true,}} style={marginstyle}  sx={{ width: '14%'  }} />
                
                <div className='rowC'>
                  <Autocomplete style= {marginstyle}
                      disablePortal
                      id="readOnly"
                      readOnly
                      options={CivilStatus}
                    sx={{ width: '48%' }}
                    renderInput={(params) => <TextField {...params} label="Civil Status" />} 
                  />
                   <Autocomplete style={marginstyle}
                      disablePortal
                      id="readOnly"
                      readOnly
                      options={Sex}
                    sx={{ width: '47%'  }}
                   renderInput={(params) => <TextField {...params} label="Sex" />} 
                   />
                </div>

                <div className='rowC'>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                   <DatePicker style={marginstyle}
                     label="Date of Birth"
                     readOnly={true} 
                     value={value1}
                     onChange={(newValue) => setValue1(newValue)}
                     sx={{ width: '33%' , marginTop: 1 , marginLeft: 1 }}
                   />
                   </LocalizationProvider>

                  <Autocomplete style= {marginstyle}
                      disablePortal
                      id="readOnly"
                      readOnly
                      options={CivilStatus}
                    sx={{ width: '31%' }}
                    renderInput={(params) => <TextField {...params} label="City of Birth" />} 
                  />
                   <Autocomplete style={marginstyle}
                      disablePortal
                      id="readOnly"
                      readOnly
                      options={CivilStatus}
                    sx={{ width: '30%'  }}
                   renderInput={(params) => <TextField {...params} label="Province of Birth" />} 
                   />
                </div>

                <Typography variant="h5" component="h2" sx={{ marginBottom: 0 }}>
                  Contact Information
                </Typography>
                <TextField id="outlined-read-only-input" label="Email Address" defaultValue="Email Address" InputProps={{ readOnly: true,}} style={marginstyle}  sx={{ width: '48%'  }} />
                <TextField id="outlined-read-only-input" label="Mobile Number" defaultValue="Mobile Number" InputProps={{ readOnly: true,}} style={marginstyle}  sx={{ width: '47%'  }} />

                <TextField id="outlined-read-only-input" label="Street Address" defaultValue="Street Address" InputProps={{ readOnly: true,}} style={marginstyle}  sx={{ width: '97%'  }} />

                <div className='rowC'>
                  <Autocomplete style= {marginstyle}
                      disablePortal
                      id="readOnly"
                      readOnly
                      options={CivilStatus}
                    sx={{ width: '32%' }}
                    renderInput={(params) => <TextField {...params} label="City" />} 
                  />
                   <Autocomplete style={marginstyle}
                      disablePortal
                      id="readOnly"
                      readOnly
                      options={CivilStatus}
                    sx={{ width: '31%'  }}
                   renderInput={(params) => <TextField {...params} label="Province" />} 
                   />
                   <TextField id="outlined-read-only-input" label="Postal Code" defaultValue="Postal Code" InputProps={{ readOnly: true,}} style={marginstyle}  sx={{ width: '30%'  }} />
                </div>

              <Typography variant="h5" component="h2" sx={{ marginBottom: 0 }}>
                Employee Educational Attainment & Work Expirience
              </Typography >

              <TextField id="outlined-read-only-input" label="Name of Highschool" defaultValue="Name of Highschool" InputProps={{ readOnly: true,}} style={marginstyle}  sx={{ width: '43%'  }} />
              <TextField id="outlined-read-only-input" label="Strand" defaultValue="Strand" InputProps={{ readOnly: true,}} style={marginstyle}  sx={{ width: '30%'  }} />
              <TextField id="outlined-read-only-input" label="Year Graduated" defaultValue="Year Graduated" InputProps={{ readOnly: true,}} style={marginstyle}  sx={{ width: '20%'  }} />

              <TextField id="outlined-read-only-input" label="Name of University or College" defaultValue="Name of University or College" InputProps={{ readOnly: true,}} style={marginstyle}  sx={{ width: '43%'  }} />
              <TextField id="outlined-read-only-input" label="Course" defaultValue="Course" InputProps={{ readOnly: true,}} style={marginstyle}  sx={{ width: '30%'  }} />
              <TextField id="outlined-read-only-input" label="Year Graduated" defaultValue="Year Graduated" InputProps={{ readOnly: true,}} style={marginstyle}  sx={{ width: '20%'  }} />

              <TextField id="outlined-read-only-input" label="Name Vocational School" defaultValue="Name Vocational School" InputProps={{ readOnly: true,}} style={marginstyle}  sx={{ width: '43%'  }} />
              <TextField id="outlined-read-only-input" label="Subject" defaultValue="Subject" InputProps={{ readOnly: true,}} style={marginstyle}  sx={{ width: '30%'  }} />
              <TextField id="outlined-read-only-input" label="Year Graduated" defaultValue="Year Graduated" InputProps={{ readOnly: true,}} style={marginstyle}  sx={{ width: '20%'  }} />

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
                  Employee Goverment Information
              </Typography>

              <TextField id="outlined-read-only-input" label="Taxpayer Identification Number" defaultValue="Taxpayer Identification Number" InputProps={{ readOnly: true,}} style={marginstyle}  sx={{ width: '48%'  }} />
              <TextField id="outlined-read-only-input" label="Social Security System" defaultValue="Social Security System" InputProps={{ readOnly: true,}} style={marginstyle}  sx={{ width: '47%'  }} />
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
          <Box 
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100vh',
              p: 2,
            }}
          >
            <Box className='modal-scroll'
              sx={{
                backgroundColor: 'white',
                padding: 4,
                width: { xs: '80%', sm: '60%', md: '50%' },
                height: { xs: '80%', sm: '60%', md: '70%'},
                boxShadow: 24,
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            ><ModalClose onClick={handleCloseModalAddEmp} />
              <Typography variant="h4" sx={{ marginBottom: 2 }}>
                Add Employee Information
              </Typography>
              <Box sx={{ marginTop: 2 }}>
              <Typography variant="h5" component="h2" sx={{ marginBottom: 0 }}>
                Employee Personal Information
              </Typography>

              <div  >
                
              <TextField label="Surname" placeholder="Enter Surname" name='Surname' style={marginstyle}  onChange={handleChange}  sx={{ width: '25%'  }} />
                <TextField label="First Name" placeholder="Enter First Name" name='First Name' style={marginstyle}  onChange={handleChange}  sx={{ width: '27%'  }} />
                <TextField label="Middle Name" placeholder="Enter Middle Name" name='Middle Name' style={marginstyle}  onChange={handleChange}  sx={{ width: '25%'  }} />
                <TextField label="Suffix" placeholder="Enter Suffix" name='Suffix' style={marginstyle}  onChange={handleChange}  sx={{ width: '14%'  }} />
                
                <div className='rowC'>
                  <Autocomplete style= {marginstyle}
                      disablePortal
                      id=""
                      options={CivilStatus}
                    sx={{ width: '48%' }}
                    renderInput={(params) => <TextField {...params} label="Civil Status" />} 
                  />
                   <Autocomplete style={marginstyle}
                      disablePortal
                      id=""
                      options={Sex}
                    sx={{ width: '47%'  }}
                   renderInput={(params) => <TextField {...params} label="Sex" />} 
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

                  <Autocomplete style= {marginstyle}
                      disablePortal
                      id="City"
                      options={CivilStatus}
                    sx={{ width: '31%' }}
                    renderInput={(params) => <TextField {...params} label="City of Birth" />} 
                  />
                   <Autocomplete style={marginstyle}
                      disablePortal
                      id="Province"
                      options={CivilStatus}
                    sx={{ width: '30%'  }}
                   renderInput={(params) => <TextField {...params} label="Province of Birth" />} 
                   />
                </div>

                <Typography variant="h5" component="h2" sx={{ marginBottom: 0 }}>
                  Contact Information
                </Typography>

                <TextField label="Email Address" placeholder="Enter Email Address" name='Email Address' style={marginstyle} onChange={handleChange} sx={{ width: '48%'  }} />
                <TextField label="Mobile Number" placeholder="Enter Mobile Number" name='Mobile Number' style={marginstyle} onChange={handleChange} sx={{ width: '47%'  }} />

                <TextField label="Street Address" placeholder="House number/Street" name='Street Address' style={marginstyle} onChange={handleChange} sx={{ width: '97%'  }} />
                <div className='rowC'>
                  <Autocomplete style= {marginstyle}
                      disablePortal
                      id="civil-status"
                      options={CivilStatus}
                    sx={{ width: '32%' }}
                    renderInput={(params) => <TextField {...params} label="City" />} 
                  />
                   <Autocomplete style={marginstyle}
                      disablePortal
                      id="sex"
                      options={CivilStatus}
                    sx={{ width: '31%'  }}
                   renderInput={(params) => <TextField {...params} label="Province" />} 
                   />
                   <TextField label="Postal Code" placeholder="Postal Code" name='Postal Code' style={marginstyle} onChange={handleChange}  sx={{ width: '30%' }} />
                </div>

                <Typography variant="h5" component="h2" sx={{ marginBottom: 0 }}>
                Employee Educational Attainment & Work Expirience
              </Typography >
              
                <TextField label="Name of Highschool" placeholder="Enter Highschool" name='Highschool' style={marginstyle}  onChange={handleChange}  sx={{ width: '43%'  }} />
                <TextField label="Strand" placeholder="Enter Strand" name='Strand' style={marginstyle}  onChange={handleChange}  sx={{ width: '30%'  }} />
                <TextField label="Year Graduated" placeholder="Enter Year Graduated" name='Year Graduated' style={marginstyle}  onChange={handleChange}  sx={{ width: '20%'  }} />

                <TextField label="Name of University or College" placeholder="Name of University or College" name='University or College' style={marginstyle}  onChange={handleChange}  sx={{ width: '43%'  }} />
                <TextField label="Course" placeholder="Enter Course" name='Course' style={marginstyle}  onChange={handleChange}  sx={{ width: '30%'  }} />
                <TextField label="Year Graduated" placeholder="Enter Year Graduated" name='Year Graduated' style={marginstyle}  onChange={handleChange}  sx={{ width: '20%'  }} />

                <TextField label="Name of University or College" placeholder="Name of University or College" name='University or College' style={marginstyle}  onChange={handleChange}  sx={{ width: '43%'  }} />
                <TextField label="Course" placeholder="Enter Course" name='Course' style={marginstyle}  onChange={handleChange}  sx={{ width: '30%'  }} />
                <TextField label="Year Graduated" placeholder="Enter Year Graduated" name='Year Graduated' style={marginstyle}  onChange={handleChange}  sx={{ width: '20%'  }} />
                   

                    <Typography variant="h5" component="h2" sx={{ marginBottom: 0 }}>

                  Employment Information

                </Typography>
                <div className='rowC'>
                <Autocomplete style= {marginstyle}
                      disablePortal
                      id=""
                      options={CivilStatus}
                    sx={{ width: '48%' }}
                    renderInput={(params) => <TextField {...params} label="Position" />} 
                  />
                  <Autocomplete style= {marginstyle}
                      disablePortal
                      id=""
                      options={CivilStatus}
                    sx={{ width: '47%' }}
                    renderInput={(params) => <TextField {...params} label="Rate type" />} 
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
                  Employee Goverment Information
              </Typography>

                <TextField label="Taxpayer Identification Number" placeholder="Enter TIN" name='TIN' style={marginstyle}  onChange={handleChange}  sx={{ width: '48%'  }} />
                <TextField label="Social Security System" placeholder="Enter Social Security System Number" name='SSS' style={marginstyle}  onChange={handleChange}  sx={{ width: '47%'  }} />
                <TextField label="PhilHealth" placeholder="Enter PhilHealth Number" name='PhilHealth' style={marginstyle}  onChange={handleChange}  sx={{ width: '48%'  }} />
                <TextField label="Home Development Mutual Fund" placeholder="Enter Home Development Mutual Fund Number" name='HMDF' style={marginstyle}  onChange={handleChange}  sx={{ width: '47%'  }} />
 
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
    </>
  );
}
