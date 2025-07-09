import React, { useState, useEffect } from 'react';
import SideNav from '../Components/SideNav';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid
} from '@mui/material';
import axios from 'axios';
import SearchBar from '../Components/SearchBar';
import ViewListLoans from '../_Modals/ViewListLoans';

const drawerWidth = 240;

export default function Loan() {
  const [loanRecords, setLoanRecords] = useState([]);
  const [viewListLoan, setViewListLoan] = useState(false);

  const [openModal1, setOpenModal1] = useState(false);
  const [loanSummaries, setLoanSummaries] = useState([]);
  const [loanDate, setLoanDate] = useState('');
  const [loanCoverage, setLoanCoverage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('http://localhost:8800/emp-loans')
      .then((res) => setLoanRecords(res.data))
      .catch((err) => console.error('Error fetching emp_loans:', err));
  }, []);

  const handleFetchSummary = async (emp_loans_date, emp_date_coverage) => {
    try {
      const response = await axios.get(`http://localhost:8800/emp_loan_summary/${emp_loans_date}`);
      setLoanSummaries(response.data);
      setLoanDate(emp_loans_date);
      setLoanCoverage(emp_date_coverage);
      setOpenModal1(true);
      setError('');
    } catch (err) {
      setLoanSummaries([]);
      setError('No loan summary found or server error.');
      setOpenModal1(true);
    }
  };

  const handleCloseModal1 = () => setOpenModal1(false);
  const handleOpenModal = () => setViewListLoan(true);
  const handleCloseListLoans = () => setViewListLoan(false);

  return (
    <>
      <Box sx={{ display: 'flex' }}>
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
              Loans
            </Typography>
          </Toolbar>
        </AppBar>

        <Box sx={{ flexGrow: 1, p: 3, mt: 8, ml: -11 }}>
          <Grid container spacing={2} justifyContent="space-between" alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <SearchBar />
            </Grid>
            <Grid item xs={12} sm={6} md={4} textAlign="right">
              <Button variant="outlined" onClick={handleOpenModal}>
                List Loans
              </Button>
            </Grid>
          </Grid>

          <TableContainer component={Paper} sx={{ mt: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Loan No.</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Date Coverage</TableCell>
                  <TableCell>Payroll Type</TableCell>
                  <TableCell>Payroll Cycle</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loanRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No data available
                    </TableCell>
                  </TableRow>
                ) : (
                  loanRecords.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell>{record.emp_loans_id}</TableCell>
                      <TableCell>{record.emp_loans_date}</TableCell>
                      <TableCell>{record.emp_date_coverage}</TableCell>
                      <TableCell>{record.emp_loans_payroll_type}</TableCell>
                      <TableCell>{record.emp_loans_payroll_cycle}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() =>
                            handleFetchSummary(record.emp_loans_date, record.emp_date_coverage)
                          }
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <ViewListLoans onOpen={viewListLoan} onClose={handleCloseListLoans} />
        </Box>
      </Box>

      {/* Modal for loan summaries */}
      <Modal open={openModal1} onClose={handleCloseModal1}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 900,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Loan Summary for Coverage: {loanCoverage}
          </Typography>

          {error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Emp ID</TableCell>
                    <TableCell>Loan Type</TableCell>
                    <TableCell>Loan Amount</TableCell>
                    <TableCell>Penalty</TableCell>
                    <TableCell>Total Amount</TableCell>
                    <TableCell>Payment Terms</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loanSummaries.map((summary, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{summary.emp_id}</TableCell>
                      <TableCell>{summary.loan_type_name}</TableCell>
                      <TableCell>{summary.loan_amount}</TableCell>
                      <TableCell>{summary.penalty}</TableCell>
                      <TableCell>{summary.total_loan}</TableCell>
                      <TableCell>{summary.payment_terms}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Close button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button onClick={handleCloseModal1} variant="outlined">
              Close
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
}
