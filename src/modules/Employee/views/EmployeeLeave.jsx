import { useEffect, useState } from 'react';
import PageLayout from "../../../shared/components/PageLayout";
import Box from "@mui/material/Box";
import Table from "@mui/joy/Table";
import SearchBar from "../../../shared/components/SearchBar";
import { Button } from "@mui/material";
import AddEmpLeave from '../components/AddEmployeeLeave';
import FileEmpLeave from '../components/FileEmployeeLeave';
import EmpLeaveInfo from '../components/EmployeeLeaveInfo';
import axios from 'axios';

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
    <PageLayout title="Employee Leave">
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <SearchBar />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button color="primary" variant="outlined" onClick={handleModalFileEmpLeave}>File Employee Leave</Button>
          <Button color="primary" variant="contained" onClick={handleModalAddEmpLeave}>Add Employee Leave</Button>
        </Box>
      </Box>

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
    </PageLayout>
  );
}
