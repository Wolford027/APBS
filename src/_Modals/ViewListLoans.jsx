import React, { useState, useEffect } from 'react';
import SideNav from '../Components/SideNav';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/joy/Table';
import axios from 'axios';
import { Button, Modal } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ViewListEmpLoans from './ViewListEmpLoans';
import AddEmpLoans from './AddEmpLoans';

const drawerWidth = 240;

export default function ViewListLoans({ onOpen, onClose, openListEarnings, closeListEarnings }) {
  const [openModal, setOpenModal] = useState(false);
  const [viewListEmpLoans, setViewListEmpLoans] = useState(false);
  const [employeeLoans, setEmployeeLoans] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState(null);
  const [govLoans, setGovLoans] = useState([]);
  const [comLoans, setComLoans] = useState([]);

  const formatCurrency = (value) => {
    const formattedAmount = new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(value);
    return formattedAmount || 'PHP 0.00';
  };

  useEffect(() => {
    const fetchEmployeeLoans = async () => {
      try {
        const response = await axios.get('http://localhost:8800/employee-table-loans');
        setEmployeeLoans(response.data);
      } catch (error) {
        console.error('Error fetching employee loans:', error);
      }
    };
    fetchEmployeeLoans();
  }, []);

  useEffect(() => {
    if (selectedEmpId) {
      axios
        .get(`http://localhost:8800/employee-loans/${selectedEmpId}`)
        .then((response) => {
          setGovLoans(response.data.governmentLoans || []);
          setComLoans(response.data.companyLoans || []);
          console.log("✅ Loans fetched:", response.data);
        })
        .catch((error) => {
          console.error("❌ Error fetching employee loan data:", error);
        });
    }
  }, [selectedEmpId]);

  const handleListEmpLoansOpen = (empId) => {
    setSelectedEmpId(empId);
    setViewListEmpLoans(true);
  };

  const handleListEmpLoansClose = () => {
    setViewListEmpLoans(false);
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  return (
    <>
      <Modal open={onOpen} onClose={onClose} closeAfterTransition>
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

            <Table hoverRow borderAxis="both">
              <thead>
                <tr>
                  <th style={{ width: '3%' }}>Emp ID</th>
                  <th style={{ width: '15%' }}>Full Name</th>
                  <th style={{ width: '10%' }}>Total Government Loans</th>
                  <th style={{ width: '10%' }}>Total Company Loans</th>
                  <th style={{ width: '10%' }}>Total Loans</th>
                  <th style={{ width: '9%' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {employeeLoans.map((employee) => (
                  <tr key={employee.emp_id}>
                    <td>{employee.emp_id}</td>
                    <td>{employee.full_name}</td>
                    <td>{formatCurrency(employee.government_loan_amount)}</td>
                    <td>{formatCurrency(employee.company_loan_amount)}</td>
                    <td>{formatCurrency(employee.total_loan_amount)}</td>
                    <td>
                      <Button
                        variant="contained"
                        onClick={() => handleListEmpLoansOpen(employee.emp_id)}
                        style={{ width: '20%', fontSize: 12, fontWeight: 'bold' }}
                      >
                        View
                      </Button>
                      <Button variant="contained" style={{ marginRight: 5, marginLeft: 5, width: '20%', fontSize: 12, fontWeight: 'bold' }}>
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

        

            <ViewListEmpLoans onOpen={viewListEmpLoans} onClose={handleListEmpLoansClose}  loansData={govLoans} loansData1={comLoans} empId={selectedEmpId}  />
            <AddEmpLoans onOpen={openModal} onClose={handleCloseModal} />
          </Box>
        </Box>
      </Modal>
    </>
  );
}
