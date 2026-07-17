import React, { useState, useEffect } from 'react';
import SideNav from '../../../shared/components/SideNav';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Grid
} from '@mui/material';
import axios from 'axios';
import PremiumTable, { TableSkeleton, TableEmptyState } from '../../../shared/components/PremiumTable';
import PremiumModal from '../../../shared/components/PremiumModal';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import SearchBar from '../../../shared/components/SearchBar';
import ViewListLoans from '../components/ViewListLoans';

const drawerWidth = 240;

export default function Loan() {
  const [loanRecords, setLoanRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewListLoan, setViewListLoan] = useState(false);

  const [openModal1, setOpenModal1] = useState(false);
  const [loanSummaries, setLoanSummaries] = useState([]);
  const [loanDate, setLoanDate] = useState('');
  const [loanCoverage, setLoanCoverage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('http://localhost:8800/emp-loans')
      .then((res) => setLoanRecords(res.data))
      .catch((err) => console.error('Error fetching emp_loans:', err))
      .finally(() => setLoading(false));
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

          <PremiumTable minWidth={760} containerSx={{ mt: 3 }}>
            <thead>
              <tr>
                <th>Loan No.</th>
                <th>Date</th>
                <th>Date Coverage</th>
                <th>Payroll Type</th>
                <th>Payroll Cycle</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton rows={6} columns={['id', 'date', 'textLong', 'chip', 'chip', 'button']} />
              ) : loanRecords.length === 0 ? (
                <TableEmptyState
                  colSpan={6}
                  icon={AccountBalanceOutlinedIcon}
                  title="No loan runs yet"
                  description="Generated employee loan runs will appear here with their coverage and payroll cycle."
                />
              ) : (
                loanRecords.map((record, index) => (
                  <tr key={index}>
                    <td>{record.emp_loans_id}</td>
                    <td>{record.emp_loans_date}</td>
                    <td>{record.emp_date_coverage}</td>
                    <td>{record.emp_loans_payroll_type}</td>
                    <td>{record.emp_loans_payroll_cycle}</td>
                    <td>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() =>
                          handleFetchSummary(record.emp_loans_date, record.emp_date_coverage)
                        }
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </PremiumTable>

          <ViewListLoans onOpen={viewListLoan} onClose={handleCloseListLoans} />
        </Box>
      </Box>

      {/* Modal for loan summaries */}
      <PremiumModal
        open={openModal1}
        onClose={handleCloseModal1}
        title="Loan Summary"
        subtitle={loanCoverage ? `Coverage: ${loanCoverage}` : 'Loan breakdown for this run.'}
        icon={AccountBalanceOutlinedIcon}
        maxWidth="md"
      >
        {error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <PremiumTable minWidth={720}>
            <thead>
              <tr>
                <th>Emp ID</th>
                <th>Loan Type</th>
                <th>Loan Amount</th>
                <th>Penalty</th>
                <th>Total Amount</th>
                <th>Payment Terms</th>
              </tr>
            </thead>
            <tbody>
              {loanSummaries.length === 0 ? (
                <TableEmptyState
                  colSpan={6}
                  icon={AccountBalanceOutlinedIcon}
                  title="No loan entries"
                  description="This loan run has no employee entries."
                />
              ) : loanSummaries.map((summary, idx) => (
                <tr key={idx}>
                  <td>{summary.emp_id}</td>
                  <td>{summary.loan_type_name}</td>
                  <td>{summary.loan_amount}</td>
                  <td>{summary.penalty}</td>
                  <td>{summary.total_loan}</td>
                  <td>{summary.payment_terms}</td>
                </tr>
              ))}
            </tbody>
          </PremiumTable>
        )}
      </PremiumModal>
    </>
  );
}
