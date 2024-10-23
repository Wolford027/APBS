import { useEffect, useState } from 'react';
import SideNav from "../Components/SideNav";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Table from "@mui/joy/Table";
import Typography from "@mui/material/Typography";
import PublishOutlinedIcon from "@mui/icons-material/PublishOutlined";
import SearchBar from "../Components/SearchBar";
import { Button, Modal, TextField, Autocomplete } from "@mui/material";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Grid from '@mui/joy/Grid';
import AddEmpLeave from '../_Modals/AddEmployeeLeave';
import FileEmpLeave from '../_Modals/FileEmployeeLeave';
import EmpLeaveInfo from '../_Modals/EmployeeLeaveInfo';
import axios from 'axios';

const drawerWidth = 240;

export default function EmployeeLeave() {
  const [OpenModalAddEmpLeave, setOpenModalAddEmpLeave] = useState(false);
  const [OpenModalFileEmpLeave, setOpenModalFileEmpLeave] = useState(false);
  const [OpenModalEmpLeaveInfo, setOpenModalEmpLeaveInfo] = useState(false);
  const [employeeLeaveData, setEmployeeLeaveData] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null); // State for the selected employee
  const [EmpLeaveType, setEmpLeaveType] = useState([]);
  const [selectedEmpLeaveType, setSelectedEmpLeaveType] = useState(null);
  const [selectedEmp, setSelectedEmp] = useState(null);
  
  // Fetch employee leave data
  const fetchEmployeeLeaveData = async () => {
    try {
      const response = await axios.get('http://localhost:8800/empleavetable'); // Replace with your API endpoint
      console.log("Fetched employee leave data:", response.data); // Log the data
      setEmployeeLeaveData(response.data);
    } catch (error) {
      console.error("Error fetching employee leave data:", error);
    }
  };

  useEffect(() => {
    const fetchEmpLeaveType = async () => {
      try {
        const response = await axios.get('http://localhost:8800/empfileleave');
        const formattedData = response.data.map(emp => ({
          id: emp.emp_id,
          fullName: `${emp.emp_id} - ${emp.f_name} ${emp.m_name ? emp.m_name + ' ' : ''}${emp.l_name}${emp.suffix ? ' ' + emp.suffix : ''}`.trim()


        }));
        setEmpLeaveType(formattedData);
        console.log('Fetched Employee Data:', formattedData);
      } catch (error) {
        console.error('Error fetching Employee data:', error);
      }
    };

    fetchEmpLeaveType();
  }, []);


  useEffect(() => {
    fetchEmployeeLeaveData();
  }, []);

  const handleSelect = (event, newValue) => {
    setSelectedEmp(newValue); // Store selected employee
    // Here you can filter the table or take any action based on the selected value
    console.log('Selected Employee:', newValue);
  };

  // Add employee leave modal
  const handleModalAddEmpLeave = () => {
    setOpenModalAddEmpLeave(true);
  };

  const handleCloseModalAddEmpLeave = () => {
    setOpenModalAddEmpLeave(false);
  };

  // File employee leave modal
  const handleModalFileEmpLeave = () => {
    setOpenModalFileEmpLeave(true);
  };

  const handleCloseModalFileEmpLeave = () => {
    setOpenModalFileEmpLeave(false);
  };

  // Employee leave info modal
  const handleModalEmpLeaveInfo = (employee) => {
    setSelectedEmployee(employee); // Set the selected employee
    setOpenModalEmpLeaveInfo(true);
  };

  const handleCloseModalEmpLeaveInfo = () => {
    setOpenModalEmpLeaveInfo(false);
    setSelectedEmployee(null); // Clear the selected employee when closing the modal

  };

  const handleRefreshData = () => {
    fetchEmployeeLeaveData(); // Refresh the leave data
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
              Employee Leave
            </Typography>
          </Toolbar>
        </AppBar>

        <Box sx={{ flexGrow: 1, p: 3, mt: 7, ml: -11 }}>
          <Grid container spacing={0} direction="row" sx={{ flexGrow: 1, justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
            
            <Grid size={4} sx={{ marginLeft: -3 }}>
             {/* <Autocomplete
                 sx={{ width: 210, marginLeft: -1}}
                size="small"
                options={EmpLeaveType}
                getOptionLabel={(option) => option.fullName}
                value={EmpLeaveType.find(emp => emp.id === selectedEmpLeaveType) || null} // Controlled value
                renderInput={(params) => <TextField {...params} label="Select Employee" variant="outlined" />}
                onChange={(event, value) => {
                  if (value) {
                    setSelectedEmpLeaveType(value.id);
                  } else {
                    setSelectedEmpLeaveType(null);
                  }

                }}
              /> */}

              <SearchBar />
            </Grid>
            <Grid size={4}>
              <Button type='Submit' color="primary" variant="contained" sx={{ marginRight: 3 }} onClick={handleModalFileEmpLeave}> File Employee Leave</Button>
              <Button type='Submit' color="primary" variant="contained" sx={{ marginRight: 3 }} onClick={handleModalAddEmpLeave}> Add Employee Leave</Button>
            </Grid>
          </Grid>

          <Table hoverRow sx={{}} borderAxis='both'>
            <thead>
              <tr>
                <th style={{ width: '10%' }}>Employee ID</th>
                <th style={{ width: '30%' }}>Employee Name</th>
                <th style={{ width: '20%' }}>Total Leave</th>
                <th style={{ width: '20%' }}>Consumed Leave</th>
                <th style={{ width: '20%' }}>Balance Leave</th>
              </tr>
            </thead>
            <tbody>
              {employeeLeaveData.map((employee) => (
                <tr key={employee.emp_id} onClick={() => handleModalEmpLeaveInfo(employee)} style={{ cursor: 'pointer' }}>
                  <td>{employee.emp_id}</td>
                  <td>{employee.full_name}</td>
                  <td>{employee.total_leave_balance}</td>
                  <td>{employee.total_leave_spent}</td>
                  <td>{employee.total_leave_remaining}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          <AddEmpLeave onOpen={OpenModalAddEmpLeave} onClose={handleCloseModalAddEmpLeave} onInsert={fetchEmployeeLeaveData} />
          <FileEmpLeave onOpen={OpenModalFileEmpLeave} onClose={handleCloseModalFileEmpLeave} onInsert={handleRefreshData} selectedEmployee={selectedEmployee} />
          <EmpLeaveInfo onOpen={OpenModalEmpLeaveInfo} onClose={handleCloseModalEmpLeaveInfo} selectedEmployee={selectedEmployee} /> {/* Pass the selected employee */}
        </Box>
      </Box>
    </>
  );
}
