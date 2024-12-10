import React, { useState, useEffect } from 'react';
import SideNav from '../Components/SideNav';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/joy/Table';
import axios from 'axios';
import { Button, Modal, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddEmpBenifitsAllowance from '../_Modals/AddEmpBenifitsAllowance';
import ViewListEmpEarning from '../_Modals/ViewListEmpEarning';

const drawerWidth = 240;

export default function ViewListsEarnings({ onOpen, onClose, openListEarnings ,closeListEarnings}) {
  const [openModal, setOpenModal] = useState(false);
  const [openModal1, setOpenModal1] = useState(false);
  const [employeeEarnings, setEmployeeEarnings] = useState([]);

  // Format the currency to PHP format, handling null/undefined values
  const formatCurrency = (value) => {
    const formattedAmount = new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(value);
  
    return formattedAmount || 'PHP 0.00';
  };

  // Fetch employee earnings data from the backend
  useEffect(() => {
    const fetchEmployeeEarnings = async () => {
      try {
        const response = await axios.get('http://localhost:8800/employee-table-earnings');
        setEmployeeEarnings(response.data);
      } catch (error) {
        console.error('Error fetching employee earnings:', error);
      }
    };

    fetchEmployeeEarnings();
  }, []);

  const [selectedEmpId, setSelectedEmpId] = useState(null);
  const [earnings_data, setEarningsData] = useState({});
  const [addbeniallow, setAddBeniAllow] = useState([]);
  
  useEffect(() => {
    if (onOpen && selectedEmpId) {
      axios
        .get(`http://localhost:8800/employee-earnings/${selectedEmpId}`)
        .then((response) => {
          const earningsData = response.data[0];
          setEarningsData({
            empId: earningsData.emp_id,
            fullName: earningsData.full_name,
            riceAllow: earningsData.rice_allow,
            clothingAllow: earningsData.clothing_allow,
            laundryAllow: earningsData.laundry_allow,
            medicalcashAllow: earningsData.medicalcash_allow,
            achivementAllow: earningsData.achivement_allow,
            actualMedicalAssist: earningsData.actualmedical_assist,
          });
        })
        .catch((error) => console.error("Error fetching earnings data:", error));
    }
  }, [onOpen, selectedEmpId]); // Re-run when open or selectedEmpId changes
  
  const handleOpenModal1 = (empId) => {
    setSelectedEmpId(empId); // Set selected employee ID
    setOpenModal1(true); // Open View List Emp Earnings modal
  };
  
  const handleCloseModal1 = () => {
    setOpenModal1(false);  // Close the modal
  };
  
  
  // OPEN ADD BENEFITS
  const handleOpenModal = () => {
    setOpenModal(true);

  };

  // CLOSE ADD BENEFITS
  const handleCloseModal = () => {
    setOpenModal(false);

  };

  return (
    <>
      {/* LIST EARNINGS */}
      <Modal open={onOpen} onClose={handleCloseModal1} closeAfterTransition >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            p: 2,
          }}
        >
          <Box
            sx={{
              backgroundColor: 'white',
              padding: 4,
              width: { xs: '100%', sm: '100%', md: '80%' },
              boxShadow: 24,
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <CloseIcon onClick={onClose} sx={{ cursor: 'pointer', marginLeft: '96%' }} />
            <Typography variant="h4" component="h2" sx={{ marginBottom: 2, fontWeight: 'bold' }}>
              Employee List Earnings/Deductions
            </Typography>
            <Box display="flex" justifyContent="flex-end" sx={{ width: '100%', marginBottom: 2 }}>
              <Tooltip title="Add Employee Benefits or Allowance">
                <Button variant="contained" sx={{ fontSize: 12, fontWeight: 'bold' }} onClick={handleOpenModal}>
                  Add Employee Benefits
                </Button>
              </Tooltip>
            </Box>

            <Table hoverRow sx={{}} borderAxis="both">
              <thead>
                <tr>
                  <th style={{ width: '3%' }}>Emp ID</th>
                  <th style={{ width: '15%' }}>Full Name</th>
                  <th style={{ width: '10%' }}>Total De Minimis Benefits</th>
                  <th style={{ width: '10%' }}>Total Additional Allowance</th>
                  <th style={{ width: '10%' }}>Total Benefits and Allowance</th>
                  <th style={{ width: '9%' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {employeeEarnings.map((employee) => (
                  <tr key={employee.emp_id}>
                    <td style={{ cursor: 'pointer' }}>{employee.emp_id}</td>
                    <td style={{ cursor: 'pointer' }}>{employee.full_name}</td>
                    <td style={{ cursor: 'pointer' }}>{formatCurrency(employee.total_de_minimis)}</td>
                    <td style={{ cursor: 'pointer' }}>{formatCurrency(employee.total_additional_benefits)}</td>
                    <td style={{ cursor: 'pointer' }}>{formatCurrency(employee.grand_total_benefits)}</td>
                    <td>
                      <Button
                        variant="contained"
                        onClick={() => {
                          console.log("Employee ID passed:", employee.emp_id); // Log emp_id before passing
                          handleOpenModal1(employee.emp_id); // Pass the employee's emp_id

                        }}
                        style={{ width: '20%', fontSize: 12, fontWeight: 'bold' }}
                      >
                        View
                      </Button>
                      <Button variant="contained" style={{ marginRight: 5, marginLeft: 5, width: '20%', fontSize: 12, fontWeight: 'bold' }} >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <AddEmpBenifitsAllowance onOpen={openModal} onClose={handleCloseModal} />
            <ViewListEmpEarning onOpen={openModal1} onClose={handleCloseModal1} earningsData={earnings_data} addallowance={addbeniallow} openListEarnings={openListEarnings} />
          </Box>
        </Box>
      </Modal>
    </>
  );
}
