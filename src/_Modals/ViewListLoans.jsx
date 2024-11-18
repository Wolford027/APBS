import React, { useState, useEffect } from 'react';
import SideNav from '../Components/SideNav';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/joy/Table';
import axios from 'axios';
import { Button, Modal, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ViewListEmpLoans from './ViewListEmpLoans';
import AddEmpLoans from './AddEmpLoans';

const drawerWidth = 240;

export default function ViewListLoans({ onOpen, onClose, openListEarnings, closeListEarnings }) {
  const [openModal, setOpenModal] = useState(false);
  const [viewListEmpLoans, setViewListEmpLoans] = useState(false);
  const [employeeLoans, setEmployeeLoans] = useState([]);

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
    const fetchEmployeeLoans = async () => {
      try {
        const response = await axios.get('http://localhost:8800/employee-table-loans');
        setEmployeeLoans(response.data);
      } catch (error) {
        console.error('Error fetching employee earnings:', error);
      }
    };

    fetchEmployeeLoans();
  }, []);

  const [selectedEmpId, setSelectedEmpId] = useState(null);

  const [addbeniallow, setAddBeniAllow] = useState([]);
  const [loans_data, setLoansData] = useState({});

  useEffect(() => {
    if (onOpen && selectedEmpId) {
      axios
        .get(`http://localhost:8800/employee-loans/${selectedEmpId}`)
        .then((response) => {
          const loansData = response.data[0];
          setLoansData({
            empId: loansData.emp_id,
            full_name: loansData.full_name,
          });
          console.log("State after update:", loansData); // Check state after update
        })
        .catch((error) => console.error("Error fetching earnings data:", error));
    }
  }, [onOpen, selectedEmpId]); // Re-run when open or selectedEmpId changes

  const handleListEmpLoansOpen = (empId) => {
    setSelectedEmpId(empId); // Set selected employee ID
    setViewListEmpLoans(true); // Open View List Emp Earnings modal
  };

  const handleListEmpLoansClose = () => {
    setViewListEmpLoans(false);
  }


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
      <Modal open={onOpen} onClose={onClose} closeAfterTransition >
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
              Employee List Loans
            </Typography>
            <Box display="flex" justifyContent="flex-end" sx={{ width: '100%', marginBottom: 2 }}>
              <Button variant="contained" sx={{ fontSize: 12, fontWeight: 'bold' }} onClick={handleOpenModal}>
                Add Employee Loan
              </Button>
            </Box>

            <Table hoverRow sx={{}} borderAxis="both">
              <thead>
                <tr>
                  <th style={{ width: '3%' }}>Emp ID</th>
                  <th style={{ width: '15%' }}>Full Name</th>
                  <th style={{ width: '10%' }}>Total Goverment Loans</th>
                  <th style={{ width: '10%' }}>Total Company Loans</th>
                  <th style={{ width: '10%' }}>Total Loans</th>
                  <th style={{ width: '9%' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {employeeLoans.map((employee) => (
                  <tr key={employee.emp_id}>
                    <td style={{ cursor: 'pointer' }}>{employee.emp_id}</td>
                    <td style={{ cursor: 'pointer' }}>{employee.full_name}</td>
                    <td style={{ cursor: 'pointer' }}>{formatCurrency(employee.government_loan_amount)}</td>
                    <td style={{ cursor: 'pointer' }}>{formatCurrency(employee.company_loan_amount)}</td>
                    <td style={{ cursor: 'pointer' }}>{formatCurrency(employee.total_loan_amount)}</td>
                    <td>
                      <Button
                        variant="contained"
                        onClick={() => {
                          console.log("Employee ID passed:", employee.emp_id); // Log emp_id before passing
                          handleListEmpLoansOpen(employee.emp_id); // Pass the employee's emp_id

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
            <ViewListEmpLoans onOpen={viewListEmpLoans} onClose={handleListEmpLoansClose} loansData={loans_data} />
            <AddEmpLoans onOpen={openModal} onClose={handleCloseModal} />
          </Box>
        </Box>
      </Modal>
    </>
  );
}
