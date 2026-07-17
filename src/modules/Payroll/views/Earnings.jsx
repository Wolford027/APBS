import React, { useState, useEffect } from 'react';
import PageLayout from '../../../shared/components/PageLayout';
import Box from '@mui/material/Box';
import PremiumTable, { TableSkeleton, TableEmptyState } from '../../../shared/components/PremiumTable';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import axios from 'axios';
import { Button } from '@mui/material';
import SearchBar from '../../../shared/components/SearchBar';
import AddEarningsDeductions from '../components/AddEarningsDeductions';
import ViewEarningsDeductions from '../components/ViewEarningsDeductions'; // Import the new modal

export default function Earnings() {
  // State to store fetched earnings data
  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(true);
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
      })
      .finally(function () {
        setLoading(false);
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
    <PageLayout title="Earnings/Deductions">
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <SearchBar />
        <Button color="primary" variant="contained" onClick={handleOpenModal}>
          Add Employee Earnings/Deductions
        </Button>
      </Box>

        <PremiumTable minWidth={760}>
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
            {loading ? (
              <TableSkeleton rows={6} columns={['id', 'date', 'number', 'text', 'chip', 'buttons']} />
            ) : earnings.length === 0 ? (
              <TableEmptyState
                colSpan={6}
                icon={ReceiptLongOutlinedIcon}
                title="No earnings or deductions yet"
                description="Generated one-time earnings and deductions will appear here, ready to lock, view, or update."
              />
            ) : earnings.map((earn, key) => (
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
        </PremiumTable>

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
    </PageLayout>
  );
}
