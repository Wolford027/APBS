import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import axios from 'axios';
import { Button } from '@mui/material';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import PremiumModal from '../../../shared/components/PremiumModal';
import PremiumTable, { TableEmptyState } from '../../../shared/components/PremiumTable';
import ViewListEmpLoans from './ViewListEmpLoans';
import AddEmpLoans from './AddEmpLoans';

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
    <PremiumModal
      open={onOpen}
      onClose={onClose}
      title="Employee List Loans"
      subtitle="Government and company loan balances per employee."
      icon={AccountBalanceOutlinedIcon}
      maxWidth="md"
    >
      <Box display="flex" justifyContent="flex-end" sx={{ mb: 2 }}>
        <Button variant="contained" onClick={handleOpenModal}>
          Add Employee Loan
        </Button>
      </Box>

      <PremiumTable minWidth={720}>
        <thead>
          <tr>
            <th style={{ width: '8%' }}>Emp ID</th>
            <th style={{ width: '25%' }}>Full Name</th>
            <th style={{ width: '18%' }}>Total Government Loans</th>
            <th style={{ width: '18%' }}>Total Company Loans</th>
            <th style={{ width: '15%' }}>Total Loans</th>
            <th style={{ width: '16%' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {employeeLoans.length === 0 ? (
            <TableEmptyState
              colSpan={6}
              icon={AccountBalanceOutlinedIcon}
              title="No employee loans"
              description="Loans you add will be listed here with their running balances."
            />
          ) : employeeLoans.map((employee) => (
            <tr key={employee.emp_id}>
              <td>{employee.emp_id}</td>
              <td>{employee.full_name}</td>
              <td>{formatCurrency(employee.government_loan_amount)}</td>
              <td>{formatCurrency(employee.company_loan_amount)}</td>
              <td>{formatCurrency(employee.total_loan_amount)}</td>
              <td>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleListEmpLoansOpen(employee.emp_id)}
                  >
                    View
                  </Button>
                  <Button variant="outlined" size="small">
                    Edit
                  </Button>
                </Box>
              </td>
            </tr>
          ))}
        </tbody>
      </PremiumTable>

      <ViewListEmpLoans onOpen={viewListEmpLoans} onClose={handleListEmpLoansClose} loansData={govLoans} loansData1={comLoans} empId={selectedEmpId} />
      <AddEmpLoans onOpen={openModal} onClose={handleCloseModal} />
    </PremiumModal>
  );
}
