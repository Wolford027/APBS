import React, { useState, useEffect } from 'react'
import PageLayout from '../../../shared/components/PageLayout'
import Box from '@mui/material/Box'
import PremiumTable, { TableSkeleton, TableEmptyState } from '../../../shared/components/PremiumTable'
import PremiumModal from '../../../shared/components/PremiumModal'
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined'
import axios from 'axios'
import { Button } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import SearchBar from '../../../shared/components/SearchBar'

export default function Deduc() {

  const [openModal, setOpenModal] = useState(false);
  const [value1, setValue1] = useState(null);
  const [value2, setValue2] = useState(null);

  const [deduc, setDeduc] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openModal1, setOpenModal1] = useState(false);
  const [deducview, setDeduc1] = useState([]);

  useEffect(() => {
    getDeduc();
  },[]);

  function getDeduc() {
    axios.get('http://localhost/Another1/APBS/api/user/deductions/').then(function (response) {
      console.log(response.data);
      setDeduc(response.data);
      setDeduc1(response.data);
    }).catch(function (error) {
      console.error('Error fetching deductions:', error);
    }).finally(function () {
      setLoading(false);
    });
  }
 
// Viewdeduct modal
const handleOpenModal1 = () => {
  setOpenModal1(true);
};
  // Closing the modal
  const handleCloseModal1 = () => {
    setOpenModal1(false);
  };

// Generate modal
  const handleOpenModal = () => {
    setValue1(null);
    setValue2(null);
    setOpenModal(true);
  };

  // Closing the modal
  const handleCloseModal = () => {
    setOpenModal(false);
  };

  return (
    <PageLayout title="Deductions">
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <SearchBar />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button color="primary" variant="outlined">List Deduction</Button>
          <Button color="primary" variant="contained" onClick={handleOpenModal}>Generate Deduction</Button>
        </Box>
      </Box>

        <PremiumTable minWidth={760}>
          <thead>
            <tr>
              <th style={{ width: '10%' }}>Deduction No.</th>
              <th style={{ width: '20%' }}>Date</th>
              <th style={{ width: '10%' }}>Year</th>
              <th style={{ width: '10%' }}>Month</th>
              <th style={{ width: '10%' }}>Period</th>
              <th style={{ width: '20%' }} >Configuration</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton rows={6} columns={['id', 'date', 'number', 'text', 'chip', 'buttons']} />
            ) : deduc.length === 0 ? (
              <TableEmptyState
                colSpan={6}
                icon={RequestQuoteOutlinedIcon}
                title="No deductions generated"
                description="Use “Generate Deduction” to create a deduction run for a date range."
              />
            ) : deduc.map((pay, key) => (
              <tr key={key}>
                <td style={{ cursor: 'pointer' }}>{}</td>
                <td style={{ cursor: 'pointer' }}>{}</td>
                <td style={{ cursor: 'pointer' }}>{}</td>
                <td style={{ cursor: 'pointer' }}>{}</td>
                <td style={{ cursor: 'pointer' }}>{}</td>
                <td>
                  <Button variant='contained' style={{marginRight: 5, width: '20%', fontSize: 12, fontWeight: 'bold'}} >Lock</Button>
                  <Button variant='contained' style={{width: '20%', fontSize: 12, fontWeight: 'bold'}} onClick={handleOpenModal1} > View </Button>
                  <Button variant='contained' style={{marginLeft: 5,width: '40%', fontSize: 12, fontWeight: 'bold'}} >Reprocess</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </PremiumTable>
        {/* Generate Modal */}
        <PremiumModal
          open={openModal}
          onClose={handleCloseModal}
          title="Generate Deduction"
          subtitle="Choose the date range to run deductions for."
          icon={RequestQuoteOutlinedIcon}
          maxWidth="xs"
          actions={
            <>
              <Button onClick={handleCloseModal}>Close</Button>
              <Button variant="contained" onClick={handleCloseModal}>
                Generate Deduction
              </Button>
            </>
          }
        >
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 0.5 }}>
              <DatePicker
                label="Start"
                value={value1}
                onChange={(newValue) => setValue1(newValue)}
              />
              <DatePicker
                label="End"
                value={value2}
                onChange={(newValue) => setValue2(newValue)}
              />
            </Box>
          </LocalizationProvider>
        </PremiumModal>
         
        {/* View Deduction Modal */}
        <PremiumModal
          open={openModal1}
          onClose={handleCloseModal1}
          title="Deductions"
          subtitle="Breakdown of this deduction run."
          icon={RequestQuoteOutlinedIcon}
          maxWidth="lg"
        >
              <PremiumTable containerSx={{ width: '100%' }}>
          <thead>
            <tr>
              <th style={{ width: '10%' }}>Deduction No.</th>
              <th style={{ width: '20%' }}>Name</th>
              <th style={{ width: '20%' }}>Goverment Distribution</th>
              <th style={{ width: '20%' }}>Loans</th>
              <th style={{ width: '20%' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {deducview.length === 0 ? (
              <TableEmptyState
                colSpan={5}
                icon={RequestQuoteOutlinedIcon}
                title="No deduction details"
                description="Details will appear here once this deduction run has entries."
              />
            ) : deducview.map((deduc, key) => (
              <tr key={key}>
                <td style={{ cursor: 'pointer' }}>{}</td>
                <td style={{ cursor: 'pointer' }}>{}</td>
                <td style={{ cursor: 'pointer' }}>{}</td>
                <td style={{ cursor: 'pointer' }}>{}</td>
                <td style={{ cursor: 'pointer' }}>{}</td>
              </tr>
            ))}
          </tbody>
        </PremiumTable>
        </PremiumModal>
    </PageLayout>
  );
}
