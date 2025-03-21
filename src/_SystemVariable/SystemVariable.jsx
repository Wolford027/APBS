import React, { useState, useEffect } from 'react'
import SideNav from '../Components/SideNav'
import Box from '@mui/material/Box'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import { Button, MenuItem, Select, TextField } from '@mui/material'
import AddDeducModal from '../_Modals/AddDeducModal'
import AddNprtrvModal from '../_Modals/AddNprtrvModal'
import AddLeaveModal from '../_Modals/AddLeaveType'
import AddDmbModal from '../_Modals/AddDmbModal'
import AddPayrollSettingsModal from '../_Modals/AddPayrollSettingsModal'
import axios from 'axios'

const drawerWidth = 240

export default function SystemVariable() {
  const [deductions, setDeductions] = useState([]);
  const [deducTitle, setDeducTitle] = useState('');
  const [deducModal, setDeducModal] = useState(false);
  const [dayValue, setDayValue] = useState('');
  const [isDayEditable, setIsDayEditable] = useState(true);
  const [timeStart, setTimeStart] = useState('');
  const [tax, setTax] = useState([]);
  const [payrollSettings, setPayrollSettings] = useState([]);
  const [payrollSettingsTitle, setPayrollSettingsTitle] = useState('');
  const [payrollSettingsModal, setPayrollSettingsModal] = useState(false);
  const [nprtrv, setNprtrv] = useState([]);
  const [nprtrvModal, setNprtrvModal] = useState(false);
  const [nprtrvTitle, setNprtrvTitle] = useState('');
  const [leaveType, setLeaveType] = useState('');
  const [leaveModal, setLeaveModal] = useState(false);
  const [leaveTitle, setLeaveTitle] = useState('');
  const [dmb, setDmb] = useState([]);
  const [dmbModal, setDmbModal] = useState(false);
  const [dmbTitle, setDmbTitle] = useState('');

  //Fetching Data
  useEffect(() => {
    FetchDmbData();
    FetchDeductionData();
    FetchPayrollSettingsData();
  }, []);

  const FetchDmbData = async () => {
    try {
      const response = await axios.get('http://localhost:8800/get-dmb');
      if (response.data) {
        setDmb(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch data', err);
    }
  };

  const FetchDeductionData = async () => {
    try {
      const response = await axios.get('http://localhost:8800/get-deduc');
      if (response.data) {
        setDeductions(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch data', err);
    }
  }

  const FetchPayrollSettingsData = async () => {
    try {
      const response = await axios.get('http://localhost:8800/get-payroll-settings');
      if (response.data) {
        setPayrollSettings(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch data', err);
    }
  }

  // Function to handle Input Changes
  const handleDeducChange = (index, newValue) => {
    setDeductions((prevDeductions) =>
      prevDeductions.map((deduc, i) =>
        i === index ? { ...deduc, deduc_value: newValue } : deduc
      )
    );
  };

  const handleDmbChange = (index, newValue) => {
    setDmb((prevDmb) =>
      prevDmb.map((dmb, i) =>
        i === index ? { ...dmb, dmb_value: newValue } : dmb
      )
    );
  };

  const handlePayrollSettingsChange = (index, newValue) => {
    setPayrollSettings((prevPayrollSettings) =>
      prevPayrollSettings.map((PayrollSettings, i) =>
        i === index ? { ...PayrollSettings, paysett_name: newValue } : PayrollSettings
      )
    );
  };

  // Functions to Open & Close Modals

    // Deduction Modal
  const OpenAddDeducModal = () => {
    setDeducModal(true);
  }
  
  const CloseAddDeducModal = () => {
    setDeducModal(false);
  }
    // De Minimis Benifit Modal
  const OpenAddDmbModal = () => {
    setDmbModal(true);
  }

  const CloseAddDmbModal = () => {
    setDmbModal(false);
  }
    // Payroll Settings Modal
  const OpenAddPayrollSettingsModal = () => {
    setPayrollSettingsModal(true);
  }

  const CloseAddPayrollSettingsModal = () => {
    setPayrollSettingsModal(false);
  }

  // Functions to Add, Save, Edit, & Remove
    //Deductions
  const AddDeductions = () => {
    if (deducTitle.trim()){
      setDeductions([...deductions, {deduc_name: deducTitle, deduc_value: '', editable: true}]);
    }
    CloseAddDeducModal();
  }

  const EditDeductions = (index) => {
    setDeductions((prevDeductions) =>
      prevDeductions.map((deduc, i) =>
        i === index ? { ...deduc, editable: true } : deduc
      )
    );
  };

  const RemoveDeductions = async (index) => {
    const deductionToRemove = deductions[index];
  
    console.log("Deduction to Remove:", deductionToRemove);
  
    if (!deductionToRemove.id && !deductionToRemove.deduc_id) {
      console.error("Deduction ID is missing:", deductionToRemove);
      return;
    }
  
    const deductionId = deductionToRemove.id || deductionToRemove.deduc_id;
  
    try {
      const response = await axios.delete(`http://localhost:8800/delete-deduc/${deductionId}`);
      if (response.status === 200) {
        setDeductions((prevDeductions) => prevDeductions.filter((_, i) => i !== index));
        console.log('Deduction removed successfully');
      } else {
        console.error('Failed to remove deduction', response.data);
      }
    } catch (err) {
      console.error('Error removing deduction', err);
    }
  };   

  const SaveDeductions = async (index) => {
    const DeducSave = deductions[index];
    try {
      const response = await axios.post('http://localhost:8800/save-deduc', {
        title: DeducSave.deduc_name,
        value: DeducSave.deduc_value,
      });
  
      if (response.status === 200) {
        const SaveNewDeduc = deductions.map((deduc, i) =>
          i === index ? { ...deduc, editable: false } : deduc
        );
        setDeductions(SaveNewDeduc);
        console.log('New Deduction saved successfully', response.data);
      } else {
        console.log('Failed to save a New Deduction', response.data);
      }
    } catch (err) {
      console.error('Failed to save a New Deduction', err);
    }
  };

    // De Minimis Benifit
  const AddDmb = () => {
    if (dmbTitle.trim()){
      setDmb([...dmb, {dmb_name: dmbTitle, dmb_value: '', editable: true}]);
    }
    CloseAddDeducModal();
  }

  const EditDmb = (index) => {
    setDmb((prevDmb) =>
      prevDmb.map((dmb, i) =>
        i === index ? { ...dmb, editable: true } : dmb
      )
    );
  }

  const RemoveDmb = async (index) => {
    const dmbToRemove = dmb[index];
  
    console.log("De Minimis Benifit to Remove:", dmbToRemove);
  
    if (!dmbToRemove.id && !dmbToRemove.dmb_id) {
      console.error("Deduction ID is missing:", dmbToRemove);
      return;
    }
  
    const dmbId = dmbToRemove.id || dmbToRemove.dmb_id;
  
    try {
      const response = await axios.delete(`http://localhost:8800/delete-dmb/${dmbId}`);
      if (response.status === 200) {
        setDmb((prevDmb) => prevDmb.filter((_, i) => i !== index));
        console.log('De Minimis Benifit removed successfully');
      } else {
        console.error('Failed to remove De Minimis Benifit', response.data);
      }
    } catch (err) {
      console.error('Error removing De Minimis Benifit', err);
    }
  };

  const SaveDmb = async (index) => {
    const DmbSave = dmb[index];
    try {
      const response = await axios.post('http://localhost:8800/save-dmb', {
        title: DmbSave.dmb_name,
        value: DmbSave.dmb_value,
      });
  
      if (response.status === 200) {
        const SaveNewDmb = dmb.map((dmb, i) =>
          i === index ? { ...dmb, editable: false } : dmb
        );
        setDmb(SaveNewDmb);
        console.log('New Deduction saved successfully', response.data);
      } else {
        console.log('Failed to save a New Deduction', response.data);
      }
    } catch (err) {
      console.error('Failed to save a New Deduction', err);
    }
  }

    // Payroll Settings
  const AddPayrollSettings = () => {
    if (payrollSettingsTitle.trim()){
      setPayrollSettings([...payrollSettings, {paysett_name: dmbTitle, editable: true}]);
    }
    CloseAddPayrollSettingsModal();
  }

  const EditPayrollSettings = (index) => {
    setPayrollSettings((prevPayrollSettings) =>
      prevPayrollSettings.map((PayrollSettings, i) =>
        i === index ? { ...PayrollSettings, editable: true } : PayrollSettings
      )
    );
  }

  const RemovePayrollSettings = async (index) => {
    const payrollSettingsToRemove = payrollSettings[index];
  
    console.log("Holiday or Contribution to Remove:", payrollSettingsToRemove);
  
    if (!payrollSettingsToRemove.id && !payrollSettingsToRemove.paysett_id) {
      console.error("Payroll Setting ID is missing:", payrollSettingsToRemove);
      return;
    }
  
    const PayrollSettingsId = payrollSettingsToRemove.id || payrollSettingsToRemove.paysett_id;
  
    try {
      const response = await axios.delete(`http://localhost:8800/delete-payroll-settings/${PayrollSettingsId}`);
      if (response.status === 200) {
        setPayrollSettings((prevPayrollSettings) => prevPayrollSettings.filter((_, i) => i !== index));
        console.log('Payroll Settings removed successfully');
      } else {
        console.error('Failed to remove Payroll Settings', response.data);
      }
    } catch (err) {
      console.error('Error removing Payroll Settings', err);
    }
  };

  const SavePayrollSettings = async (index) => {
    const payrollSetting = payrollSettings[index];
  
    console.log("Saving Payroll Setting:", payrollSetting);
  
    try {
      const response = await axios.post("http://localhost:8800/save-payroll-settings", {
        paysett_id: payrollSetting.paysett_id || null,
        paysett_name: payrollSetting.paysett_name,
      });
  
      if (response.status === 200) {
        setPayrollSettings((prevPayrollSettings) =>
          prevPayrollSettings.map((item, i) =>
            i === index ? { ...item, editable: false } : item
          )
        );
        console.log("Payroll setting saved successfully");
      }
    } catch (err) {
      console.error("Error saving Payroll setting", err);
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <SideNav />
      <AppBar
        position="fixed"
        sx={{ width: { sm: `calc(100% - ${drawerWidth}px)` }, ml: { sm: `${drawerWidth}px` } }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            System Variable
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3, mt: 8, ml: -12 }}>
        {/* De Minimis Benifit Type Section */}
        <Box sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 2, mb: 3 }}>
          <Typography variant="h4" fontWeight="bold" sx={{ color: '#1976d2', mb: 2}}>
            De Minimis Benifit Type
          </Typography>
          <Button variant="contained" color="primary" sx={{ mb: 2 }} onClick={OpenAddDmbModal}>
            Add De Minimis Benifit Type
          </Button>
          
          <Box
            sx={{mt: 1, height: '300px', overflow: 'auto', border: '1px solid #e0e0e0', padding: 2}}
            >
            {dmb.length > 0 ? (
              dmb.map((dmb, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body1" sx={{ mr: 2, width: '80px' }}>{dmb.dmb_name || dmb.title}</Typography>
                  <TextField
                    value={dmb.dmb_value}
                    onChange={(e) => handleDmbChange(index, e.target.value)}
                    variant='outlined'
                    sx={{
                      mr: 2,
                      '& .MuiInputBase-input.Mui-disabled': {
                        color: 'rgba(0, 0, 0, 0.6)',
                      }, ml: 'auto'
                    }}
                    InputProps={{
                      startAdornment: <Typography variant="body1" sx={{ mr: 1 }}>₱</Typography>,
                      readOnly: !dmb.editable,
                    }}
                    inputProps={{
                      inputMode: 'numeric',
                      style: { color: dmb.editable ? 'rgba(0, 0, 0, 1)' : 'rgba(0, 0, 0, 0.6)' },
                    }}
                  />
                  {dmb.editable ? (
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="outlined" onClick={() => SaveDmb(index)}>
                      Save
                    </Button>
                    <Button variant="outlined" onClick={() => RemoveDmb(index)}>
                      Remove
                    </Button>
                  </Box>
                ) : (
                  <Button variant="outlined" onClick={() => EditDmb(index)}>
                    Edit
                  </Button>
                )}
                </Box>
              ))
            ) : (
              <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.6)', textAlign: 'center' }}>
                No Deduction available
              </Typography>
            )}
            </Box>
          <Divider />
          <AddDmbModal />
        </Box>
          
          {/* Deductions Section */}
          <Box sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 2, mb: 3 }}>
            <Typography variant="h4" fontWeight="bold" sx={{ color: '#1976d2', mb: 2}}>
              Deductions
            </Typography>
            <Button variant="contained" color="primary" sx={{ mb: 2 }} onClick={OpenAddDeducModal}>
              Add Deductions
            </Button>
            <Box
              sx={{mt: 1, height: '300px', overflow: 'auto', border: '1px solid #e0e0e0', padding: 2}}
              >
              {deductions.length > 0 ? (
                deductions.map((deduc, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body1" sx={{ mr: 2, width: '80px' }}>{deduc.deduc_name || deduc.title}</Typography>
                    <TextField
                      value={deduc.deduc_value}
                      onChange={(e) => handleDeducChange(index, e.target.value)}
                      variant='outlined'
                      sx={{
                        mr: 2,
                        '& .MuiInputBase-input.Mui-disabled': {
                          color: 'rgba(0, 0, 0, 0.6)',
                        }, ml: 'auto'
                      }}
                      InputProps={{
                        startAdornment: <Typography variant="body1" sx={{ mr: 1 }}>₱</Typography>,
                        readOnly: !deduc.editable,
                      }}
                      inputProps={{
                        inputMode: 'numeric',
                        style: { color: deduc.editable ? 'rgba(0, 0, 0, 1)' : 'rgba(0, 0, 0, 0.6)' },
                      }}
                    />
                    {deduc.editable ? (
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button variant="outlined" onClick={() => SaveDeductions(index)}>
                        Save
                      </Button>
                      <Button variant="outlined" onClick={() => RemoveDeductions(index)}>
                        Remove
                      </Button>
                    </Box>
                  ) : (
                    <Button variant="outlined" onClick={() => EditDeductions(index)}>
                      Edit
                    </Button>
                  )}
                  </Box>
                ))
              ) : (
                <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.6)', textAlign: 'center' }}>
                  No Deduction available
                </Typography>
              )}
            </Box>
            <Divider />
          </Box>

          {/* Payroll Settings */}
          <Box sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 2, mb: 3 }}>
            <Typography variant='h4' fontWeight='bold' sx={{ color: '#1976d2', mb: 2 }}>
              Payroll Settings
            </Typography>
            <Button variant='contained' color='primary' sx={{ mb: 2 }} onClick={OpenAddPayrollSettingsModal}>
              Add Holidays or Contributions
            </Button>
            <Box sx={{mt: 1, height: '300px', overflow: 'auto', border: '1px solid #e0e0e0', padding: 2}}>
              {payrollSettings.length > 0 ? (
                payrollSettings.map((payroll, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant='body1' sx={{ mr: 2, width: '80px' }}>{payroll.paysett_name || payroll.title}</Typography>
                    <TextField
                      value={payroll.paysett_name}
                      onChange={(e) => handlePayrollSettingsChange(index, e.target.value)}
                      variant='outlined'
                      sx={{
                        mr: 2,
                        '& .MuiInputBase-input.Mui-disabled': {
                          color: 'rgba(0, 0, 0, 0.6)',
                        }, ml: 'auto'
                      }}
                      InputProps={{
                        readOnly: !payroll.editable,
                      }}
                      inputProps={{
                        inputMode: 'numeric',
                        style: { color: payroll.editable ? 'rgba(0, 0, 0, 1)' : 'rgba(0, 0, 0, 0.6)' },
                      }}
                    />
                    {payroll.editable ? (
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button variant='outlined' onClick={() => SavePayrollSettings(index)}>
                        Save
                      </Button>
                      <Button variant='outlined' onClick={() => RemovePayrollSettings(index)}>
                        Remove
                      </Button>
                    </Box>
                  ) : (
                    <Button variant='outlined' onClick={() => EditPayrollSettings(index)}>
                      Edit
                    </Button>
                  )}
                  </Box>
                ))
              ) : (
                <Typography variant='body2' sx={{ color: 'rgba(0, 0, 0, 0.6)', textAlign: 'center' }}>
                  No Holidays or Contributions available
                </Typography>
              )}
            </Box>
          </Box>

      </Box>
      <AddDeducModal
        onOpen={deducModal}
        onClose={CloseAddDeducModal}
        onAdd={AddDeductions}
        onValue={deducTitle}
        onChange={(e) => setDeducTitle(e.target.value)}
      />
      <AddDmbModal
        onOpen={dmbModal}
        onClose={CloseAddDmbModal}
        onAdd={AddDmb}
        onValue={dmbTitle}
        onChange={(e) => setDmbTitle(e.target.value)}
      />
      <AddPayrollSettingsModal
        onOpen={payrollSettingsModal}
        onClose={CloseAddPayrollSettingsModal}
        onAdd={AddPayrollSettings}
        onValue={payrollSettingsTitle}
        onChange={(e) => setPayrollSettingsTitle(e.target.value)}
      />
    </Box>
  )
}
