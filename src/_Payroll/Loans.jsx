import React, { useState, useEffect } from 'react'
import SideNav from '../Components/SideNav'
import Box from '@mui/material/Box'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Table from '@mui/joy/Table'
import axios from 'axios'
import { Button, Modal, TextField, Autocomplete } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import SearchBar from '../Components/SearchBar'
import ModalClose from '@mui/joy/ModalClose';
import Divider from '@mui/material/Divider';
import Grid from '@mui/joy/Grid';
import ViewListLoans from '../_Modals/ViewListLoans';
const drawerWidth = 240;

export default function Loan() {
  const [openModal, setOpenModal] = useState(false);
  const [value1, setValue1] = useState(null);
  const [value2, setValue2] = useState(null);
  const [viewListLoan, setViewListLoan] = useState(false);
  const [payroll, setPayroll] = useState([]);
  const [openModal1, setOpenModal1] = useState(false);
  const [payrollview, setPayroll1] = useState([]);
  const [openModalViewEmpPayroll, setOpenModalViewEmpLoans] = useState(false);
  const [viewemp, setViewemp] = useState([]);
  const [loanRecords, setLoanRecords] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8800/emp-loans')
      .then((res) => {
        setLoanRecords(res.data);
      })
      .catch((err) => {
        console.error('Error fetching emp_loans:', err);
      });
  }, []);

  const marginstyle = { margin: 8 };
  const buttonstyle = { borderRadius: 5, justifyContent: 'left', margin: 5 };
  const CivilStatus = [
    { label: 'Single' }, { label: 'Married' }
  ];

  const handleOpenModal1 = () => setOpenModal1(true);
  const handleCloseModal1 = () => setOpenModal1(false);
  const handleOpenModalViewEmpLoans = () => setOpenModalViewEmpLoans(true);
  const handleCloseModalViewEmpLoans = () => setOpenModalViewEmpLoans(false);
  const handleOpenModal = () => {
    setValue1(null);
    setValue2(null);
    setOpenModal(true);
    setViewListLoan(true);
  };
  const handleCloseModal = () => setOpenModal(false);
  const handleCloseListLoans = () => setViewListLoan(false);

  return (
    <>
      <Box sx={{ display: 'flex' }}>
        <SideNav />
        <AppBar
          position="fixed"
          sx={{ width: { sm: `calc(100% - ${drawerWidth}px)` }, ml: { sm: `${drawerWidth}px` } }}
        >
          <Toolbar>
            <Typography variant="h6" noWrap component="div"> Loans </Typography>
          </Toolbar>
        </AppBar>

        <Box sx={{ flexGrow: 1, p: 3, mt: 7, ml: -11 }}>
          <Grid container spacing={0} direction="row" sx={{ flexGrow: 1, justifyContent: "space-between", alignItems: "center" }}>
            <Grid size={4} sx={{ marginLeft: -3 }}>
              <SearchBar />
            </Grid>
            <Grid size={4}>
              <Button type='submit' color="primary" variant="outlined" sx={{ marginLeft: 3 }} onClick={handleOpenModal}>List Loans</Button>
            </Grid>
          </Grid>

          <Table hoverRow sx={{ mt: 2 }} borderAxis="both">
            <thead>
              <tr>
                <th style={{ width: '10%' }}>Loan No.</th>
                <th style={{ width: '20%' }}>Date</th>
                <th style={{ width: '20%' }}>Date Coverage</th>
                <th style={{ width: '20%' }}>Payroll Type</th>
                <th style={{ width: '20%' }}>Payroll Cycle</th>
                <th style={{ width: '10%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loanRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '16px' }}>No data available</td>
                </tr>
              ) : (
                loanRecords.map((record, index) => (
                  <tr key={index}>
                    <td>{record.emp_loans_id}</td>
                    <td>{record.emp_loans_date}</td>
                    <td>{record.emp_date_coverage}</td>
                    <td>{record.emp_loans_payroll_type}</td>
                    <td>{record.emp_loans_payroll_cycle}</td>
                    <td>
                      <Button variant='contained' style={{ marginRight: 5, width: '25%', fontSize: 12, fontWeight: 'bold' }}>Lock</Button>
                      <Button variant='contained' style={{ width: '25%', fontSize: 12, fontWeight: 'bold' }} onClick={handleOpenModal1}>View</Button>
                      <Button variant='contained' style={{ marginRight: 5, marginLeft: 5, width: '35%', fontSize: 12, fontWeight: 'bold' }}>Reprocess</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {/* <tbody>
              {loanRecords.map((record, index) => (
                <tr key={index}>
                 <td>{record.emp_loans_id}</td> 
                  <td>{record.emp_loans_date}</td>
                  <td>{record.emp_date_coverage}</td>
                  <td>{record.emp_loans_payroll_type}</td>
                  <td>{record.emp_loans_payroll_cycle}</td>
                  <td>
                  
                    <Button variant='contained' style={{ marginRight: 5, fontSize: 12, fontWeight: 'bold' }} onClick={handleOpenModal1}>View</Button>
              
                  </td>
                </tr>
              ))}
            </tbody> */}
          </Table>

          <ViewListLoans onOpen={viewListLoan} onClose={handleCloseListLoans} />
        </Box>
      </Box>
    </>
  );
}