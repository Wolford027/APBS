import { useEffect, useState } from 'react'
import SideNav from '../Components/SideNav'
import Box from '@mui/material/Box'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { Button } from '@mui/material'
import axios from 'axios'
import Table from '@mui/joy/Table'
import SearchBar from '../Components/SearchBar'
import Grid from '@mui/joy/Grid';
import AddEmpModal from '../_Modals/AddEmp';
import ViewEmpModal from '../_Modals/ViewEmpModal';

const drawerWidth = 240;

export default function EmployeeList() {
  const [openModalAddEmp, setOpenModalAddEmp] = useState(false);
  const [openModalViewEmp, setOpenModalViewEmp] = useState(false);
  const [viewemp, setviewemp] = useState([]);
  const [selectedId, setSelectedId] = useState([]);
  const [search, setSearch] = useState('')

  // View Employee information
  const [emp_info, setemp_info] = useState({
    f_name: ""
  });

  // Fetch data
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

  const [earningsData, setEarningsData] = useState({});
  const [addallowance, setAddAllowance] = useState([]);

  useEffect(() => {
    if (emp_info.emp_id) {
      const fetchEarningsAndBenefits = async () => {
        try {
          // Simultaneously fetch both datasets using Promise.all
          const [earningsRes, benefitsRes] = await Promise.all([
            axios.get(`http://localhost:8800/employee-earnings/${emp_info.emp_id}`),
            axios.get(`http://localhost:8800/emp-additional-benifits/${emp_info.emp_id}`)
          ]);
          const earnings = earningsRes.data[0];
          setEarningsData({
            empId: earnings.emp_id,
            fullName: earnings.full_name,
            riceAllow: earnings.rice_allow,
            clothingAllow: earnings.clothing_allow,
            laundryAllow: earnings.laundry_allow,
            medicalAllow: earnings.medical_allow,
          });
          setAddAllowance(benefitsRes.data);

        } catch (error) {
          console.error("Error fetching earnings or benefits data:", error);
        }
      };

      fetchEarningsAndBenefits();
    }
  }, [emp_info.emp_id]);

  const handleCloseModalViewEmp = () => {
    setOpenModalViewEmp(false);
  };

  // Add Employee information
  const handleOpenModalAddEmp = () => {
    setOpenModalAddEmp(true);
  };

  const handleCloseModalAddEmp = () => {
    setOpenModalAddEmp(false);
  };

  const filteredEmp = viewemp.filter((emp) => {
    const fullname = `${emp.f_name} ${emp.l_name}`.toLowerCase();
    return (
      emp.emp_id.toString().includes(search) ||
      fullname.includes(search.toLowerCase()) ||
      emp.emp_pos.toLowerCase().includes(search.toLowerCase())
    );
  });

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
            <Grid size={4} sx={{ marginLeft: -3 }}>
              <SearchBar onSearchChange={(value) => setSearch(value)} />
            </Grid>
            <Grid size={4}>
              <Button type='Submit' color="primary" variant="outlined" sx={{ marginLeft: 3, }} onClick={handleOpenModalAddEmp}> Add Employee</Button>
            </Grid>
          </Grid>

          <Table hoverRow sx={{}} borderAxis='both'>
            <thead>
              <tr>
                <th style={{ width: '10%' }}>Employee ID</th>
                <th style={{ width: '30%' }}>Employee Name</th>
                <th style={{ width: '10%' }}>Employee Position</th>
                <th style={{ width: '10%' }}>Mobile Number</th>
                <th style={{ width: '15%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(search ? filteredEmp : viewemp).length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '1rem', color: 'gray' }}>
                    No employee data found.
                  </td>
                </tr>
              ) : (
                (search ? filteredEmp : viewemp).map((vm, i) => (
                  <tr key={i}>
                    <td style={{ cursor: 'pointer' }} onClick={() => handleOpenModalViewEmp(vm.emp_id)}>{vm.emp_id}</td>
                    <td style={{ cursor: 'pointer' }} onClick={() => handleOpenModalViewEmp(vm.emp_id)}>{vm.f_name + " " + vm.l_name}</td>
                    <td style={{ cursor: 'pointer' }} onClick={() => handleOpenModalViewEmp(vm.emp_id)}>{vm.emp_pos}</td>
                    <td style={{ cursor: 'pointer' }} onClick={() => handleOpenModalViewEmp(vm.emp_id)}>{vm.mobile_num}</td>
                    <td>
                      <Button variant='contained' style={{ marginRight: 5, marginLeft: 5, width: '35%', fontSize: 12, fontWeight: 'bold' }} onClick={() => handleOpenModalViewEmp(vm.emp_id)}>View</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
          <ViewEmpModal onOpen={openModalViewEmp} onClose={handleCloseModalViewEmp} emp_info={emp_info} selectedEmployee={{ id: selectedId }} addallowance={addallowance} earningsData={earningsData} />
          <AddEmpModal onOpen={openModalAddEmp} onClose={handleCloseModalAddEmp} />
        </Box>
      </Box>
    </>
  );
}
