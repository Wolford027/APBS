import React, { useState, useEffect } from 'react'
import PageLayout from '../../../shared/components/PageLayout'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Button, Chip, Grid, InputAdornment, Paper, TextField, alpha } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined'
import { motion } from 'motion/react'
import { staggerContainer, staggerItem } from '../../../shared/animations'
import AddDeducModal from '../components/AddDeducModal'
import AddNprtrvModal from '../components/AddNprtrvModal'
import AddLeaveTypeModal from '../components/AddLeaveTypeModal'
import AddLoanTypeModal from '../components/AddLoanTypeModal'
import AddDmbModal from '../components/AddDmbModal'
import AddPayrollSettingsModal from '../components/AddPayrollSettingsModal'
import AddEmpTypeModal from '../components/AddEmpTypeModal'
import AddCivilStatusModal from '../components/AddCivilStatusModal'
import AddSexModal from '../components/AddSexModal'
import AddRateValueModal from '../components/AddRateValueModal'
import axios from 'axios'
import { useAuth } from '../../Auth/hooks/AuthContext'

function SectionCard({ title, description, count, buttonLabel, onAdd, emptyText, children }) {
  return (
    <Grid item xs={12} lg={6}>
      <Paper
        component={motion.div}
        variants={staggerItem}
        elevation={0}
        sx={{
          border: 1,
          borderColor: 'divider',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 2.5, pb: 2, display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {title}
              </Typography>
              <Chip
                label={count}
                size="small"
                sx={{
                  height: 20,
                  fontWeight: 600,
                  color: 'primary.main',
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              {description}
            </Typography>
          </Box>
          <Button
            size="small"
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={onAdd}
            sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
          >
            {buttonLabel}
          </Button>
        </Box>
        <Box
          sx={{
            borderTop: 1,
            borderColor: 'divider',
            flexGrow: 1,
            maxHeight: 320,
            overflow: 'auto',
            '& > *:not(:last-child)': { borderBottom: 1, borderColor: 'divider' },
          }}
        >
          {count === 0 ? (
            <Box
              sx={{
                py: 6,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
                color: 'text.secondary',
              }}
            >
              <InboxOutlinedIcon sx={{ fontSize: 32, opacity: 0.4 }} />
              <Typography variant="body2">{emptyText}</Typography>
            </Box>
          ) : (
            children
          )}
        </Box>
      </Paper>
    </Grid>
  );
}

function VariableRow({ label, value, onChange, editable, currency, onSave, onRemove, onEdit }) {
  return (
    <Box
      sx={{
        px: 2.5,
        py: 1.5,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        transition: 'background-color 0.15s ease',
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      {label !== undefined && (
        <Typography variant="body2" noWrap title={label} sx={{ fontWeight: 500, width: 150, flexShrink: 0 }}>
          {label}
        </Typography>
      )}
      {editable ? (
        <TextField
          value={value ?? ''}
          onChange={onChange}
          fullWidth
          InputProps={
            currency
              ? { startAdornment: <InputAdornment position="start">₱</InputAdornment> }
              : undefined
          }
          inputProps={currency ? { inputMode: 'numeric' } : undefined}
        />
      ) : (
        <Typography
          variant="body2"
          noWrap
          sx={{
            flexGrow: 1,
            minWidth: 0,
            color: label !== undefined ? 'text.secondary' : 'text.primary',
            fontWeight: label !== undefined ? 400 : 500,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {currency && value !== '' && value != null ? `₱ ${value}` : value}
        </Typography>
      )}
      <Box sx={{ display: 'flex', gap: 1, flexShrink: 0, ml: 'auto' }}>
        {editable ? (
          <>
            <Button size="small" variant="contained" onClick={onSave}>
              Save
            </Button>
            <Button size="small" variant="outlined" color="error" onClick={onRemove}>
              Remove
            </Button>
          </>
        ) : (
          <Button size="small" variant="outlined" onClick={onEdit}>
            Edit
          </Button>
        )}
      </Box>
    </Box>
  );
}

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
  const [leaveType, setLeaveType] = useState([]);
  const [leaveTypeModal, setLeaveTypeModal] = useState(false);
  const [leaveTypeTitle, setLeaveTypeTitle] = useState('');
  const [dmb, setDmb] = useState([]);
  const [dmbModal, setDmbModal] = useState(false);
  const [dmbTitle, setDmbTitle] = useState('');
  const [loanType, setLoanType] = useState([]);
  const [loanTypeModal, setLoanTypeModal] = useState(false);
  const [loanTypeTitle, setLoanTypeTitle] = useState('');
  const [employmentType, setEmploymentType] = useState([]);
  const [employmentTypeModal, setEmploymentTypeModal] = useState(false);
  const [employmentTypeTitle, setEmploymentTypeTitle] = useState('');
  const [civilStatus, setCivilStatus] = useState([]);
  const [civilStatusModal, setCivilStatusModal] = useState(false);
  const [civilStatusTitle, setCivilStatusTitle] = useState('');
  const [sex, setSex] = useState([]);
  const [sexModal, setSexModal] = useState(false);
  const [sexTitle, setSexTitle] = useState('');
  const [rateValue, setRateValue] = useState([]);
  const [rateValueModal, setRateValueModal] = useState(false);
  const [rateValueTitle, setRateValueTitle] = useState('');
  const { role, username } = useAuth();


  //Fetching Data
  useEffect(() => {
    FetchDmbData();
    FetchDeductionData();
    FetchPayrollSettingsData();
    FetchLeaveTypeData();
    FetchLoanTypeData();
    FetchEmploymentTypeData();
    FetchCivilStatusData();
    FetchSexsData();
    FetchRateValueData();
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

  const FetchLeaveTypeData = async () => {
    try {
      const response = await axios.get('http://localhost:8800/get-leave-type');
      if (response.data) {
        setLeaveType(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch data', err);
    }
  }

  const FetchLoanTypeData = async () => {
    try {
      const response = await axios.get('http://localhost:8800/get-loan-type');
      if (response.data) {
        setLoanType(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch data', err);
    }
  }

  const FetchEmploymentTypeData = async () => {
    try {
      const response = await axios.get('http://localhost:8800/get-employment-type');
      if (response.data) {
        setEmploymentType(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch data', err);
    }
  }

  const FetchCivilStatusData = async () => {
    try {
      const response = await axios.get('http://localhost:8800/get-civil-status');
      if (response.data) {
        setCivilStatus(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch data', err);
    }
  }

  const FetchSexsData = async () => {
    try {
      const response = await axios.get('http://localhost:8800/get-sex');
      if (response.data) {
        setSex(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch data', err);
    }
  }

  const FetchRateValueData = async () => {
    try {
      const response = await axios.get('http://localhost:8800/get-rate-value');
      if (response.data) {
        setRateValue(response.data);
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

  const handleLeaveTypeChange = (index, newValue) => {
    setLeaveType((prevLeaveType) =>
      prevLeaveType.map((LeaveType, i) =>
        i === index ? { ...LeaveType, leave_type_name: newValue } : LeaveType
      )
    );
  };

  const handleLoanTypeChange = (index, newValue) => {
    setLoanType((prevLoanType) =>
      prevLoanType.map((LoanType, i) =>
        i === index ? { ...LoanType, goverment_name: newValue } : LoanType
      )
    );
  };

  const handleEmploymentTypeChange = (index, newValue) => {
    setEmploymentType((prevEmploymentType) =>
      prevEmploymentType.map((EmploymentType, i) =>
        i === index ? { ...EmploymentType, employment_type_name: newValue } : EmploymentType
      )
    );
  };

  const handleCivilStatusChange = (index, newValue) => {
    setCivilStatus((prevCivilStatus) =>
      prevCivilStatus.map((CivilStatus, i) =>
        i === index ? { ...CivilStatus, cs_name: newValue } : CivilStatus
      )
    );
  };

  const handleSexChange = (index, newValue) => {
    setSex((prevSex) =>
      prevSex.map((Sex, i) =>
        i === index ? { ...Sex, sex_name: newValue } : Sex
      )
    );
  };

  const handleRateValueChange = (index, newValue) => {
    setRateValue((prevRateValue) =>
      prevRateValue.map((RateValue, i) =>
        i === index ? { ...RateValue, value: newValue } : RateValue
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

  //Leave Type Modal
  const OpenAddLeaveTypeModal = () => {
    setLeaveTypeModal(true);
  }
  const CloseAddLeaveTypeModal = () => {
    setLeaveTypeModal(false);
  }

  //Loan Type Modal
  const OpenAddLoanTypeModal = () => {
    setLoanTypeModal(true);
  }
  const CloseAddLoanTypeModal = () => {
    setLoanTypeModal(false);
  }

  //Employment Type Modal
  const OpenAddEmploymentTypeModal = () => {
    setEmploymentTypeModal(true);
  }
  const CloseAddEmploymentTypeModal = () => {
    setEmploymentTypeModal(false);
  }

  //Civil Status Modal
  const OpenAddCivilStatusModal = () => {
    setCivilStatusModal(true);
  }
  const CloseAddCivilStatusModal = () => {
    setCivilStatusModal(false);
  }

  //Sex Modal
  const OpenAddSexModal = () => {
    setSexModal(true);
  }
  const CloseAddSexModal = () => {
    setSexModal(false);
  }

  //Rate Value Modal
  const OpenAddRateValueModal = () => {
    setRateValueModal(true);
  }
  const CloseAddRateValueModal = () => {
    setRateValueModal(false);
  }



  // Functions to Add, Save, Edit, & Remove
  
  //Deductions
  const AddDeductions = () => {
    if (deducTitle.trim()){
      setDeductions([...deductions, {deduc_name: deducTitle, deduc_value: '', editable: true}]);

      // Log the audit trail
      let today = new Date();
      let formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} ${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;

      const auditLog = {
          username: username || "Unknown",  // Get username from context
          date: formattedDate,
          role: role || "Unknown",  // Get role from context
          action: `Added a new deduction: ${deducTitle}`  // Action taken
      };

      // Send audit log to backend
      axios.post("http://localhost:8800/audit", auditLog)
          .then(() => console.log("Audit trail logged"))
          .catch(err => console.error("Error logging audit trail:", err));
    }
    CloseAddDeducModal();
  }

  const EditDeductions = (index) => {
    setDeductions((prevDeductions) =>
      prevDeductions.map((deduc, i) =>
        i === index ? { ...deduc, editable: true } : deduc
      )
    );

    // Log the audit trail
    let today = new Date();
    let formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} ${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;

    const auditLog = {
        username: username || "Unknown",  // Get username from context
        date: formattedDate,
        role: role || "Unknown",  // Get role from context
        action: `Edited deduction: ${deductions[index].deduc_name}`  // Action taken
    };

    // Send audit log to backend
    axios.post("http://localhost:8800/audit", auditLog)
        .then(() => console.log("Audit trail logged"))
        .catch(err => console.error("Error logging audit trail:", err));
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
      // Log the audit trail
      let today = new Date();
      let formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} ${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;

      const auditLog = {
          username: username || "Unknown",  // Get username from context
          date: formattedDate,
          role: role || "Unknown",  // Get role from context
          action: `The selected deduction has been removed.`  // Action taken
      };

      // Send audit log to backend
      axios.post("http://localhost:8800/audit", auditLog)
          .then(() => console.log("Audit trail logged"))
          .catch(err => console.error("Error logging audit trail:", err));

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

      // Log the audit trail
      let today = new Date();
      let formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} ${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;

      const auditLog = {
          username: username || "Unknown",  // Get username from context
          date: formattedDate,
          role: role || "Unknown",  // Get role from context
          action: `Added a new De Minimis Benifit: ${dmbTitle}`  // Action taken
      };

      // Send audit log to backend
      axios.post("http://localhost:8800/audit", auditLog)
          .then(() => console.log("Audit trail logged"))
          .catch(err => console.error("Error logging audit trail:", err));
    }
    CloseAddDeducModal();
  }

  const EditDmb = (index) => {
    setDmb((prevDmb) =>
      prevDmb.map((dmb, i) =>
        i === index ? { ...dmb, editable: true } : dmb
      )
    );

    // Log the audit trail
    let today = new Date();
    let formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} ${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;

    const auditLog = {
        username: username || "Unknown",  // Get username from context
        date: formattedDate,
        role: role || "Unknown",  // Get role from context
        action: `Edited De Minimis Benifit: ${dmbTitle[index].dmb_name}`  // Action taken
    };

    // Send audit log to backend
    axios.post("http://localhost:8800/audit", auditLog)
        .then(() => console.log("Audit trail logged"))
        .catch(err => console.error("Error logging audit trail:", err));
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
      // Log the audit trail
      let today = new Date();
      let formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} ${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;

      const auditLog = {
          username: username || "Unknown",  // Get username from context
          date: formattedDate,
          role: role || "Unknown",  // Get role from context
          action: `The selected De Minimis Benifit has been removed.`  // Action taken
      };

      // Send audit log to backend
      axios.post("http://localhost:8800/audit", auditLog)
          .then(() => console.log("Audit trail logged"))
          .catch(err => console.error("Error logging audit trail:", err));

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
      setPayrollSettings([...payrollSettings, {paysett_name: payrollSettingsTitle, editable: true}]);
      
      // Log the audit trail
      let today = new Date();
      let formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} ${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;

      const auditLog = {
          username: username || "Unknown",  // Get username from context
          date: formattedDate,
          role: role || "Unknown",  // Get role from context
          action: `Added a new Payroll Settings: ${payrollSettingsTitle}`  // Action taken
      };

      // Send audit log to backend
      axios.post("http://localhost:8800/audit", auditLog)
          .then(() => console.log("Audit trail logged"))
          .catch(err => console.error("Error logging audit trail:", err));
    }
    CloseAddPayrollSettingsModal();
  }

  const EditPayrollSettings = (index) => {
    setPayrollSettings((prevPayrollSettings) =>
      prevPayrollSettings.map((PayrollSettings, i) =>
        i === index ? { ...PayrollSettings, editable: true } : PayrollSettings
      )
    );
    // Log the audit trail
    let today = new Date();
    let formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} ${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;

    const auditLog = {
        username: username || "Unknown",  // Get username from context
        date: formattedDate,
        role: role || "Unknown",  // Get role from context
        action: `Edited Payroll Settings: ${payrollSettings[index].paysett_name}`  // Action taken
    };

    // Send audit log to backend
    axios.post("http://localhost:8800/audit", auditLog)
        .then(() => console.log("Audit trail logged"))
        .catch(err => console.error("Error logging audit trail:", err));
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
      // Log the audit trail
      let today = new Date();
      let formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} ${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;

      const auditLog = {
          username: username || "Unknown",  // Get username from context
          date: formattedDate,
          role: role || "Unknown",  // Get role from context
          action: `The selected Payroll Settings has been removed.`  // Action taken
      };

      // Send audit log to backend
      axios.post("http://localhost:8800/audit", auditLog)
          .then(() => console.log("Audit trail logged"))
          .catch(err => console.error("Error logging audit trail:", err));

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
        const newId = response.data.paysett_id;
        setPayrollSettings((prevPayrollSettings) =>
          prevPayrollSettings.map((item, i) =>
            i === index ? { ...item, paysett_id: newId, editable: false } : item
          )
        );
        console.log("Payroll setting saved successfully");
      }
    } catch (err) {
      console.error("Error saving Payroll setting", err);
    }
  };

  // Leave Type
  const AddLeaveType = () => {
    if (leaveTypeTitle.trim()){
      setLeaveType([...leaveType, {leave_type_name: leaveTypeTitle, editable: true}]);

      // Log the audit trail
      let today = new Date();
      let formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} ${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;

      const auditLog = {
          username: username || "Unknown",  // Get username from context
          date: formattedDate,
          role: role || "Unknown",  // Get role from context
          action: `Added a new Leave Type: ${leaveTypeTitle}`  // Action taken
      };

      // Send audit log to backend
      axios.post("http://localhost:8800/audit", auditLog)
          .then(() => console.log("Audit trail logged"))
          .catch(err => console.error("Error logging audit trail:", err));
    }
    CloseAddLeaveTypeModal();
  }

  const EditLeaveType = (index) => {
    setLeaveType((prevLeaveType) =>
      prevLeaveType.map((LeaveType, i) =>
        i === index ? { ...LeaveType, editable: true } : LeaveType
      )
    );
    // Log the audit trail
    let today = new Date();
    let formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} ${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;

    const auditLog = {
        username: username || "Unknown",  // Get username from context
        date: formattedDate,
        role: role || "Unknown",  // Get role from context
        action: `Edited Payroll Settings: ${leaveType[index].leave_type_name}`  // Action taken
    };

    // Send audit log to backend
    axios.post("http://localhost:8800/audit", auditLog)
        .then(() => console.log("Audit trail logged"))
        .catch(err => console.error("Error logging audit trail:", err));
  }

  const RemoveLeaveType = async (index) => {
    const leaveTypeToRemove = leaveType[index];
  
    console.log("Leave Type to Remove:", leaveTypeToRemove);
  
    if (!leaveTypeToRemove.id && !leaveTypeToRemove.emp_leave_type_id) {
      console.error("Leave Type ID is missing:", leaveTypeToRemove);
      return;
    }
  
    const LeaveTypeId = leaveTypeToRemove.id || leaveTypeToRemove.emp_leave_type_id;
  
    try {
      // Log the audit trail
      let today = new Date();
      let formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} ${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;

      const auditLog = {
          username: username || "Unknown",  // Get username from context
          date: formattedDate,
          role: role || "Unknown",  // Get role from context
          action: `The selected Payroll Settings has been removed.`  // Action taken
      };

      // Send audit log to backend
      axios.post("http://localhost:8800/audit", auditLog)
          .then(() => console.log("Audit trail logged"))
          .catch(err => console.error("Error logging audit trail:", err));

      const response = await axios.delete(`http://localhost:8800/delete-leave-type/${LeaveTypeId}`);
      if (response.status === 200) {
        setLeaveType((prevLeaveType) => prevLeaveType.filter((_, i) => i !== index));
        console.log('Leave Type removed successfully');
      } else {
        console.error('Failed to remove Leave Type', response.data);
      }
    } catch (err) {
      console.error('Error removing Leave Type', err);
    }
  };

  const SaveLeaveType = async (index) => {
    const leaveTypeToSave = leaveType[index];
  
    try {
      const response = await axios.post("http://localhost:8800/save-leave-type", {
        emp_leave_type_id: leaveTypeToSave.emp_leave_type_id || null,
        leave_type_name: leaveTypeToSave.leave_type_name,
      });
  
      if (response.status === 200) {
        const newId = response.data.emp_leave_type_id;
        setLeaveType((prevLeaveType) =>
          prevLeaveType.map((item, i) =>
            i === index
              ? { ...item, emp_leave_type_id: newId, editable: false } : item
          )
        );
  
        console.log("Leave Type saved successfully");
      }
    } catch (err) {
      console.error("Error saving Leave Type", err);
    }
  };  

  //Loan Type
  const AddLoanType = () => {
    if (loanTypeTitle.trim()){
      setLoanType([...loanType, {loan_type_name: loanTypeTitle, editable: true}]);

      // Log the audit trail
      let today = new Date();
      let formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} ${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;

      const auditLog = {
          username: username || "Unknown",  // Get username from context
          date: formattedDate,
          role: role || "Unknown",  // Get role from context
          action: `Added a new Loan Type: ${loanTypeTitle}`  // Action taken
      };

      // Send audit log to backend
      axios.post("http://localhost:8800/audit", auditLog)
          .then(() => console.log("Audit trail logged"))
          .catch(err => console.error("Error logging audit trail:", err));
    }
    CloseAddLoanTypeModal();
  }

  const EditLoanType = (index) => {
    setLoanType((prevLoanType) =>
      prevLoanType.map((LoanType, i) =>
        i === index ? { ...LoanType, editable: true } : LoanType
      )
    );
    // Log the audit trail
    let today = new Date();
    let formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} ${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;

    const auditLog = {
        username: username || "Unknown",  // Get username from context
        date: formattedDate,
        role: role || "Unknown",  // Get role from context
        action: `Edited Loan Type: ${loanType[index].goverment_name}`  // Action taken
    };

    // Send audit log to backend
    axios.post("http://localhost:8800/audit", auditLog)
        .then(() => console.log("Audit trail logged"))
        .catch(err => console.error("Error logging audit trail:", err));
  }

  const RemoveLoanType = async (index) => {
    const loanTypeToRemove = loanType[index];
  
    console.log("Loan Type to Remove:", loanTypeToRemove);
  
    if (!loanTypeToRemove.id && !loanTypeToRemove.emp_loan_type_id) {
      console.error("Loan Type ID is missing:", loanTypeToRemove);
      return;
    }
  
    const LoanTypeId = loanTypeToRemove.id || loanTypeToRemove.emp_loan_type_id;
  
    try {
      // Log the audit trail
      let today = new Date();
      let formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} ${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;

      const auditLog = {
          username: username || "Unknown",  // Get username from context
          date: formattedDate,
          role: role || "Unknown",  // Get role from context
          action: `The selected Loan Type has been removed.`  // Action taken
      };

      // Send audit log to backend
      axios.post("http://localhost:8800/audit", auditLog)
          .then(() => console.log("Audit trail logged"))
          .catch(err => console.error("Error logging audit trail:", err));

      const response = await axios.delete(`http://localhost:8800/delete-loan-type/${LoanTypeId}`);
      if (response.status === 200) {
        setLeaveType((prevLoanType) => prevLoanType.filter((_, i) => i !== index));
        console.log('Loan Type removed successfully');
      } else {
        console.error('Failed to remove Loan Type', response.data);
      }
    } catch (err) {
      console.error('Error removing Loan Type', err);
    }
  };

  const SaveLoanType = async (index) => {
    const loanTypeToSave = loanType[index];
  
    console.log("Saving Loan Type:", loanTypeToSave);
  
    try {
      const response = await axios.post("http://localhost:8800/save-loan-type", {
        emp_loan_type_id: loanTypeToSave.emp_loan_type_id || null,
        goverment_name: loanTypeToSave.goverment_name,
      });
  
      if (response.status === 200) {
        const newId = response.data.emp_loan_type_id;
        setLoanType((prevLoanType) =>
          prevLoanType.map((item, i) =>
            i === index ? { ...item, emp_loan_type_id: newId, editable: false } : item
          )
        );
        console.log("Loan Type saved successfully");
      }
    } catch (err) {
      console.error("Error saving Loan Type", err);
    }
  };

  //Employment Type
  const AddEmploymentType = () => {
    if (employmentTypeTitle.trim()){
      setEmploymentType([...employmentType, {employment_type_name: employmentTypeTitle, editable: true}]);

      // Log the audit trail
      let today = new Date();
      let formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} ${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;

      const auditLog = {
          username: username || "Unknown",  // Get username from context
          date: formattedDate,
          role: role || "Unknown",  // Get role from context
          action: `Added a new Employment Type: ${employmentTypeTitle}`  // Action taken
      };

      // Send audit log to backend
      axios.post("http://localhost:8800/audit", auditLog)
          .then(() => console.log("Audit trail logged"))
          .catch(err => console.error("Error logging audit trail:", err));
    }
    CloseAddEmploymentTypeModal();
  }

  const EditEmploymentType = (index) => {
    setEmploymentType((prevEmploymentType) =>
      prevEmploymentType.map((EmploymentType, i) =>
        i === index ? { ...EmploymentType, editable: true } : EmploymentType
      )
    );
    // Log the audit trail
    let today = new Date();
    let formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} ${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;

    const auditLog = {
        username: username || "Unknown",  // Get username from context
        date: formattedDate,
        role: role || "Unknown",  // Get role from context
        action: `Edited Employment Type: ${employmentType[index].goverment_name}`  // Action taken
    };

    // Send audit log to backend
    axios.post("http://localhost:8800/audit", auditLog)
        .then(() => console.log("Audit trail logged"))
        .catch(err => console.error("Error logging audit trail:", err));
  }

  const RemoveEmploymentType = async (index) => {
    const employmentTypeToRemove = employmentType[index];
  
    console.log("Employment Type to Remove:", employmentTypeToRemove);
  
    if (!employmentTypeToRemove.id && !employmentTypeToRemove.employment_type_id) {
      console.error("Employment Type ID is missing:", employmentTypeToRemove);
      return;
    }
  
    const EmploymentTypeId = employmentTypeToRemove.id || employmentTypeToRemove.employment_type_id;
  
    try {
      // Log the audit trail
      let today = new Date();
      let formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} ${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;

      const auditLog = {
          username: username || "Unknown",  // Get username from context
          date: formattedDate,
          role: role || "Unknown",  // Get role from context
          action: `The selected Employment Type has been removed.`  // Action taken
      };

      // Send audit log to backend
      axios.post("http://localhost:8800/audit", auditLog)
          .then(() => console.log("Audit trail logged"))
          .catch(err => console.error("Error logging audit trail:", err));

      const response = await axios.delete(`http://localhost:8800/delete-employment-type/${EmploymentTypeId}`);
      if (response.status === 200) {
        setEmploymentType((prevEmploymentType) => prevEmploymentType.filter((_, i) => i !== index));
        console.log('Employment Type removed successfully');
      } else {
        console.error('Failed to remove Employment Type', response.data);
      }
    } catch (err) {
      console.error('Error removing Employment Type', err);
    }
  };

  const SaveEmploymentType = async (index) => {
    const employmentTypeToSave = employmentType[index];
  
    console.log("Saving Employment Type:", employmentTypeToSave);
  
    try {
      const response = await axios.post("http://localhost:8800/save-employment-type", {
        employment_type_id: employmentTypeToSave.employment_type_id || null,
        employment_type_name: employmentTypeToSave.employment_type_name,
      });
  
      if (response.status === 200) {
        const newId = response.data.employment_type_id;
        setEmploymentType((prevEmploymentType) =>
          prevEmploymentType.map((item, i) =>
            i === index ? { ...item, employment_type_id: newId, editable: false } : item
          )
        );
        console.log("Employment Type saved successfully");
      }
    } catch (err) {
      console.error("Error saving Employment Type", err);
    }
  };

  //Civil Status
  const AddCivilStatus = () => {
    if (civilStatusTitle.trim()){
      setCivilStatus([...civilStatus, {cs_name: civilStatusTitle, editable: true}]);
      // Log the audit trail
      let today = new Date();
      let formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} ${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;

      const auditLog = {
          username: username || "Unknown",  // Get username from context
          date: formattedDate,
          role: role || "Unknown",  // Get role from context
          action: `Added a new Civil Status: ${civilStatusTitle}`  // Action taken
      };

      // Send audit log to backend
      axios.post("http://localhost:8800/audit", auditLog)
          .then(() => console.log("Audit trail logged"))
          .catch(err => console.error("Error logging audit trail:", err));
    }
    CloseAddCivilStatusModal();
  }

  const EditCivilStatus = (index) => {
    setCivilStatus((prevCivilStatus) =>
      prevCivilStatus.map((CivilStatus, i) =>
        i === index ? { ...CivilStatus, editable: true } : CivilStatus
      )
    );
    // Log the audit trail
    let today = new Date();
    let formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} ${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;

    const auditLog = {
        username: username || "Unknown",  // Get username from context
        date: formattedDate,
        role: role || "Unknown",  // Get role from context
        action: `Edited Civil Status: ${civilStatus[index].cs_name}`  // Action taken
    };

    // Send audit log to backend
    axios.post("http://localhost:8800/audit", auditLog)
        .then(() => console.log("Audit trail logged"))
        .catch(err => console.error("Error logging audit trail:", err));
  }

  const RemoveCivilStatus = async (index) => {
    const civilStatusToRemove = civilStatus[index];
  
    console.log("Civil Status to Remove:", civilStatusToRemove);
  
    if (!civilStatusToRemove.id && !civilStatusToRemove.cs_id) {
      console.error("Employment Type ID is missing:", civilStatusToRemove);
      return;
    }
  
    const CivilStatusId = civilStatusToRemove.id || civilStatusToRemove.cs_id;
  
    try {
      // Log the audit trail
      let today = new Date();
      let formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} ${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;

      const auditLog = {
          username: username || "Unknown",  // Get username from context
          date: formattedDate,
          role: role || "Unknown",  // Get role from context
          action: `The selected Employment Type has been removed.`  // Action taken
      };

      // Send audit log to backend
      axios.post("http://localhost:8800/audit", auditLog)
          .then(() => console.log("Audit trail logged"))
          .catch(err => console.error("Error logging audit trail:", err));

      const response = await axios.delete(`http://localhost:8800/delete-civil-status/${CivilStatusId}`);
      if (response.status === 200) {
        setCivilStatus((prevCivilStatus) => prevCivilStatus.filter((_, i) => i !== index));
        console.log('Civil Status removed successfully');
      } else {
        console.error('Failed to remove Civil Status', response.data);
      }
    } catch (err) {
      console.error('Error removing Civil Status', err);
    }
  };

  const SaveCivilStatus = async (index) => {
    const civilStatusToSave = civilStatus[index];
  
    console.log("Saving Civil Status:", civilStatusToSave);
  
    try {
      const response = await axios.post("http://localhost:8800/save-civil-status", {
        cs_id: civilStatusToSave.cs_id || null,
        cs_name: civilStatusToSave.cs_name,
      });
  
      if (response.status === 200) {
        const newId = response.data.cs_id;
        setCivilStatus((prevCivilStatus) =>
          prevCivilStatus.map((item, i) =>
            i === index ? { ...item, cs_id: newId, editable: false } : item
          )
        );
        console.log("Civil Status saved successfully");
      }
    } catch (err) {
      console.error("Error saving Civil Status", err);
    }
  };

  //Sex
  const AddSex = () => {
    if (sexTitle.trim()){
      setSex([...sex, {sex_name: sexTitle, editable: true}]);
      // Log the audit trail
      let today = new Date();
      let formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} ${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;

      const auditLog = {
          username: username || "Unknown",  // Get username from context
          date: formattedDate,
          role: role || "Unknown",  // Get role from context
          action: `Added a new Sex: ${sexTitle}`  // Action taken
      };

      // Send audit log to backend
      axios.post("http://localhost:8800/audit", auditLog)
          .then(() => console.log("Audit trail logged"))
          .catch(err => console.error("Error logging audit trail:", err));
    }
    CloseAddSexModal();
  }

  const EditSex = (index) => {
    setSex((prevSex) =>
      prevSex.map((Sex, i) =>
        i === index ? { ...Sex, editable: true } : Sex
      )
    );
    // Log the audit trail
    let today = new Date();
    let formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} ${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;

    const auditLog = {
        username: username || "Unknown",  // Get username from context
        date: formattedDate,
        role: role || "Unknown",  // Get role from context
        action: `Edited Sex: ${sex[index].sex_name}`  // Action taken
    };

    // Send audit log to backend
    axios.post("http://localhost:8800/audit", auditLog)
        .then(() => console.log("Audit trail logged"))
        .catch(err => console.error("Error logging audit trail:", err));
  }

  const RemoveSex = async (index) => {
    const sexToRemove = sex[index];
  
    console.log("Sex to Remove:", sexToRemove);
  
    if (!sexToRemove.id && !sexToRemove.sex_id) {
      console.error("Sex ID is missing:", sexToRemove);
      return;
    }
  
    const SexId = sexToRemove.id || sexToRemove.cs_id;
  
    try {
      // Log the audit trail
      let today = new Date();
      let formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} ${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;

      const auditLog = {
          username: username || "Unknown",  // Get username from context
          date: formattedDate,
          role: role || "Unknown",  // Get role from context
          action: `The selected Sex has been removed.`  // Action taken
      };

      // Send audit log to backend
      axios.post("http://localhost:8800/audit", auditLog)
          .then(() => console.log("Audit trail logged"))
          .catch(err => console.error("Error logging audit trail:", err));

      const response = await axios.delete(`http://localhost:8800/delete-sex/${SexId}`);
      if (response.status === 200) {
        setSex((prevSex) => prevSex.filter((_, i) => i !== index));
        console.log('Sex removed successfully');
      } else {
        console.error('Failed to remove Sex', response.data);
      }
    } catch (err) {
      console.error('Error removing Sex', err);
    }
  };

  const SaveSex = async (index) => {
    const sexToSave = sex[index];
  
    console.log("Saving Sex:", sexToSave);
  
    try {
      const response = await axios.post("http://localhost:8800/save-sex", {
        sex_id: sexToSave.sex_id || null,
        sex_name: sexToSave.sex_name,
      });
  
      if (response.status === 200) {
        const newId = response.data.sex_id;
        setSex((prevSex) =>
          prevSex.map((item, i) =>
            i === index ? { ...item, sex_id: newId, editable: false } : item
          )
        );
        console.log("Sex saved successfully");
      }
    } catch (err) {
      console.error("Error saving Sex", err);
    }
  };

  //Rate Value
  const AddRateValue = () => {
    if (rateValueTitle.trim()){
      setRateValue([...rateValue, {position: rateValueTitle, value: '', editable: true}]);

      // Log the audit trail
      let today = new Date();
      let formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} ${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;

      const auditLog = {
          username: username || "Unknown",  // Get username from context
          date: formattedDate,
          role: role || "Unknown",  // Get role from context
          action: `Added a new Rate Value: ${rateValueTitle}`  // Action taken
      };

      // Send audit log to backend
      axios.post("http://localhost:8800/audit", auditLog)
          .then(() => console.log("Audit trail logged"))
          .catch(err => console.error("Error logging audit trail:", err));
    }
    CloseAddRateValueModal();
  }

  const EditRateValue = (index) => {
    setRateValue((prevRateValue) =>
      prevRateValue.map((RateValue, i) =>
        i === index ? { ...RateValue, editable: true } : RateValue
      )
    );

    // Log the audit trail
    let today = new Date();
    let formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} ${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;

    const auditLog = {
        username: username || "Unknown",  // Get username from context
        date: formattedDate,
        role: role || "Unknown",  // Get role from context
        action: `Edited Rate Value: ${rateValue[index].pos_rt_val}`  // Action taken
    };

    // Send audit log to backend
    axios.post("http://localhost:8800/audit", auditLog)
        .then(() => console.log("Audit trail logged"))
        .catch(err => console.error("Error logging audit trail:", err));
  };

  const RemoveRateValue = async (index) => {
    const rateValueToRemove = rateValue[index];
  
    console.log("Deduction to Remove:", rateValueToRemove);
  
    if (!rateValueToRemove.id && !rateValueToRemove.position_id) {
      console.error("Deduction ID is missing:", rateValueToRemove);
      return;
    }
  
    const rateValueId = rateValueToRemove.id || rateValueToRemove.position_id;
  
    try {
      // Log the audit trail
      let today = new Date();
      let formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} ${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;

      const auditLog = {
          username: username || "Unknown",  // Get username from context
          date: formattedDate,
          role: role || "Unknown",  // Get role from context
          action: `The selected deduction has been removed.`  // Action taken
      };

      // Send audit log to backend
      axios.post("http://localhost:8800/audit", auditLog)
          .then(() => console.log("Audit trail logged"))
          .catch(err => console.error("Error logging audit trail:", err));

      const response = await axios.delete(`http://localhost:8800/delete-rate-value/${rateValueId}`);
      if (response.status === 200) {
        setRateValue((prevRateValue) => prevRateValue.filter((_, i) => i !== index));
        console.log('Rate Value removed successfully');
      } else {
        console.error('Failed to remove Rate Value', response.data);
      }
    } catch (err) {
      console.error('Error removing Rate Value', err);
    }
  };   

  const SaveRateValue = async (index) => {
    const RateValueSave = rateValue[index];
    try {
      const response = await axios.post('http://localhost:8800/save-rate-value', {
        title: RateValueSave.position,
        value: RateValueSave.value,
      });
  
      if (response.status === 200) {
        const SaveNewRateValue = rateValue.map((RateValue, i) =>
          i === index ? { ...RateValue, editable: false } : RateValue
        );
        setRateValue(SaveNewRateValue);
        console.log('New Rate Value saved successfully', response.data);
      } else {
        console.log('Failed to save a New Rate Value', response.data);
      }
    } catch (err) {
      console.error('Failed to save a New Rate Value', err);
    }
  };

  return (
    <PageLayout title="System Variables">
      <Box component={motion.div} variants={staggerContainer} initial="hidden" animate="visible">
        <Typography
          variant="overline"
          sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: '0.08em', display: 'block' }}
        >
          Configuration
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          Reference values used across payroll, attendance, and employee records.
        </Typography>

        <Grid container spacing={3} alignItems="stretch">
          <SectionCard
            title="De Minimis Benefits"
            description="Non-taxable benefit amounts applied per payroll run"
            count={dmb.length}
            buttonLabel="Add benefit"
            onAdd={OpenAddDmbModal}
            emptyText="No de minimis benefits yet"
          >
            {dmb.map((item, index) => (
              <VariableRow
                key={index}
                label={item.dmb_name || item.title}
                value={item.dmb_value}
                currency
                editable={item.editable}
                onChange={(e) => handleDmbChange(index, e.target.value)}
                onSave={() => SaveDmb(index)}
                onRemove={() => RemoveDmb(index)}
                onEdit={() => EditDmb(index)}
              />
            ))}
          </SectionCard>

          <SectionCard
            title="Deductions"
            description="Standard deduction amounts applied to salaries"
            count={deductions.length}
            buttonLabel="Add deduction"
            onAdd={OpenAddDeducModal}
            emptyText="No deductions yet"
          >
            {deductions.map((item, index) => (
              <VariableRow
                key={index}
                label={item.deduc_name || item.title}
                value={item.deduc_value}
                currency
                editable={item.editable}
                onChange={(e) => handleDeducChange(index, e.target.value)}
                onSave={() => SaveDeductions(index)}
                onRemove={() => RemoveDeductions(index)}
                onEdit={() => EditDeductions(index)}
              />
            ))}
          </SectionCard>

          <SectionCard
            title="Payroll Settings"
            description="Holidays and contribution schedules"
            count={payrollSettings.length}
            buttonLabel="Add setting"
            onAdd={OpenAddPayrollSettingsModal}
            emptyText="No holidays or contributions yet"
          >
            {payrollSettings.map((item, index) => (
              <VariableRow
                key={index}
                value={item.paysett_name}
                editable={item.editable}
                onChange={(e) => handlePayrollSettingsChange(index, e.target.value)}
                onSave={() => SavePayrollSettings(index)}
                onRemove={() => RemovePayrollSettings(index)}
                onEdit={() => EditPayrollSettings(index)}
              />
            ))}
          </SectionCard>

          <SectionCard
            title="Leave Types"
            description="Categories of employee leave"
            count={leaveType.length}
            buttonLabel="Add leave type"
            onAdd={OpenAddLeaveTypeModal}
            emptyText="No leave types yet"
          >
            {leaveType.map((item, index) => (
              <VariableRow
                key={index}
                value={item.leave_type_name}
                editable={item.editable}
                onChange={(e) => handleLeaveTypeChange(index, e.target.value)}
                onSave={() => SaveLeaveType(index)}
                onRemove={() => RemoveLeaveType(index)}
                onEdit={() => EditLeaveType(index)}
              />
            ))}
          </SectionCard>

          <SectionCard
            title="Loan Types"
            description="Government and company loan categories"
            count={loanType.length}
            buttonLabel="Add loan type"
            onAdd={OpenAddLoanTypeModal}
            emptyText="No loan types yet"
          >
            {loanType.map((item, index) => (
              <VariableRow
                key={index}
                value={item.goverment_name}
                editable={item.editable}
                onChange={(e) => handleLoanTypeChange(index, e.target.value)}
                onSave={() => SaveLoanType(index)}
                onRemove={() => RemoveLoanType(index)}
                onEdit={() => EditLoanType(index)}
              />
            ))}
          </SectionCard>

          <SectionCard
            title="Employment Types"
            description="Employment status classifications"
            count={employmentType.length}
            buttonLabel="Add type"
            onAdd={OpenAddEmploymentTypeModal}
            emptyText="No employment types yet"
          >
            {employmentType.map((item, index) => (
              <VariableRow
                key={index}
                value={item.employment_type_name}
                editable={item.editable}
                onChange={(e) => handleEmploymentTypeChange(index, e.target.value)}
                onSave={() => SaveEmploymentType(index)}
                onRemove={() => RemoveEmploymentType(index)}
                onEdit={() => EditEmploymentType(index)}
              />
            ))}
          </SectionCard>

          <SectionCard
            title="Civil Status"
            description="Civil status options for employee records"
            count={civilStatus.length}
            buttonLabel="Add status"
            onAdd={OpenAddCivilStatusModal}
            emptyText="No civil status options yet"
          >
            {civilStatus.map((item, index) => (
              <VariableRow
                key={index}
                value={item.cs_name}
                editable={item.editable}
                onChange={(e) => handleCivilStatusChange(index, e.target.value)}
                onSave={() => SaveCivilStatus(index)}
                onRemove={() => RemoveCivilStatus(index)}
                onEdit={() => EditCivilStatus(index)}
              />
            ))}
          </SectionCard>

          <SectionCard
            title="Sex"
            description="Sex options for employee records"
            count={sex.length}
            buttonLabel="Add option"
            onAdd={OpenAddSexModal}
            emptyText="No options yet"
          >
            {sex.map((item, index) => (
              <VariableRow
                key={index}
                value={item.sex_name}
                editable={item.editable}
                onChange={(e) => handleSexChange(index, e.target.value)}
                onSave={() => SaveSex(index)}
                onRemove={() => RemoveSex(index)}
                onEdit={() => EditSex(index)}
              />
            ))}
          </SectionCard>

          <SectionCard
            title="Rate Values"
            description="Base pay rates per position"
            count={rateValue.length}
            buttonLabel="Add rate"
            onAdd={OpenAddRateValueModal}
            emptyText="No rate values yet"
          >
            {rateValue.map((item, index) => (
              <VariableRow
                key={index}
                label={item.position || item.title}
                value={item.value}
                currency
                editable={item.editable}
                onChange={(e) => handleRateValueChange(index, e.target.value)}
                onSave={() => SaveRateValue(index)}
                onRemove={() => RemoveRateValue(index)}
                onEdit={() => EditRateValue(index)}
              />
            ))}
          </SectionCard>
        </Grid>
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
      <AddLeaveTypeModal
        onOpen={leaveTypeModal}
        onClose={CloseAddLeaveTypeModal}
        onAdd={AddLeaveType}
        onValue={leaveTypeTitle}
        onChange={(e) => setLeaveTypeTitle(e.target.value)}
      />
      <AddLoanTypeModal
        onOpen={loanTypeModal}
        onClose={CloseAddLoanTypeModal}
        onAdd={AddLoanType}
        onValue={loanTypeTitle}
        onChange={(e) => setLoanTypeTitle(e.target.value)}
      />
      <AddEmpTypeModal
        onOpen={employmentTypeModal}
        onClose={CloseAddEmploymentTypeModal}
        onAdd={AddEmploymentType}
        onValue={employmentTypeTitle}
        onChange={(e) => setEmploymentTypeTitle(e.target.value)}
      />
      <AddCivilStatusModal
        onOpen={civilStatusModal}
        onClose={CloseAddCivilStatusModal}
        onAdd={AddCivilStatus}
        onValue={civilStatusTitle}
        onChange={(e) => setCivilStatusTitle(e.target.value)}
      />
      <AddSexModal
        onOpen={sexModal}
        onClose={CloseAddSexModal}
        onAdd={AddSex}
        onValue={sexTitle}
        onChange={(e) => setSexTitle(e.target.value)}
      />
      <AddRateValueModal
        onOpen={rateValueModal}
        onClose={CloseAddRateValueModal}
        onAdd={AddRateValue}
        onValue={rateValueTitle}
        onChange={(e) => setRateValueTitle(e.target.value)}
      />
    </PageLayout>
  )
}
