import React, { useState, useEffect } from 'react';
import SideNav from '../Components/SideNav';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Table from '@mui/joy/Table';
import axios from 'axios';
import { Button } from '@mui/material';
import SearchBar from '../Components/SearchBar';
import Grid from '@mui/joy/Grid';
import AddEarningsDeductions from '../_Modals/AddEarningsDeductions';
import ViewEarningsDeductions from '../_Modals/ViewEarningsDeductions'; // Import the new modal

const drawerWidth = 240;

export default function Earnings() {
  // State to store fetched earnings data
  const [earnings, setEarnings] = useState([]);
  const [openViewModal, setOpenViewModal] = useState(false); // State to control the View modal
  const [selectedEarningsId, setSelectedEarningsId] = useState(null); // State to store selected earnings/deductions ID

  // Function to format date (only the date part)
  const formatDate = (date) => {
    const newDate = new Date(date);
    return newDate.toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }); // Output format: "October 1, 2024"
  };
  
  useEffect(() => {
    getEarnings();
  }, []);
  
  function getEarnings() {
    axios
      .get('http://localhost:8800/earnings_deductions')
      .then(function (response) {
        console.log(response.data); // Check if data is returned correctly
        setEarnings(response.data);
      })
      .catch(function (error) {
        console.error('Error fetching data:', error);
      });
  }
  
  // Modal handling for AddEarningsDeductions
  const [openModal, setOpenModal] = useState(false);
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  // Handle View button click
  const handleViewClick = (id) => {
    setSelectedEarningsId(id); // Set the ID of the selected earnings entry
    setOpenViewModal(true); // Open the View modal
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <SideNav />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px}` },
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Earnings/Deductions
          </Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{ flexGrow: 1, p: 3, mt: 7, ml: -11 }}>
        <Grid container spacing={0} direction="row" sx={{ flexGrow: 1, justifyContent: 'space-between', alignItems: 'center' }}>
          <Grid size={4} sx={{ marginLeft: -3 }}>
            <SearchBar />
          </Grid>
          <Grid size={4}>
            <Button
              type="Submit"
              color="primary"
              variant="outlined"
              sx={{ marginLeft: 3 }}
              onClick={handleOpenModal}
            >
              Add Employee Earnings/Deductions
            </Button>
          </Grid>
        </Grid>

        <Table hoverRow sx={{}} borderAxis="both">
          <thead>
            <tr>
              <th style={{ width: '8%' }}>No.</th>
              <th style={{ width: '15%' }}>Date Generate</th>
              <th style={{ width: '10%' }}>Year</th>
              <th style={{ width: '10%' }}>Month</th>
              <th style={{ width: '20%' }}>Payroll & Cycle Type</th>
              <th style={{ width: '20%' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {earnings.map((earn, key) => (
              <tr key={key}>
                <td>{earn.emp_onetime_earn_deduct_id}</td>
                <td>{formatDate(earn.create_at)}</td>
                <td>{earn.year}</td>
                <td>{earn.month}</td>
                <td>{earn.payroll_type} - {earn.cycle_type}</td>
                <td>
                  <Button
                    variant="contained"
                    style={{ marginRight: 5, width: '25%', fontSize: 12, fontWeight: 'bold' }}
                  >
                    Lock
                  </Button>
                  <Button
                    variant="contained"
                    style={{ width: '25%', fontSize: 12, fontWeight: 'bold' }}
                    onClick={() => handleViewClick(earn.emp_onetime_earn_deduct_id)} // Open View modal
                  >
                    View
                  </Button>
                  <Button
                    variant="contained"
                    style={{ marginRight: 5, marginLeft: 5, width: '35%', fontSize: 12, fontWeight: 'bold' }}
                  >
                    Update
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <AddEarningsDeductions
          onOpen={openModal}
          onClose={handleCloseModal}
          openListEarnings={handleOpenModal}
          closeListEarnings={handleCloseModal}
          reload={getEarnings}
        />

        {/* View Modal */}
        <ViewEarningsDeductions
          open={openViewModal}
          onClose={() => setOpenViewModal(false)} // Close the modal
          empOnetimeEarningsId={selectedEarningsId} // Pass the selected earnings ID
        />
      </Box>
    </Box>
  );
}
