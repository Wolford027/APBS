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
  import SearchBar from '../Components/SearchBar'
  import { useDialogs } from '@toolpad/core';
  import regionsData from '../_Regions/Region.json'
  import Grid from '@mui/joy/Grid';
  import AddEmpModal from '../_Modals/AddEmpModal';
  import ViewEmpModal from '../_Modals/ViewEmpModal';

  const drawerWidth = 240;

  export default function EmployeeList() {
    const [openModalAddEmp, setOpenModalAddEmp] = useState(false);
    const [openModalViewEmp, setOpenModalViewEmp] = useState(false);
    const [viewemp, setviewemp] = useState([]);
    const [selectedId, setSelectedId] = useState([]);
    const [province, setProvince] = useState('');
    const [provinces, setProvinces] = useState('');
    const [region, setRegion] = useState('');
    const [Municipality, setMunicipality] = useState('');
    const [barangay, setBarangay] = useState('');

    const handleRegionChange = (event, value) => {
        setRegion(value);
        setProvinces(null);
        setMunicipality(null);
        setBarangay(null);
    };
  
    const filteredProvinces = region
    ? Object.keys(regionsData).reduce((acc, regionCode) => {
        const regions = regionsData[regionCode];
        if (regions.region_name === region) {
          return [...acc, ...Object.keys(regions.province_list)];
        }
        return acc;
      }, [])
    : [];
  
    const handleProvincesChange = (event, value) => {
      setProvinces(value);
      setMunicipality(null);
      setBarangay(null);
    };

    const handleProvinceChange = (event, value) => {
      setProvince(value);
      setMunicipality(null);
    };
  
    const filteredCities = provinces
    ? Object.keys(regionsData).reduce((acc, regionCode) => {
      const regions = regionsData[regionCode];
      const provincesList = regions.province_list;
      if (provincesList.hasOwnProperty(provinces)) {
        return [...acc, ...Object.keys(provincesList[provinces].municipality_list)];
      }
      return acc;
    }, [])
    : [];

    const filteredCityofBirth = province
    ? Object.keys(regionsData).reduce((acc, regionCode) => {
      const region = regionsData[regionCode];
      const provinceList = region.province_list;
      if (provinceList.hasOwnProperty(province)) {
        return [...acc, ...Object.keys(provinceList[province].municipality_list)];
      }
      return acc;
    }, [])
    : [];
  
    const handleCityChange = (event, value) => {
      setMunicipality(value);
      setBarangay(null);
    };
  
    const filteredBarangays = Municipality
    ? Object.keys(regionsData).reduce((acc, regionCode) => {
      const regions = regionsData[regionCode];
      const municipalityList = regions.municipality_list;
      console.log(municipalityList)
      if (municipalityList.hasOwnProperty(Municipality)) {
        return [...acc, ...Object.keys(municipalityList[Municipality].barangay_list)];
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
      setviewemp(res.data);
    } catch (err) {
      console.log(err);
    }
  };

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
          emp_religion: res.data[0].emp_religion,
          emp_citi: res.data[0].emp_citi,
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
          emp_id: res.data[0].emp_id, 
          emp_pos: res.data[0].emp_pos, 
          emp_ratetype: res.data[0].emp_ratetype, 
          emp_rate: res.data[0].emp_rate, 
          emp_status: res.data[0].emp_status, 
          emp_emptype: res.data[0].emp_emptype, 
          emp_dept: res.data[0].emp_dept, 
          emp_datehired: res.data[0].emp_datehired, 
          emp_dateend: res.data[0].emp_dateend, 
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
    //Add Employee information
    const handleOpenModalAddEmp = () => {
      setOpenModalAddEmp(true);
    };

    const handleCloseModalAddEmp = () => {
      setOpenModalAddEmp(false);
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
              <Typography variant="h6" noWrap component="div">Employee List</Typography>
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
          <ViewEmpModal onOpen={openModalViewEmp} onClose={handleCloseModalViewEmp} emp_Info={emp_info} selectedEmployee={{ id: selectedId }} />
          <AddEmpModal onOpen={openModalAddEmp} onClose={handleCloseModalAddEmp} />
        </Box>
        </Box>
      </>
    );
  }