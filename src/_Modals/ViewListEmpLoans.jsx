import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import axios from 'axios';
import { Button, Modal, TextField, Autocomplete } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Tooltip from '@mui/material/Tooltip';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const drawerWidth = 240;

export default function ViewListEmpLoans({ onOpen, onClose, earningsData, empId }) {
  const [addallowance, setAddAllowance] = useState([]);

  // Log the received empId to ensure it's being passed correctly
  useEffect(() => {
    console.log('EmployeeBenefits - empId:', earningsData.empId); // This will log the empId prop received from the parent component
  }, [earningsData.empId]);

  useEffect(() => {
    console.log("AddAllowance:", addallowance);  // Check state here
  }, [addallowance]);

  // Fetch additional benefits when empId changes
  useEffect(() => {
    if (earningsData.empId) {
      fetchEmployeeAdditionalBenefits(earningsData.empId);
      fetchEmployeeEarningsid(earningsData.empId); // Fetch benefits using empId
    }
  }, [earningsData.empId]); // Trigger fetch whenever empId changes

  // Function to fetch additional benefits
  const fetchEmployeeAdditionalBenefits = async (id) => {
    try {
      const res = await axios.get(`http://localhost:8800/emp-additional-benifits/${id}`);
      console.log('Fetched data:', res.data); // Log the fetched data to check if the API is responding correctly
      setAddAllowance(res.data); // Store fetched data in state
    } catch (error) {
      console.error('Error fetching additional benefits:', error);
    }
  };

  const [employeeEarningsid, setEmployeeEarningsid] = useState(null); // Initialize state;

  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const [loading, setLoading] = useState(true);

  const fetchEmployeeEarningsid = async (id) => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8800/employee-table-earnings-id/${id}`);
      setEmployeeEarningsid(res.data);
      console.log('Fetched employee earnings data:', res.data);
    } catch (error) {
      console.error('Error fetching employee earnings:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    console.log('Updated employeeEarningsid:', employeeEarningsid);
  }, [employeeEarningsid]);

  const CurrencyDisplay = ({ amount, label }) => {
    const formattedAmount = new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);

    return (
      <Typography
        sx={{
          width: '100%',
          display: 'flex',
          fontWeight: 'bold',
          fontStyle: 'italic',
          color: 'red',
        }}
      >
        <span style={{ color: 'red', fontWeight: 'bold' }}>*</span>
        {formattedAmount} {label}
      </Typography>
    );
  };
  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setFilter('');
    onClose();

  };


  const [openModal, setOpenModal] = useState(false);

  const [filter, setFilter] = useState(''); // State to track the selected filter (Monthly/Annually)
  const [filteredData, setFilteredData] = useState([]); // State to store the filtered data
  const [data, setData] = useState([]); // State to store all fetched data

  // Fetch data based on the filter and empId
  useEffect(() => {
    const fetchFilteredData = async () => {
      console.log("Fetching data for empId:", earningsData.empId, "with filter:", filter);
      try {
        const res = await axios.get(`http://localhost:8800/emp-additional-benefits-filter/${earningsData.empId}/${filter}`);
        console.log('Fetched filtered data:', res.data);
        if (res.data && res.data.length === 0) {
          console.log('No data returned from the server');
        }
        setFilteredData(res.data);
      } catch (error) {
        console.error('Error fetching filtered data:', error);
      }
    };

    if (earningsData.empId && filter) {
      fetchFilteredData(); // Only fetch when empId and filter are set
    } else {
      console.log("No filter set, showing all data.");
      setFilteredData([]); // Clear filtered data when no filter is selected
    }
  }, [earningsData.empId, filter]);

  const handleFilterChange = (event, newValue) => {
    console.log('Filter changed to:', newValue);
    setFilter(newValue); // Update filter state when a selection is made

    // If 'All' is selected, ensure no filtering by type on the backend
    if (newValue === 'All') {
      console.log('Showing all data');
    }
  };


  const formatCurrency = (value) => {
    const formattedAmount = new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(value);

    return formattedAmount || 'PHP 0.00';
  };
  useEffect(() => {
    console.log('Filtered Data:', filteredData);
    console.log('All Allowance Data:', addallowance);
  }, [filteredData, addallowance]);

  return (
    <>
      <Modal
        open={onOpen}
        onClose={handleCloseModal}
        closeAfterTransition
      >
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
              width: { xs: '80%', sm: '80%', md: '60%' },
              height: { xs: '80%', sm: '60%', md: '80%' },
              boxShadow: 24,
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              overflowY: 'auto',
            }}
          >
            <CloseIcon onClick={handleCloseModal} sx={{ cursor: 'pointer', marginLeft: '96%' }} />
            <Typography variant="h4" component="h2" sx={{ marginBottom: 2, fontWeight: 'bold', textAlign: 'center', }}>
              Employee Loans
            </Typography>
            <Box sx={{ overscrollBehavior: 'contain' }}>
              <Typography variant="h5" component="h2" sx={{ marginBottom: 2, fontWeight: 'bold', textAlign: 'left', }}>
                Employee Information
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1, justifyContent: 'center' }}>
                <TextField
                  label="Employee ID"
                  value={earningsData.empId || 'N/A'} // Empty string if data is not yet loaded
                  inputProps={{ readOnly: true }}
                  sx={{ width: '20%', marginLeft: 1 }}
                />
                <TextField
                  label="Employee Name"
                  value={earningsData.fullName || 'N/A'} // Empty string if data is not yet loaded
                  inputProps={{ readOnly: true }}
                  sx={{ width: '60%', marginLeft: 1 }}
                />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 2, justifyContent: 'center' }}>
                {employeeEarningsid && employeeEarningsid.length > 0 ? (  // Check if there is data
                  <>
                    <TextField
                      label="Total De Minimis Benefits"
                      value={employeeEarningsid[0]?.total_de_minimis ? formatCurrency(employeeEarningsid[0].total_de_minimis) : formatCurrency(0)}
                      inputProps={{ readOnly: true }}
                      sx={{ width: '27%', marginLeft: 1 }}
                    />
                    <TextField
                      label="Total Additional Allowance"
                      value={employeeEarningsid[0]?.total_additional_benefits ? formatCurrency(employeeEarningsid[0].total_additional_benefits) : formatCurrency(0)}
                      inputProps={{ readOnly: true }}
                      sx={{ width: '27%', marginLeft: 1 }}
                    />
                    <TextField
                      label="Total Benefits and Allowance"
                      value={employeeEarningsid[0]?.grand_total_benefits ? formatCurrency(employeeEarningsid[0].grand_total_benefits) : formatCurrency(0)}
                      inputProps={{ readOnly: true }}
                      sx={{ width: '25%', marginLeft: 1 }}
                    />
                  </>
                ) : (
                  <p>Loading employee earnings data...</p>  // Loading message while data is being fetched
                )}
              </Box>


              <Box display="flex" sx={{ width: '100%', marginBottom: 1, marginTop: 2 }}>
                <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                  De Minimis Benefits
                </Typography>
              </Box>

              <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', fontStyle: 'italic', color: 'red', textAlign: 'left', width: '100%' }} >
                *Limit for Non-Taxable
              </Typography>

              <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', fontStyle: 'italic', textAlign: 'left', width: '100%', marginTop: 1 }} >
                Monthly
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1, justifyContent: 'center' }}>

                <Box sx={{ display: 'flex', flexDirection: 'column', marginLeft: 1, width: '23%' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                    <CurrencyDisplay amount={2000} label="Monthly" />
                    <Tooltip title="Rice subsidy (no more than Php 2,000 per month)" arrow placement="top">
                      <InfoOutlinedIcon sx={{ color: 'gray', marginLeft: 1, cursor: 'pointer', fontSize: 18, marginTop: 0.6 }} />
                    </Tooltip>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 1 }}>
                    <TextField
                      label="Rice Subsidy"
                      value={formatCurrency(earningsData.riceAllow)}
                      sx={{ width: '100%' }}
                    />
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', marginLeft: 1, width: '23%' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                    <CurrencyDisplay amount={500} label="Monthly" />
                    <Tooltip title="Uniform and clothing allowance (no more than Php 6,000 per year)" arrow placement="top">
                      <InfoOutlinedIcon sx={{ color: 'gray', marginLeft: 1, cursor: 'pointer', fontSize: 18, marginTop: 0.6 }} />
                    </Tooltip>
                  </Box>

                  <TextField
                    label="Uniform or Clothing Allowance"
                    value={formatCurrency(earningsData.clothingAllow)}
                    sx={{ width: '100%', marginTop: 1 }}
                  />
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', marginLeft: 1, width: '22%' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                    <CurrencyDisplay amount={300} label="Monthly" />
                    <Tooltip title="Laundry allowance (no more than Php 300 per month)" arrow placement="top">
                      <InfoOutlinedIcon sx={{ color: 'gray', marginLeft: 1, cursor: 'pointer', fontSize: 18, marginTop: 0.6 }} />
                    </Tooltip>
                  </Box>

                  <TextField
                    label="Laundry Allowance"
                    value={formatCurrency(earningsData.laundryAllow)}
                    sx={{ width: '100%', marginTop: 1 }}
                  />
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', marginLeft: 1, width: '22%' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                    <CurrencyDisplay amount={250} label="Monthly" />
                    <Tooltip title="Medical cash allowance to dependents (no more than Php 250 per month)" arrow placement="top">
                      <InfoOutlinedIcon sx={{ color: 'gray', marginLeft: 1, cursor: 'pointer', fontSize: 18, marginTop: 0.6 }} />
                    </Tooltip>
                  </Box>

                  <TextField
                    label="Medical Cash Allowance"
                    value={formatCurrency(earningsData.achivementAllow)}
                    sx={{ width: '100%', marginTop: 1 }}
                  />
                </Box>
              </Box>

              <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', fontStyle: 'italic', textAlign: 'left', width: '100%', marginTop: 1 }} >
                Annually
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1, justifyContent: 'center' }}>

                <Box sx={{ display: 'flex', flexDirection: 'column', marginLeft: 1, width: '46%' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                    <CurrencyDisplay amount={10000} label="Annual" />
                    <Tooltip title="Actual medical assistance, such as maternity assistance and other medical and healthcare needs (no more than Php 10,000 per year)" arrow placement="top">
                      <InfoOutlinedIcon sx={{ color: 'gray', marginLeft: 1, cursor: 'pointer', fontSize: 18, marginTop: 0.6 }} />
                    </Tooltip>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 1 }}>
                    <TextField
                      label="Achivement Awards"
                      value={formatCurrency(earningsData.achivementAllow)}
                      sx={{ width: '100%' }}
                    />
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', marginLeft: 1, width: '46%' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                    <CurrencyDisplay amount={10000} label="Annual" />
                    <Tooltip title="Employees’ achievement awards (no more than Php 10,000 in annual monetary value under an established written plan; not favoring highly-paid employees)" arrow placement="top">
                      <InfoOutlinedIcon sx={{ color: 'gray', marginLeft: 1, cursor: 'pointer', fontSize: 18, marginTop: 0.6 }} />
                    </Tooltip>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 1 }}>
                    <TextField
                      label="Actual Medical Assistance"
                      value={formatCurrency(earningsData.actualMedicalAssist)}
                      sx={{ width: '100%' }}
                    />
                  </Box>

                </Box>
              </Box>

              <Box display="flex" sx={{ width: '100%', marginBottom: 1, marginTop: 2 }}>
                <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                  Additonal Benefits or Allowance
                </Typography>
              </Box>

              <Box sx={{ justifyContent: 'space-between', display: 'flex', flexDirection: 'row' }}>

                <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', fontStyle: 'italic', color: 'red', textAlign: 'left' }} >
                  *Added Benifits or Allowance is Taxable
                </Typography>
                <Autocomplete
                  value={filter} // The current filter value
                  onChange={handleFilterChange} // Update filter when a selection is made
                  options={['Monthly', 'Annually']} // Options for filter
                  renderInput={(params) => (
                    <TextField {...params} label="Filter by" size="small" /> // Added size="small"
                  )}
                  sx={{ width: '20%' }} // Style the Autocomplete input
                />

              </Box>
              <Box sx={{ marginTop: 2, display: 'flex', gap: 2, flexDirection: 'column', alignItems: 'center' }}>
                {addallowance && addallowance.length > 0 ? (
                  // If a filter is applied, display filtered data
                  filter ? (
                    filteredData && filteredData.length > 0 ? (
                      filteredData.map((item, index) => (
                        <Box key={index} sx={{ display: 'flex', flexDirection: 'row', marginBottom: 2 }}>
                          <TextField
                            label="Allowance or Benefits Names"
                            value={item.allowance_name || ''}
                            InputProps={{ readOnly: true }}
                            sx={{ marginLeft: 1, width: '50%' }}
                          />
                          <TextField
                            label="Value"
                            value={formatCurrency(item.allowance_value)} // Assuming formatCurrency is defined
                            InputProps={{ readOnly: true }}
                            sx={{ marginLeft: 1, width: '30%' }}
                          />
                          <TextField
                            label="Type"
                            value={item.type || ''}
                            InputProps={{ readOnly: true }}
                            sx={{ marginLeft: 1, width: '20%' }}
                          />
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body1">
                        No data available for {filter} filter.
                      </Typography>
                    )
                  ) : (
                    // If no filter is applied, show all allowance data
                    addallowance.map((item, index) => (
                      <Box key={index} sx={{ display: 'flex', flexDirection: 'row', marginBottom: 2 }}>
                        <TextField
                          label="Allowance or Benefits Names"
                          value={item.allowance_name || ''}
                          InputProps={{ readOnly: true }}
                          sx={{ marginLeft: 1, width: '50%' }}
                        />
                        <TextField
                          label="Value"
                          value={formatCurrency(item.allowance_value)} // Assuming formatCurrency is defined
                          InputProps={{ readOnly: true }}
                          sx={{ marginLeft: 1, width: '30%' }}
                        />
                        <TextField
                          label="Type"
                          value={item.type || ''}
                          InputProps={{ readOnly: true }}
                          sx={{ marginLeft: 1, width: '20%' }}
                        />
                      </Box>
                    ))
                  )
                ) : (
                  <Typography variant="h6" color="textSecondary">
                    No Additional Allowance
                  </Typography>
                )}
              </Box>


            </Box>
          </Box>
        </Box>
      </Modal >
    </>
  );
}
