import React, { useState, useEffect } from 'react'
import SideNav from '../Components/SideNav'
import Box from '@mui/material/Box'
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Table from '@mui/joy/Table'
import axios from 'axios'
import { Button, Modal, TextField, Autocomplete, Snackbar, Alert, Portal, Dialog, DialogTitle, DialogContent, Switch, DialogActions, Stack, TableCell, TableRow, TableContainer, TableBody, Paper, TableHead } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import SearchBar from '../Components/SearchBar'
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import ModalClose from '@mui/joy/ModalClose';
import Divider from '@mui/material/Divider';
import Grid from '@mui/joy/Grid';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CloseIcon from '@mui/icons-material/Close'
import { format } from 'date-fns'
import SettingsIcon from '@mui/icons-material/Settings';
import WarningAmberIcon from "@mui/icons-material/WarningAmber"; // Import the warning icon
import { useAuth } from '../_Auth/AuthContext'

//import dayjs from 'dayjs'

const drawerWidth = 240;

export default function Payroll() {
  // PAAYROLL SETTINGS
  const [openPaySet, setOpenPaySet] = useState(false);
  const [unsavedChangesDialog, setUnsavedChangesDialog] = useState(false);
  const [confirmSaveDialog, setConfirmSaveDialog] = useState(false); // New state for Save confirmation
  const [toggles, setToggles] = useState({});
  const [tempToggles, setTempToggles] = useState({});
  const [isEditable, setIsEditable] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [labels, setLabels] = useState({});
  const { role, username } = useAuth();
  const [settingsData, setSettingsData] = useState([]);
  const [groupedSettings, setGroupedSettings] = useState({});
  const [categoryLabels, setCategoryLabels] = useState({});
  const [payrollData, setPayrollData] = useState([]);
  const [activePayrollData, setActivePayrollData] = useState([]);
  const [selectedCycle, setSelectedCycle] = useState(""); // Track the selected cycle
  const [payrollCycles, setPayrollCycles] = useState({});

  const handleSelectPayrollType = (type) => {
    setSelectedPayrollType(type);
    setSelectedCycle("");  // Reset cycle selection when changing payroll type
  };
  const [payrollPreview, setPayrollPreview] = useState(null);
  const [selectedPayrollType, setSelectedPayrollType] = useState(null); // Tracks selected payroll type

  const [openModal, setOpenModal] = useState(false);
  const [openPreview, setOpenPreview] = useState(false);
  const [value1, setValue1] = useState(null);
  const [value2, setValue2] = useState(null);

  const [payroll, setPayroll] = useState([]);

  const [openModal1, setOpenModal1] = useState(false);
  const [payrollview, setPayroll1] = useState([]);

  const [openModalViewEmpPayroll, setOpenModalViewEmpPayroll] = useState(false);
  const [viewemp, setViewemp] = useState([]);

  const navigate = useNavigate(); // Initialize useNavigate hook
  const [inputs, setInputs] = React.useState({});
  const [error, setError] = React.useState(null);

  //Style
  const marginstyle = { margin: 8 };
  const marginstyle1 = { marginbutton: 5 };
  const buttonstyle = { borderRadius: 5, justifyContent: 'left', margin: 5 };
  const martop = { marginTop: 5 }

  const CivilStatus = [
    { label: 'Single' }, { label: 'Married' }
  ];
  const Sex = [
    { label: 'Male' }, { label: 'Female' }
  ];
  const handleOpenPreview = () => {
    if (!startDate || !endDate) {
      setSnackbarSeverity("warning");
      setSnackbarMessage("Please select Start and End Date to see the preview.");
      setSnackbarOpen(true);
      return;
    }

    // Calculate total days inclusively
    const totalDays =
      Math.ceil(
        (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
      ) + 1; // Add 1 to include the start date

    setPayrollPreview({
      payrollType: selectedPayrollType,
      payrollCycle: selectedCycle,
      startDate: startDate.toLocaleDateString(),
      endDate: endDate.toLocaleDateString(),
      totalDays,
    });

    // Open the preview modal
    setOpenPreview(true);
  };

  const [selectedPayrollCycle, setSelectedPayrollCycle] = useState(''); // State to store selected payroll cycle

  // Viewpayroll modal
  const handleOpenModal1 = (payrollCycle) => {
    setSelectedPayrollCycle(payrollCycle);  // Set the selected payroll cycle
    fetchPayrollData(payrollCycle); // Fetch data based on the selected payroll cycle
    setOpenModal1(true); // Open the modal
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

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    try {
      if (!startDate || !endDate) {
        setSnackbarSeverity("warning");
        setSnackbarMessage("Please select both start and end dates.");
        setSnackbarOpen(true);
        return;
      }

      // Calculate total days between start and end dates (including start date)
      const totalDays = Math.abs((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

      // Set the payroll preview
      setPayrollPreview({
        payrollType: String(selectedPayrollType),  // Ensures selectedPayrollType is a string
        payrollCycle: String(selectedCycle),
        startDate: startDate.toLocaleDateString(),
        endDate: endDate.toLocaleDateString(),
        totalDays,
      });

      // Format dates as yyyy-mm-dd for backend (local time)
      const formatDate = (date) =>
        date.toLocaleDateString("en-CA", { timeZone: "Asia/Manila" }); // "en-CA" gives yyyy-mm-dd format

      const formattedStartDate = formatDate(new Date(startDate));
      const formattedEndDate = formatDate(new Date(endDate));

      const now = new Date();
      const FormattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      // Check if payroll data exists for the given date range
      const validationResponse = await axios.post("http://localhost:8800/ViewPayrollPart1", {
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      });

      if (validationResponse.data.exists) {
        setSnackbarSeverity("warning");
        setSnackbarMessage("Payroll already exists for the selected dates.");
        setSnackbarOpen(true);
        return;
      }

      // Select the appropriate endpoint based on payroll type
      const payrollEndpoint =
        selectedPayrollType === "Semi-Monthly"
          ? "http://localhost:8800/payroll-part-1-sm"
          : selectedPayrollType === "Monthly"
            ? "http://localhost:8800/payroll-part-1-m"
            : selectedPayrollType === "Special-Run"
              ? "http://localhost:8800/payroll-part-1-sr"
              : ""; // Default to empty if no valid payroll type

      if (!payrollEndpoint) {
        setSnackbarSeverity("warning");
        setSnackbarMessage("Invalid payroll type selected.");
        setSnackbarOpen(true);
        return;
      }

      // Fetch payroll data based on selected payroll type
      const fetchResponse = await axios.post(payrollEndpoint, {
        payrollType: String(selectedPayrollType),  // Ensures selectedPayrollType is a string
        payrollCycle: String(selectedCycle),
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      });

      // Determine the appropriate insert endpoint based on cycle
      const insertEndpoint =
        selectedCycle === "1st"
          ? "http://localhost:8800/payroll-part-2-1st"
          : selectedCycle === "2nd"
            ? "http://localhost:8800/payroll-part-2-2nd"
            : selectedCycle === "Monthly"
              ? "http://localhost:8800/payroll-part-2-m"
              : ""; // Default to empty if no valid payroll cycle

      if (!insertEndpoint) {
        setSnackbarSeverity("warning");
        setSnackbarMessage("Invalid payroll cycle selected.");
        setSnackbarOpen(true);
        return;
      }

      // Insert payroll data into the determined endpoint
      const insertResponse = await axios.post(insertEndpoint, {
        payrollType: String(selectedPayrollType),  // Ensures selectedPayrollType is a string
        payrollCycle: String(selectedCycle),
        totalDays: totalDays,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        payrollData: fetchResponse.data, // Send fetched data if needed
      });

      // Insert data into the generic payroll endpoint (new)
      await axios.post("http://localhost:8800/payroll", {
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        payrollType: String(selectedPayrollType),
        payrollCycle: String(selectedCycle),
        payrollDate: FormattedDate
      });

      setSnackbarSeverity("success");
      setSnackbarMessage("Payroll Generate Successfully ");
      setSnackbarOpen(true);

      console.log("Payroll Data:", fetchResponse.data);
      console.log("Insert Response:", insertResponse.data);
    } catch (error) {
      setSnackbarSeverity("error");
      setSnackbarMessage(
        error.response?.data?.message || "Error fetching or inserting payroll data."
      );
      setSnackbarOpen(true);
      console.error("Error:", error.response || error.message);
    }
  };

  const [snackbarOpen, setSnackbarOpen] = useState(false); // For controlling snackbar visibility
  const [snackbarMessage, setSnackbarMessage] = useState(""); // For storing the snackbar message
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // For storing snackbar severity (e.g., 'warning', 'success', 'error')

  const [confirmClose, setConfirmClose] = useState(false); // For controlling the confirmation dialog state

  // Function to trigger a snackbar message with a specific severity
  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
    // Optionally, you can close the snackbar after a delay
    setTimeout(() => setSnackbarOpen(false), severity === 'warning' || severity === 'success' ? 3000 : 6000);
  };

  const handleConfirmClose = (confirm) => {
    if (confirm) {
      resetForm();
      handleCloseModal();
    }
    setConfirmClose(false); // Close the confirmation dialog
    setOpenModal(false);
  };
  // Closing the modal
  const handleClosePreview = () => {
    setOpenPreview(false);
  };

  const handleCloseModal = () => {
    if (
      (startDate && startDate !== '') ||
      (endDate && endDate !== '')

    ) {
      setConfirmClose(true); // Show confirmation snackbar
    } else {
      resetForm(); // Reset the form
      setOpenModal(false);
    }
  };

  const resetForm = () => {
    setEndDate(null);
    setStartDate(null);
    setSelectedPayrollType(null);
    setSelectedCycle(null)
  };
  const [payrollSummary, setPayrollSummary] = useState(null);

  useEffect(() => {
    const fetchPayrollSummary = async () => {
      try {
        const response = await axios.get('http://localhost:8800/payroll-summary');
        console.log("Payroll Summary Data:", response.data);
        // Format options for Month Day, Year
        const dateFormatter = new Intl.DateTimeFormat('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });

        // Process response data to format dates
        const payrollData = response.data.map(item => {
          const { startDate, endDate } = item;

          // Format startDate and endDate
          const formattedStartDate = dateFormatter.format(new Date(startDate));
          const formattedEndDate = dateFormatter.format(new Date(endDate));

          // Concatenate formatted dates
          const concatenatedDate = `${formattedStartDate} - ${formattedEndDate}`;

          return {
            ...item,
            concatenatedDate,
          };
        });

        setPayrollSummary(payrollData); // Update state with the modified data
      } catch (error) {
        setSnackbarSeverity('error');
        setSnackbarMessage('Failed to fetch payroll summary data.');
        setSnackbarOpen(true);
      }
    };

    fetchPayrollSummary();
  }, []);

  const [payrollDetails, setPayrollDetails] = useState(null); // To store fetched payroll details

  const fetchPayrollData = async (payrollCycle) => {
    try {
      const response = await axios.post('http://localhost:8800/payroll-table', {
        payrollCycle,
      });
      setPayrollDetails(response.data); // Set the payroll details in state
      console.log("Payroll Details:", response.data);
    } catch (error) {
      console.error('Error fetching payroll data:', error);
    }
  };

  const formatCurrency = (value) => {
    const formattedAmount = new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(value);

    return formattedAmount || 'PHP 0.00';
  };
  const [selectedId, setSelectedId] = useState(null);

  const [payrollPart1, setPayrollPart1] = useState([]);
  const [payrollPart2, setPayrollPart2] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleOpenModalViewEmpPayroll = (id) => {
    console.log("Selected Employee ID:", id); // Ensure the ID is not null
    setSelectedId(id); // Store the selected employee ID
    setOpenModalViewEmpPayroll(true); // Open the modal
  };


  const handleCloseModalViewEmpPayroll = () => {
    setOpenModalViewEmpPayroll(false);

  };

  useEffect(() => {
    if (selectedId) {
      const fetchEmployeePayroll = async (id) => {
        try {
          const part1Response = await axios.get(`http://localhost:8800/ViewPayroll_Part1/${id}`);
          const part2Response = await axios.get(`http://localhost:8800/ViewPayroll_Part2/${id}`);
          const part3Response = await axios.get(`http://localhost:8800/emp-info/${id}`);
          setEmployeeData({ ...part1Response.data, ...part2Response.data, ...part3Response.data });
        } catch (error) {
          console.error("Error fetching payroll data:", error);
        }
      };

      fetchEmployeePayroll(selectedId); // Fetch the data
    }
  }, [selectedId]);

  const [addallowance, setAddAllowance] = useState([]);

  useEffect(() => {
    if (selectedId) {
      const fetchEarningsAndBenefits = async () => {
        try {
          // Simultaneously fetch both datasets using Promise.all
          const [benefitsRes] = await Promise.all([
            axios.get(`http://localhost:8800/emp-additional-benifits/${selectedId}`)
          ]);

          setAddAllowance(benefitsRes.data);

        } catch (error) {
          console.error("Error fetching earnings or benefits data:", error);
        }
      };

      fetchEarningsAndBenefits();
    }
  }, [selectedId]);

  const totalShare =
    parseFloat(employeeData?.employee_sss_share || 0) +
    parseFloat(employeeData?.wisp_employee_share || 0) +
    parseFloat(employeeData?.employee_philhealth || 0) +
    parseFloat(employeeData?.employee_hdmf || 0);

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:8800/payroll-category");
      const labelsMap = {};
      res.data.forEach((cat) => {
        labelsMap[cat.sett_cat_id] = cat.sett_cat_name;
      });
      setCategoryLabels(labelsMap);
    } catch (err) {
      console.error("Failed to load categories", err);
    }
  };

  fetchCategories();


  useEffect(() => {
    fetchPaySettings();
    fetchCategories(); // Fetch categories when the component mounts
  }, []);

  const fetchPaySettings = async () => {
    try {
      const res = await axios.get("http://localhost:8800/payroll-settings");
      const raw = res.data;

      // ✅ Group by category for display
      const grouped = raw.reduce((acc, item) => {
        if (!acc[item.sett_cat_id]) acc[item.sett_cat_id] = [];
        acc[item.sett_cat_id].push(item);
        return acc;
      }, {});
      setGroupedSettings(grouped);

      // ✅ Build toggle map for Switch UI
      const toggleMap = {};
      raw.forEach((item) => {
        toggleMap[item.paysett_id] = !!item.paysett_value;
      });
      setTempToggles(toggleMap);
      console.log("Fetched Payroll Settings: ", raw); // Check if data is fetched correctly
    } catch (err) {
      console.error("❌ Failed to load payroll settings:", err);
    }
  };

  useEffect(() => {
    if (groupedSettings) {
      const toggles = {};

      Object.values(groupedSettings).forEach((group) => {
        group.forEach(({ paysett_id, paysett_value }) => {
          toggles[paysett_id] = paysett_value === 1;
        });
      });

      setTempToggles(toggles);
    }
  }, [groupedSettings]);


  const handleOpenPaySet = async () => {
    await fetchPaySettings(); // ensure data is fresh
    setTempToggles({ ...toggles }); // copy again after fetch
    setIsEditable(false);
    setOpenPaySet(true);
  };
  const handleClosePaySet = () => {
    const hasUnsavedChanges = JSON.stringify(tempToggles) !== JSON.stringify(toggles);
    if (hasUnsavedChanges && isEditable) {
      setUnsavedChangesDialog(true);
    } else {
      setOpenPaySet(false);
    }
  };

  const handleCloseWithoutSaving = () => {
    setUnsavedChangesDialog(false);
    setOpenPaySet(false);
    setTempToggles({ ...toggles });
    setSnackbar({ open: true, message: "Settings were not saved!", severity: "warning" });
  };

  const handleToggleChange = (paysett_id) => async (event) => {
    const isChecked = event.target.checked;
    const updatedValue = isChecked ? 1 : 0;

    // Update local toggle state immediately
    setTempToggles((prev) => ({
      ...prev,
      [paysett_id]: isChecked,
    }));

    try {
      // Send PUT request to update the value in the backend
      await axios.put(`http://localhost:8800/payroll-settings/${paysett_id}`, {
        paysett_value: updatedValue,
      });

      // Refresh the UI with updated settings
      await fetchPaySettings();
      await fetchPayrollCycles();
    } catch (error) {
      console.error("Error updating toggle:", error);
    }
  };

  const fetchPayrollCycles = async () => {
    try {
      const res = await axios.get("http://localhost:8800/payroll-cycles");
      setSettingsData(res.data);
      console.log("Fetched Payroll Cycles: ", res.data); // Check if data is fetched correctly
    } catch (err) {
      console.error("Failed to load payroll date settings", err);
    }
  };

  const handleEditOrSave = () => {
    if (isEditable) {
      // Show confirmation dialog before saving
      setConfirmSaveDialog(true);
    } else {
      setIsEditable(true);
    }
  };

  const handleConfirmSave = () => {
    setConfirmSaveDialog(false);

    if (JSON.stringify(tempToggles) !== JSON.stringify(toggles)) {
      let today = new Date();
      let formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} ${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;

      axios.post("http://localhost:8800/payroll-settings-toggle", tempToggles)
        .then(() => {
          setToggles({ ...tempToggles });
          setSnackbar({ open: true, message: "Successfully Saved!", severity: "success" });

          // Log to audit trail
          const auditLog = {
            username: username || "Unknown", // Replace with actual current user
            date: formattedDate,
            role: role || "Unknown", // Replace with actual role
            action: "Updated Payroll Settings"
          };

          // ✅ NEW: Save settings_payroll_2 values (start/end dates, values)
          axios.post("http://localhost:8800/settings_payroll_2", settingsData)
            .then(() => {
              console.log("Payroll date settings updated successfully");
            })
            .catch((err) => {
              console.error("Error saving payroll date settings:", err);
            });

          setIsEditable(false);

          axios.post("http://localhost:8800/audit", auditLog)
            .then(() => console.log("Audit trail logged"))
            .catch(err => console.error("Error logging audit trail:", err));
        })
        .catch((err) => console.error("Error saving payroll settings:", err));
    }


  };


  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const [editedData, setEditedData] = useState([]); // To keep track of the edited data

  useEffect(() => {
    axios.get('http://localhost:8800/settings_payroll_2')
      .then(response => {
        const data = response.data.settings;
        setSettingsData(data); // Set fetched data to state
        setEditedData(data); // Initialize editedData with fetched data
        console.log("Fetched Settings Data: ", data); // Check if data is fetched correctly
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);


  const handleChange = (index, field, value) => {
    // Update the edited data when a user changes the value of a TextField
    const updatedData = [...editedData];
    updatedData[index][field] = value;
    setEditedData(updatedData);
  };

  const handleChange1 = (index, field, value) => {
    const updatedData = [...settingsData];
    updatedData[index][field] = value;
    setSettingsData(updatedData);
  };

  useEffect(() => {
    if (
      openModal &&
      selectedPayrollType === "Semi-Monthly" &&
      payrollCycles["Semi-Monthly"]
    ) {
      const today = new Date();
      let selected = null;

      payrollCycles["Semi-Monthly"].forEach((cycle) => {
        const end = new Date(cycle.end);

        if (end < today) {
          if (!selected || new Date(selected.end) < end) {
            selected = cycle;
          }
        }
      });

      if (selected) {
        setSelectedCycle(selected.label);
        setStartDate(new Date(selected.start));
        setEndDate(new Date(selected.end));
      }
    }
  }, [openModal, selectedPayrollType, payrollCycles]);


  const [activeCycle, setActiveCycle] = useState(); // or "Semi-monthly"


  useEffect(() => {
    axios.get("http://localhost:8800/payroll-cycles").then(res => {
      setPayrollData(res.data);
    });
  }, []);

  const groupedData = payrollData.reduce((acc, item) => {
    if (!acc[item.paysett_name]) acc[item.paysett_name] = [];
    acc[item.paysett_name].push(item);
    return acc;
  }, {});

  useEffect(() => {
    if (openModal) {
      axios.get("http://localhost:8800/active-payroll-cycles")
        .then((res) => {
          const data = res.data;
          setActivePayrollData(data);

          const grouped = data.reduce((acc, item) => {
            const type = item.paysett_name;
            if (!acc[type]) acc[type] = [];

            acc[type].push({
              label: item.paysett2_name,
              start: item.cycle_start_date,
              end: item.cycle_end_date,
            });

            return acc;
          }, {});

          setPayrollCycles(grouped);

          // Set the type AFTER cycles are ready
          const detectedType = data[0]?.paysett_name;
          setSelectedPayrollType(detectedType);
        })
        .catch((err) => {
          console.error("Error fetching payroll cycles:", err);
        });
    }
  }, [openModal]);

  useEffect(() => {
    if (selectedPayrollType && payrollCycles[selectedPayrollType]) {
      const today = new Date();
      const cycles = payrollCycles[selectedPayrollType];
      let bestCycle = null;

      for (const cycle of cycles) {
        const end = new Date(cycle.end);

        // ✅ Only completed cycles (end date before today)
        if (end < today) {
          if (!bestCycle || new Date(bestCycle.end) < end) {
            bestCycle = cycle;
          }
        }
      }

      if (bestCycle) {
        setSelectedCycle(bestCycle.label); // "1st Cycle"
        setStartDate(new Date(bestCycle.start));
        setEndDate(new Date(bestCycle.end));
      }
    }
  }, [selectedPayrollType, payrollCycles]);


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
            <Typography variant="h6" noWrap component="div" > Payroll </Typography>

          </Toolbar>
        </AppBar>
        <Box sx={{ flexGrow: 1, p: 3, mt: 7, ml: -11 }}>
          <Grid container spacing={0} direction="row" sx={{ flexGrow: 1, justifyContent: "space-between", alignItems: "center" }} >
            <Grid size={4} sx={{ marginLeft: -3 }}>
              <SearchBar />
            </Grid>
            <Grid size={4} sx={{ marginRight: -3 }}>
              <Button type='Submit' color="primary" variant="outlined" sx={{ marginRight: 1, }} onClick={handleOpenModal} > Generate Payroll</Button>
              <Button
                type="submit"
                color="primary"
                variant="outlined"
                sx={{ marginRight: 3 }}
                startIcon={<SettingsIcon />}
                onClick={handleOpenPaySet}
              >
                Settings
              </Button>

              <Dialog open={openPaySet} onClose={handleClosePaySet} fullWidth maxWidth="sm">
                <DialogTitle>
                  <Typography variant="h5" fontWeight="bold">
                    Payroll Settings
                  </Typography>
                </DialogTitle>

                <DialogContent>
                  {Object.keys(groupedSettings).map((catId) => (
                    <Box key={catId} sx={{ mb: 2 }}>
                      <Typography variant="h6" fontWeight="bold">
                        {categoryLabels[catId] || `Category ${catId}`}
                      </Typography>
                      <Grid container spacing={1} >
                        {groupedSettings[catId].map((item) => (
                          <Grid item xs={6} key={item.paysett_id}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={!!tempToggles[item.paysett_id]}
                                  onChange={handleToggleChange(item.paysett_id)}
                                  color="primary"
                                  disabled={!isEditable}
                                />
                              }
                              label={item.paysett_name}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  ))}

                  <Box sx={{ padding: 2 }}>
                    <Typography variant="h6" fontWeight="bold">
                      Payroll Date Settings
                    </Typography>
                    <Table sx={{ width: '100%' }}>
                      <TableHead>
                        <TableRow>
                          <TableCell>Cycle Name</TableCell>
                          <TableCell>Start Date</TableCell>
                          <TableCell>End Date</TableCell>
                          <TableCell> Value</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {settingsData.length > 0 ? (
                          settingsData.map((row, index) => (
                            <TableRow key={index}>
                              {/* Paysett Name */}
                              <TableCell>
                                <TextField
                                  label="Cycle"
                                  variant="outlined"
                                  fullWidth
                                  value={row.paysett2_name}
                                  onChange={(e) => handleChange1(index, 'paysett2_name', e.target.value)}
                                  disabled  // Control editing via isEditable
                                />
                              </TableCell>

                              {/* Paysett Start Date */}
                              <TableCell>
                                <TextField
                                  label="Start Date"
                                  variant="outlined"
                                  fullWidth
                                  value={row.paysett2_startdate || ""}
                                  onChange={(e) => handleChange1(index, 'paysett2_startdate', e.target.value)}
                                  disabled={!isEditable}
                                />
                              </TableCell>

                              {/* Paysett End Date */}
                              <TableCell>
                                <TextField
                                  label="End Date"
                                  variant="outlined"
                                  fullWidth
                                  value={row.paysett2_enddate || ""}
                                  onChange={(e) => handleChange1(index, 'paysett2_enddate', e.target.value)}
                                  disabled={!isEditable}
                                />
                              </TableCell>

                              {/* Paysett Value (Switch) */}
                              <TableCell>
                                <Switch
                                  checked={row.paysett2_value === 1}
                                  onChange={(e) => handleChange1(index, 'paysett2_value', e.target.checked ? 1 : 0)}
                                  disabled
                                />
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4}>Loading settings data...</TableCell>
                          </TableRow>
                        )}
                      </TableBody>

                    </Table>
                  </Box>
                </DialogContent>

                <DialogActions>

                  <Button onClick={handleClosePaySet} color="primary">
                    Close
                  </Button>
                  <Button onClick={handleEditOrSave} color="success" variant="contained">
                    {isEditable ? "Save" : "Edit"}
                  </Button>
                </DialogActions>
              </Dialog>


              {/* Confirmation Dialog for Saving */}
              <Dialog open={confirmSaveDialog} onClose={() => setConfirmSaveDialog(false)}>
                <DialogTitle>
                  <WarningAmberIcon sx={{ color: "orange", fontSize: 30, verticalAlign: "middle", mr: 1 }} />
                  Confirm Save
                </DialogTitle>
                <DialogContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <WarningAmberIcon sx={{ color: "orange", fontSize: 40 }} />
                  <p>Are you sure you want to save the payroll settings? This may affect future payroll calculations.</p>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setConfirmSaveDialog(false)} color="primary">
                    Cancel
                  </Button>
                  <Button onClick={handleConfirmSave} color="success" variant="contained">
                    Yes, Save
                  </Button>
                </DialogActions>
              </Dialog>

              {/* Confirmation Dialog for Unsaved Changes */}
              <Dialog open={unsavedChangesDialog} onClose={() => setUnsavedChangesDialog(false)}>
                <DialogTitle>Unsaved Changes</DialogTitle>
                <DialogContent>
                  <p>You have unsaved changes. Do you want to close without saving?</p>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setUnsavedChangesDialog(false)} color="primary">
                    Cancel
                  </Button>
                  <Button onClick={handleCloseWithoutSaving} color="error" variant="contained">
                    Close Without Saving
                  </Button>
                </DialogActions>
              </Dialog>

              {/* Snackbar Notification */}
              <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
              >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
                  {snackbar.message}
                </Alert>
              </Snackbar>

            </Grid>
          </Grid>
          <Table hoverRow sx={{}} borderAxis="both">
            <thead>
              <tr>
                <th style={{ width: '10%' }}>Payroll No.</th>
                <th style={{ width: '20%' }}>Date Coverage</th>
                <th style={{ width: '20%' }}>Pay Date</th>
                <th style={{ width: '10%' }}>Payroll Type</th>
                <th style={{ width: '10%' }}>Payroll Cycle</th>
                <th style={{ width: '20%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payrollSummary && payrollSummary.length > 0 ? (
                payrollSummary.map((payroll, index) => (
                  <tr key={index}>
                    <td style={{ cursor: 'pointer' }}>{payroll.emp_payroll_id}</td>
                    <td style={{ cursor: 'pointer' }}>{payroll.concatenatedDate}</td>
                    <td style={{ cursor: 'pointer' }}>{payroll.payroll_date}</td>
                    <td style={{ cursor: 'pointer' }}>{payroll.payrollType}</td>
                    <td style={{ cursor: 'pointer' }}>{payroll.payrollCycle}</td>
                    <td>
                      <Button
                        variant="contained"
                        style={{ width: '25%', fontSize: 12, fontWeight: 'bold' }}
                        onClick={() => handleOpenModal1(payroll.payrollCycle)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No payroll data.</td>
                </tr>
              )}
            </tbody>
          </Table>
          <Modal open={openModal} onClose={handleCloseModal} closeAfterTransition>
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
                  width: { xs: '80%', sm: '60%', md: '50%' },
                  boxShadow: 24,
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <CloseIcon onClick={handleCloseModal} sx={{ cursor: 'pointer', marginLeft: '96%' }} />
                <Typography variant="h4" component="h2" sx={{ marginBottom: 2, fontWeight: 'bold' }}>
                  Generate Payroll
                </Typography>
                <Typography variant="h6" component="h2" sx={{ fontSize: 20, fontWeight: 'bold' }}>
                  Payroll Type
                </Typography>

                {/* Payroll Type Selection */}
                <Box display="flex" flexDirection="row" gap={2} sx={{ marginTop: 2 }}>
                  <Button
                    variant={selectedPayrollType === "Semi-Monthly" ? "contained" : "outlined"}
                    onClick={() => handleSelectPayrollType("Semi-Monthly")}
                    disabled={selectedPayrollType && selectedPayrollType !== "Semi-Monthly"}
                  >
                    Semi Monthly
                  </Button>

                  <Button
                    variant={selectedPayrollType === "Monthly" ? "contained" : "outlined"}
                    onClick={() => handleSelectPayrollType("Monthly")}
                    disabled={selectedPayrollType && selectedPayrollType !== "Monthly"}
                  >
                    Monthly
                  </Button>
                  <Button
                    variant={selectedPayrollType === "Special-Run" ? "contained" : "outlined"}
                    onClick={() => handleSelectPayrollType("Special-Run")}
                  >
                    Special Run
                  </Button>
                </Box>


                {/* Conditional Rendering for Selected Payroll Type */}
                {selectedPayrollType === "Semi-Monthly" && payrollCycles["Semi-Monthly"] && (
                  <Box sx={{ marginTop: 2 }}>
                    <Typography variant="h6" component="h2" sx={{ fontWeight: "bold", textAlign: "center" }}>
                      Semi Monthly Cycles:
                    </Typography>
                    <Box display="flex" flexDirection="row" gap={2} sx={{ textAlign: "center", marginBottom: 2, justifyContent: "space-between" }}>
                      {payrollCycles["Semi-Monthly"]?.map((cycle, index) => (
                        <Typography key={index} variant="body1">
                          {format(new Date(cycle.start), "MMM-dd-yyyy")} - {format(new Date(cycle.end), "MMM-dd-yyyy")}
                        </Typography>
                      ))}
                    </Box>
                    <Box display="flex" flexDirection="row" gap={2} sx={{ textAlign: "center", marginBottom: 1, justifyContent: "space-between", marginRight: 6, marginLeft: 6 }}>
                      {payrollCycles["Semi-Monthly"]?.map((cycle, index) => (
                        <Button
                          key={index}
                          variant={selectedCycle?.trim() === cycle.label?.trim() ? "contained" : "outlined"}
                          disabled={selectedCycle && selectedCycle?.trim() !== cycle.label?.trim()} // disable all but the selected
                          onClick={() => {
                            setSelectedCycle(cycle.label);
                            setStartDate(new Date(cycle.start));
                            setEndDate(new Date(cycle.end));
                          }}
                        >
                          {cycle.label}
                        </Button>
                      ))}
                    </Box>
                  </Box>
                )}

                {selectedPayrollType === "Monthly" && payrollCycles["Monthly"]?.[0] && (
                  <Box sx={{ marginTop: 2 }}>
                    <Typography variant="h6" component="h2" sx={{ fontWeight: "bold", textAlign: "center" }}>
                      Monthly
                    </Typography>
                    <Typography variant="body1" sx={{ textAlign: "center", marginBottom: 2 }}>
                      Monthly: {payrollCycles["Monthly"][0].start} - {payrollCycles["Monthly"][0].end}
                    </Typography>
                    <Box display="flex" flexDirection="row" gap={2} sx={{ textAlign: "center", marginBottom: 1, justifyContent: "center" }}>
                      <Button
                        variant={selectedCycle === "Monthly" ? "contained" : "outlined"}
                        onClick={() => {
                          setSelectedCycle("Monthly");
                          setStartDate(new Date(payrollCycles["Monthly"][0].start));
                          setEndDate(new Date(payrollCycles["Monthly"][0].end));
                        }}
                      >
                        Monthly Cycle
                      </Button>
                    </Box>
                  </Box>
                )}


                {selectedPayrollType === "Special-Run" && (
                  <Box sx={{ marginTop: 2, textAlign: "center" }}>
                    <Typography
                      variant="h6"
                      component="h2"
                      sx={{ fontWeight: "bold" }}
                    >
                      Special Run:
                    </Typography>
                    <Typography sx={{ marginBottom: 2 }}>
                      13th Month Pay: January - December
                    </Typography>
                    <Box display="flex" justifyContent="center" sx={{ marginBottom: 1 }}>
                      <Button
                        variant={selectedCycle === "Special-Run" ? "contained" : "outlined"}
                        onClick={() => {
                          setSelectedCycle("Special-Run");
                          setStartDate(new Date(new Date().getFullYear(), 0, 1));
                          setEndDate(new Date(new Date().getFullYear(), 11, 31));
                        }}
                      >
                        Special Run Cycle
                      </Button>
                    </Box>
                  </Box>
                )}

                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    marginTop: 2,
                    gap: 2,
                  }}
                >
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      sx={{ width: '100%' }}
                      label="Date Start Point"
                      value={startDate}
                      onChange={(newValue) => setStartDate(newValue)}
                      renderInput={(params) => <TextField {...params} />}
                      disabled={!selectedCycle} // Disable if no payroll type is selected
                      maxDate={
                        selectedPayrollType === 'Semi-Monthly'
                          ? new Date(new Date().getFullYear(), new Date().getMonth(), 15)
                          : selectedPayrollType === 'Monthly'
                            ? new Date(new Date().getFullYear(), new Date().getMonth(), 31)
                            : new Date(new Date().getFullYear(), 11, 31)
                      }
                    />
                    <DatePicker
                      sx={{ width: '100%' }}
                      label="Date End Point"
                      value={endDate}
                      onChange={(newValue) => setEndDate(newValue)}
                      renderInput={(params) => <TextField {...params} />}
                      disabled={!selectedCycle} // Disable if no payroll type is selected
                      maxDate={
                        selectedPayrollType === 'Semi-Monthly'
                          ? new Date(new Date().getFullYear(), new Date().getMonth(), 16)
                          : selectedPayrollType === 'Monthly'
                            ? new Date(new Date().getFullYear(), new Date().getMonth(), 31)
                            : new Date(new Date().getFullYear(), 11, 31)
                      }
                    />
                  </LocalizationProvider>
                </Box>

                {/* Action Buttons */}
                <Box sx={{ marginTop: 2, display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={handleOpenPreview}
                  >
                    Payroll Preview
                  </Button>
                  <Button variant="outlined" onClick={handleCloseModal}>
                    Close
                  </Button>
                </Box>

              </Box>
            </Box>
          </Modal>
          {/*PREVIEW*/}
          <Modal open={openPreview} onClose={handleClosePreview} closeAfterTransition>
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
                  width: { xs: '80%', sm: '60%', md: '50%' },
                  boxShadow: 24,
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <CloseIcon onClick={handleClosePreview} sx={{ cursor: 'pointer', marginLeft: '96%' }} />
                <Typography variant="h4" component="h2" sx={{ marginBottom: 1, fontWeight: 'bold' }}>
                  Payroll Preview
                </Typography>

                {/* Payroll Preview */}
                {payrollPreview && (
                  <Box sx={{ marginTop: 4, padding: 2, border: '1px solid #ccc', borderRadius: '8px' }}>
                    <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                      Payroll Preview
                    </Typography>
                    <Typography variant="body1" sx={{ textAlign: 'center', marginBottom: 1 }}>
                      <strong>Payroll Type:</strong> {payrollPreview.payrollType}
                    </Typography>
                    <Typography variant="body1" sx={{ textAlign: 'center', marginBottom: 1 }}>
                      <strong>Payroll Cycle Type:</strong> {payrollPreview.payrollCycle}
                    </Typography>
                    <Typography variant="body1" sx={{ textAlign: 'center', marginBottom: 1 }}>
                      <strong>Start Date:</strong> {payrollPreview.startDate}
                    </Typography>
                    <Typography variant="body1" sx={{ textAlign: 'center', marginBottom: 1 }}>
                      <strong>End Date:</strong> {payrollPreview.endDate}
                    </Typography>
                    <Typography variant="body1" sx={{ textAlign: 'center' }}>
                      <strong>Total Days:</strong> {payrollPreview.totalDays}
                    </Typography>
                  </Box>
                )}
                {/* Action Buttons */}
                <Box sx={{ marginTop: 2, display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={(e) => {
                      e.preventDefault();
                      handleSubmit(e);
                    }}
                  >
                    Generate Payroll
                  </Button>
                  <Button variant="outlined" onClick={handleClosePreview}>
                    Close
                  </Button>
                </Box>
              </Box>
            </Box>
          </Modal>

          {/* View Payroll Modal */}
          <Modal
            open={openModal1}
            onClose={handleCloseModal1}
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
                  width: { xs: '100%', sm: '100%', md: '80%' },
                  boxShadow: 24,
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <CloseIcon onClick={handleCloseModal1} sx={{ cursor: 'pointer', marginLeft: '96%' }} />
                <Typography variant="h4" component="h2" sx={{ marginBottom: 2, fontWeight: 'bold' }}>
                  Payroll
                </Typography>

                <LocalizationProvider dateAdapter={AdapterDayjs}>

                  <Table hoverRow sx={{ marginTop: 0, marginLeft: 0 }} borderAxis="both">
                    <thead>
                      <tr>
                        <th style={{ width: '10%' }}>Employee No.</th>
                        <th style={{ width: '20%' }}>Name</th>
                        <th style={{ width: '20%' }}>Gross Pay</th>
                        <th style={{ width: '20%' }}>Deductions</th>
                        <th style={{ width: '20%' }}>Net Pay</th>
                        <th style={{ width: '20%' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payrollDetails ? (
                        payrollDetails.map((payroll, index) => (
                          <tr key={index}>
                            <td style={{ cursor: 'pointer' }}>{payroll.emp_id}</td>
                            <td style={{ cursor: 'pointer' }}>{payroll.full_name}</td>
                            <td style={{ cursor: 'pointer' }}>{formatCurrency(payroll.total_taxable_income)}</td>
                            <td style={{ cursor: 'pointer' }}>{formatCurrency(payroll.total_deduction)}</td>
                            <td style={{ cursor: 'pointer' }}>{formatCurrency(payroll.total_net_pay)}</td>
                            <td>
                              <Button
                                variant="contained"
                                style={{ width: '25%', fontSize: 12, fontWeight: 'bold' }}
                                onClick={() => handleOpenModalViewEmpPayroll(payroll.emp_id)}
                              >
                                View
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6">Loading payroll summary...</td> {/* Adjusted colspan to 6 */}
                        </tr>
                      )}
                    </tbody>
                  </Table>


                </LocalizationProvider>
                <Box sx={{ marginTop: 2 }}>
                  <Button variant="outlined" onClick={handleCloseModal1}>
                    Close
                  </Button>
                </Box>
              </Box>
            </Box>
          </Modal>

          <Modal //View Employee Payroll
            open={openModalViewEmpPayroll}
            onClose={handleCloseModalViewEmpPayroll}
            closeAfterTransition
          >
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', p: 2 }}>
              <Box sx={{
                backgroundColor: 'white',
                padding: 4,
                width: { xs: '90%', sm: '70%', md: '60%' },
                height: { xs: '90%', sm: '70%', md: '80%' },
                boxShadow: 24,
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                overflow: 'hidden',
                overflowY: 'auto'
              }}
              ><CloseIcon onClick={handleCloseModalViewEmpPayroll} sx={{ cursor: 'pointer', marginLeft: '96%' }} />
                <Typography variant="h4" sx={{ marginBottom: 2 }}>
                  Payroll
                </Typography>
                <Box sx={{ marginTop: 2, overscrollBehavior: 'contain' }}>

                  <Typography variant="h5" component="h2" style={{ display: 'flex', justifyContent: 'flex-start', fontWeight: 'bold' }}>
                    Employee Payroll Information
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1 }}>
                    <TextField label="Employee ID" sx={{ marginLeft: 1, width: '20%' }} inputProps={{ readOnly: true }} value={employeeData?.emp_id || ''} />
                    <TextField label="Fullname" sx={{ marginLeft: 1, width: '80%' }} inputProps={{ readOnly: true }} value={employeeData?.full_name || ''} />

                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 2 }}>
                    <TextField label="Status" sx={{ marginLeft: 1, width: '30%' }} inputProps={{ readOnly: true }} value={employeeData?.emp_status || ''} />
                    <TextField label="Employment Type" sx={{ marginLeft: 1, width: '40%' }} inputProps={{ readOnly: true }} value={employeeData?.emp_emptype || ''} />
                    <TextField label="Department" sx={{ marginLeft: 1, width: '30%' }} inputProps={{ readOnly: true }} value={employeeData?.emp_dept || ''} />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 2 }} inputProps={{ readOnly: true }} >
                    <TextField label="Position" sx={{ marginLeft: 1, width: '33%' }} inputProps={{ readOnly: true }} value={employeeData?.emp_pos || ''} />
                    <TextField label="Hourly Rate" sx={{ marginLeft: 1, width: '33%' }} inputProps={{ readOnly: true }} value={formatCurrency(employeeData?.hourly_rate || '')} />
                    <TextField label="Rate" sx={{ marginLeft: 1, width: '33%' }} inputProps={{ readOnly: true }} value={formatCurrency(employeeData?.emp_rate || '')} />
                    <TextField label="Rate Type" sx={{ marginLeft: 1, width: '33%' }} inputProps={{ readOnly: true }} value={employeeData?.emp_ratetype || ''} />
                  </Box>
                  <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', marginTop: 2 }}>
                    Earnings</Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1 }} inputProps={{ readOnly: true }} >
                    <TextField label="Total of Hours" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={employeeData?.total_hours_ || ''} />
                    <TextField label="Total of Worked Hours" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={employeeData?.total_hours_work || ''} />
                  </Box>
                  <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', fontStyle: 'italic', marginTop: 1 }}>
                    Regular Shift</Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1 }} inputProps={{ readOnly: true }} >
                    <TextField label="Total of Hours" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={employeeData?.total_reg_hours_rt1_r || ''} />
                    <TextField label="Total of Amount" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={formatCurrency(employeeData?.total_regular_hours_value_rt1 || '')} />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1 }} inputProps={{ readOnly: true }} >
                    <TextField label="Total of Overtime Hours" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={employeeData?.overtime_regular_hours_rt1_r || ''} />
                    <TextField label="Total of Overtime Amount" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={formatCurrency(employeeData?.total_overtime_hours_value_rt1 || '')} />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1 }} inputProps={{ readOnly: true }} >
                    <TextField label="Total of Night Differential Hours" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={employeeData?.total_nightdiff_hours_rt1_r || ''} />
                    <TextField label="Total of Night Differential Amount" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={formatCurrency(employeeData?.total_nightdiff_hours_value_rt1 || '')} />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1 }} inputProps={{ readOnly: true }} >
                    <TextField label="Total of Night Differential Overtime  Hours" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={employeeData?.overtime_nightdiff_hours_rt1_r || ''} />
                    <TextField label="Total of Night Differential Overtime Amount" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={formatCurrency(employeeData?.total_overtime_nightdiff_hours_value_rt1 || '')} />
                  </Box>

                  <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', fontStyle: 'italic', marginTop: 1 }}>
                    Rest Day Shift</Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1 }} inputProps={{ readOnly: true }} >
                    <TextField label="Total of Hours" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={employeeData?.total_reg_hours_rt2_rd || ''} />
                    <TextField label="Total of Amount" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={formatCurrency(employeeData?.total_regular_hours_value_rt2 || '')} />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1 }} inputProps={{ readOnly: true }} >
                    <TextField label="Total of Overtime Hours" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={employeeData?.overtime_regular_hours_rt2_rd || ''} />
                    <TextField label="Total of Overtime Amount" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={formatCurrency(employeeData?.total_overtime_hours_value_rt2 || '')} />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1 }} inputProps={{ readOnly: true }} >
                    <TextField label="Total of Night Differential Hours" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={employeeData?.total_nightdiff_hours_rt2_rd || ''} />
                    <TextField label="Total of Night Differential Amount" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={formatCurrency(employeeData?.total_nightdiff_hours_value_rt2 || '')} />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1 }} inputProps={{ readOnly: true }} >
                    <TextField label="Total of Night Differential Overtime  Hours" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={employeeData?.overtime_nightdiff_hours_rt2_rd || ''} />
                    <TextField label="Total of Night Differential Overtime Amount" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={formatCurrency(employeeData?.total_overtime_nightdiff_hours_value_rt2 || '')} />
                  </Box>

                  <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', fontStyle: 'italic', marginTop: 1 }}>
                    Special holiday Shift</Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1 }} inputProps={{ readOnly: true }} >
                    <TextField label="Total of Hours" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={employeeData?.total_reg_hours_rt3_sh || ''} />
                    <TextField label="Total of Amount" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={formatCurrency(employeeData?.total_regular_hours_value_rt3 || '')} />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1 }} inputProps={{ readOnly: true }} >
                    <TextField label="Total of Overtime Hours" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={employeeData?.overtime_regular_hours_rt3_sh || ''} />
                    <TextField label="Total of Overtime Amount" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={formatCurrency(employeeData?.total_overtime_hours_value_rt3 || '')} />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1 }} inputProps={{ readOnly: true }} >
                    <TextField label="Total of Night Differential Hours" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={employeeData?.total_nightdiff_hours_rt3_sh || ''} />
                    <TextField label="Total of Night Differential Amount" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={formatCurrency(employeeData?.total_nightdiff_hours_value_rt3 || '')} />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1 }} inputProps={{ readOnly: true }} >
                    <TextField label="Total of Night Differential Overtime  Hours" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={employeeData?.overtime_nightdiff_hours_rt3_sh || ''} />
                    <TextField label="Total of Night Differential Overtime Amount" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={formatCurrency(employeeData?.total_overtime_nightdiff_hours_value_rt3 || '')} />
                  </Box>

                  <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', fontStyle: 'italic', marginTop: 1 }}>
                    Special holiday on a Rest Day Shift</Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1 }} inputProps={{ readOnly: true }} >
                    <TextField label="Total of Hours" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={employeeData?.total_reg_hours_rt4_shrd || ''} />
                    <TextField label="Total of Amount" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={formatCurrency(employeeData?.total_regular_hours_value_rt4 || '')} />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1 }} inputProps={{ readOnly: true }} >
                    <TextField label="Total of Overtime Hours" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={employeeData?.overtime_regular_hours_rt4_shrd || ''} />
                    <TextField label="Total of Overtime Amount" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={formatCurrency(employeeData?.total_overtime_hours_value_rt4 || '')} />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1 }} inputProps={{ readOnly: true }} >
                    <TextField label="Total of Night Differential Hours" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={employeeData?.total_nightdiff_hours_rt4_shrd || ''} />
                    <TextField label="Total of Night Differential Amount" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={formatCurrency(employeeData?.total_nightdiff_hours_value_rt4 || '')} />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1 }} inputProps={{ readOnly: true }} >
                    <TextField label="Total of Night Differential Overtime  Hours" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={employeeData?.overtime_nightdiff_hours_rt4_shrd || ''} />
                    <TextField label="Total of Night Differential Overtime Amount" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={formatCurrency(employeeData?.total_overtime_nightdiff_hours_value_rt4 || '')} />
                  </Box>

                  <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', fontStyle: 'italic', marginTop: 1 }}>
                    Double Special Holiday Shift</Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1 }} inputProps={{ readOnly: true }} >
                    <TextField label="Total of Hours" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={employeeData?.total_reg_hours_rt5_dsh || ''} />
                    <TextField label="Total of Amount" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={formatCurrency(employeeData?.total_regular_hours_value_rt5 || '')} />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1 }} inputProps={{ readOnly: true }} >
                    <TextField label="Total of Overtime Hours" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={employeeData?.overtime_regular_hours_rt5_dsh || ''} />
                    <TextField label="Total of Overtime Amount" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={formatCurrency(employeeData?.total_overtime_hours_value_rt5 || '')} />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1 }} inputProps={{ readOnly: true }} >
                    <TextField label="Total of Night Differential Hours" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={employeeData?.total_nightdiff_hours_rt5_dsh || ''} />
                    <TextField label="Total of Night Differential Amount" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={formatCurrency(employeeData?.total_nightdiff_hours_value_rt5 || '')} />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1 }} inputProps={{ readOnly: true }} >
                    <TextField label="Total of Night Differential Overtime  Hours" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={employeeData?.overtime_nightdiff_hours_rt5_dsh || ''} />
                    <TextField label="Total of Night Differential Overtime Amount" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={formatCurrency(employeeData?.total_overtime_nightdiff_hours_value_rt5 || '')} />
                  </Box>

                  <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', fontStyle: 'italic', marginTop: 1 }}>
                    Double Special Holiday on a Rest Day Shift</Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1 }} inputProps={{ readOnly: true }} >
                    <TextField label="Total of Hours" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={employeeData?.total_reg_hours_rt6_dshrd || ''} />
                    <TextField label="Total of Amount" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={formatCurrency(employeeData?.total_regular_hours_value_rt6 || '')} />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1 }} inputProps={{ readOnly: true }} >
                    <TextField label="Total of Overtime Hours" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={employeeData?.overtime_regular_hours_rt6_dshrd || ''} />
                    <TextField label="Total of Overtime Amount" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={formatCurrency(employeeData?.total_overtime_hours_value_rt6 || '')} />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1 }} inputProps={{ readOnly: true }} >
                    <TextField label="Total of Night Differential Hours" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={employeeData?.total_nightdiff_hours_rt6_dshrd || ''} />
                    <TextField label="Total of Night Differential Amount" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={formatCurrency(employeeData?.total_nightdiff_hours_value_rt6 || '')} />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1 }} inputProps={{ readOnly: true }} >
                    <TextField label="Total of Night Differential Overtime  Hours" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={employeeData?.overtime_nightdiff_hours_rt6_dshrd || ''} />
                    <TextField label="Total of Night Differential Overtime Amount" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={formatCurrency(employeeData?.total_overtime_nightdiff_hours_value_rt6 || '')} />
                  </Box>

                  <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', fontStyle: 'italic', marginTop: 1 }}>
                    Regular Holiday Shift</Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1 }} inputProps={{ readOnly: true }} >
                    <TextField label="Total of Hours" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={employeeData?.total_reg_hours_rt7_rh || ''} />
                    <TextField label="Total of Amount" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={formatCurrency(employeeData?.total_regular_hours_value_rt7 || '')} />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1 }} inputProps={{ readOnly: true }} >
                    <TextField label="Total of Overtime Hours" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={employeeData?.overtime_regular_hours_rt7_rh || ''} />
                    <TextField label="Total of Overtime Amount" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={formatCurrency(employeeData?.total_overtime_hours_value_rt7 || '')} />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1 }} inputProps={{ readOnly: true }} >
                    <TextField label="Total of Night Differential Hours" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={employeeData?.total_nightdiff_hours_rt7_rh || ''} />
                    <TextField label="Total of Night Differential Amount" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={formatCurrency(employeeData?.total_nightdiff_hours_value_rt7 || '')} />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1 }} inputProps={{ readOnly: true }} >
                    <TextField label="Total of Night Differential Overtime  Hours" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={employeeData?.overtime_nightdiff_hours_rt7_rh || ''} />
                    <TextField label="Total of Night Differential Overtime Amount" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={formatCurrency(employeeData?.total_overtime_nightdiff_hours_value_rt7 || '')} />
                  </Box>

                  <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', fontStyle: 'italic', marginTop: 1 }}>
                    Regular Holiday on a Rest Day Shift</Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1 }} inputProps={{ readOnly: true }} >
                    <TextField label="Total of Hours" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={employeeData?.total_reg_hours_rt8_rhrd || ''} />
                    <TextField label="Total of Amount" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={formatCurrency(employeeData?.total_regular_hours_value_rt8 || '')} />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1 }} inputProps={{ readOnly: true }} >
                    <TextField label="Total of Overtime Hours" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={employeeData?.overtime_regular_hours_rt8_rhrd || ''} />
                    <TextField label="Total of Overtime Amount" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={formatCurrency(employeeData?.total_overtime_hours_value_rt8 || '')} />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1 }} inputProps={{ readOnly: true }} >
                    <TextField label="Total of Night Differential Hours" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={employeeData?.total_nightdiff_hours_rt8_rhrd || ''} />
                    <TextField label="Total of Night Differential Amount" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={formatCurrency(employeeData?.total_nightdiff_hours_value_rt8 || '')} />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1 }} inputProps={{ readOnly: true }} >
                    <TextField label="Total of Night Differential Overtime  Hours" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={employeeData?.overtime_nightdiff_hours_rt8_rhrd || ''} />
                    <TextField label="Total of Night Differential Overtime Amount" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={formatCurrency(employeeData?.total_overtime_nightdiff_hours_value_rt8 || '')} />
                  </Box>
                  <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', fontStyle: 'italic', marginTop: 1 }}>
                    Double Regular Holiday Shift</Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1 }} inputProps={{ readOnly: true }} >
                    <TextField label="Total of Hours" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={employeeData?.total_reg_hours_rt9_drh || ''} />
                    <TextField label="Total of Amount" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={formatCurrency(employeeData?.total_regular_hours_value_rt9 || '')} />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1 }} inputProps={{ readOnly: true }} >
                    <TextField label="Total of Overtime Hours" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={employeeData?.overtime_regular_hours_rt9_drh || ''} />
                    <TextField label="Total of Overtime Amount" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={formatCurrency(employeeData?.total_overtime_hours_value_rt9 || '')} />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1 }} inputProps={{ readOnly: true }} >
                    <TextField label="Total of Night Differential Hours" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={employeeData?.total_nightdiff_hours_rt9_drh || ''} />
                    <TextField label="Total of Night Differential Amount" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={formatCurrency(employeeData?.total_nightdiff_hours_value_rt9 || '')} />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1 }} inputProps={{ readOnly: true }} >
                    <TextField label="Total of Night Differential Overtime  Hours" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={employeeData?.overtime_nightdiff_hours_rt9_drh || ''} />
                    <TextField label="Total of Night Differential Overtime Amount" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={formatCurrency(employeeData?.total_overtime_nightdiff_hours_value_rt9 || '')} />
                  </Box>
                  <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', fontStyle: 'italic', marginTop: 1 }}>
                    Double Regular Holiday on a Rest Day Shift</Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1 }} inputProps={{ readOnly: true }} >
                    <TextField label="Total of Hours" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={employeeData?.total_reg_hours_rt10_drhrd || ''} />
                    <TextField label="Total of Amount" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={formatCurrency(employeeData?.total_regular_hours_value_rt10 || '')} />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1 }} inputProps={{ readOnly: true }} >
                    <TextField label="Total of Overtime Hours" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={employeeData?.overtime_regular_hours_rt10_drhrd || ''} />
                    <TextField label="Total of Overtime Amount" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={formatCurrency(employeeData?.total_overtime_hours_value_rt10 || '')} />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1 }} inputProps={{ readOnly: true }} >
                    <TextField label="Total of Night Differential Hours" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={employeeData?.total_nightdiff_hours_rt10_drhrd || ''} />
                    <TextField label="Total of Night Differential Amount" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={formatCurrency(employeeData?.total_nightdiff_hours_value_rt10 || '')} />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1 }} inputProps={{ readOnly: true }} >
                    <TextField label="Total of Night Differential Overtime  Hours" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={employeeData?.overtime_nightdiff_hours_rt10_drhrd || ''} />
                    <TextField label="Total of Night Differential Overtime Amount" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={formatCurrency(employeeData?.total_overtime_nightdiff_hours_value_rt10 || '')} />
                  </Box>
                  <Divider sx={{ my: 4 }} />
                  <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', marginTop: 1 }}>
                    De Minimis Benifits</Typography>

                  <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', fontStyle: 'italic', marginTop: 1 }}>
                    Monthly</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1 }} inputProps={{ readOnly: true }} >
                    <TextField label="Rice Allowance" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={formatCurrency(employeeData?.rice_allow || '')} />
                    <TextField label="Uniform or Clothing Allowance" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={formatCurrency(employeeData?.clothing_allow || '')} />
                    <TextField label="Laundry Allowance" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={formatCurrency(employeeData?.laundry_allow || '')} />
                    <TextField label="Medical Cash Allowance" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={formatCurrency(employeeData?.medical_allow || '')} />
                  </Box>
                  <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', fontStyle: 'italic', marginTop: 1 }}>
                    Annually</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1 }} inputProps={{ readOnly: true }} >
                    <TextField label="Achievement Awards" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={formatCurrency(employeeData?.achivement_allow || '')} />
                    <TextField label="Actual Medical Assistance" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={formatCurrency(employeeData?.actualmedical_assist || '')} />
                  </Box>

                  <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', marginTop: 1 }}>
                    Additional Benefits or Allowance</Typography>
                  {addallowance && addallowance.length > 0 ? (
                    addallowance.map((item, index) => (
                      <Box key={index} sx={{ display: 'flex', flexDirection: 'row', marginBottom: 2, marginTop: 2 }}>
                        <TextField
                          label="Allowance or Benefits Names"
                          value={item.allowance_name || ''}
                          InputProps={{ readOnly: true }}
                          sx={{ marginLeft: 1, width: '50%' }}
                        />
                        <TextField
                          label="Amount"
                          value={formatCurrency(item.allowance_value || 0)} // Ensure no errors if allowance_value is undefined
                          InputProps={{ readOnly: true }}
                          sx={{ marginLeft: 1, width: '30%' }}
                        />
                        <TextField
                          label="Allowance Type"
                          value={item.allowance_type || ''}
                          InputProps={{ readOnly: true }}
                          sx={{ marginLeft: 1, width: '20%' }}
                        />
                      </Box>
                    ))
                  ) : (
                    <Typography variant="h6" color="textSecondary" sx={{ textAlign: "center" }}>
                      No Additional Allowance
                    </Typography>
                  )}

                  <Divider sx={{ my: 4 }} />

                  <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', marginTop: 1 }}>
                    Deductions</Typography>

                  <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', fontStyle: 'italic', marginTop: 1 }}>
                    Tax</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1 }} inputProps={{ readOnly: true }} >
                    <TextField label="Excess Tax" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={formatCurrency(employeeData?.Excess_tax || '')} />
                    <TextField label="Percenatge Deduction" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={(employeeData?.percentage_deduction_tax || '') + '%'} />
                    <TextField label="Total Amount Percentage Tax" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={formatCurrency(employeeData?.total_percentage_tax || '')} />
                    <TextField label="Total Fixed Tax" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={formatCurrency(employeeData?.total_fixed_tax || '')} />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1 }} inputProps={{ readOnly: true }} >
                    <TextField label="Total Tax Amount" sx={{ marginLeft: 1, width: '100%' }} inputProps={{ readOnly: true }} value={formatCurrency(employeeData?.total_tax || '')} />
                  </Box>

                  <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', fontStyle: 'italic', marginTop: 1 }}>
                    Goverment Contributions</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1 }} inputProps={{ readOnly: true }} >
                    <TextField label="Social Secuirity System (SSS)" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={formatCurrency(employeeData?.employee_sss_share || '')} />
                    <TextField label="Social Secuirity System (SSS)(WISP)" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={formatCurrency(employeeData?.wisp_employee_share || '')} />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1 }} inputProps={{ readOnly: true }} >
                    <TextField label="PhilHealth" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={formatCurrency(employeeData?.employee_philhealth || '')} />
                    <TextField label=" Home Development Mutual Fund (HDMF)" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} value={formatCurrency(employeeData?.employee_hdmf || '')} />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1 }} inputProps={{ readOnly: true }} >
                    <TextField label="Total Government Contribution" sx={{ marginLeft: 1, width: '100%' }} inputProps={{ readOnly: true }} value={formatCurrency(totalShare)} />
                  </Box>


                  <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', fontStyle: 'italic', marginTop: 1 }}>
                    Loans</Typography>
                  <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', fontStyle: 'italic', marginTop: 1 }}>
                    Goverment Loans</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1 }} inputProps={{ readOnly: true }} >
                    <TextField label="Social Secuirity System (SSS)" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} />
                    <TextField label="PhilHealth" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} />
                    <TextField label=" Home Development Mutual Fund (HDMF)" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} />
                  </Box>
                  <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', fontStyle: 'italic', marginTop: 1 }}>
                    Company Loans</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1 }} inputProps={{ readOnly: true }} >
                    <TextField label="Social Secuirity System (SSS)" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} />
                    <TextField label="PhilHealth" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} />
                    <TextField label=" Home Development Mutual Fund (HDMF)" sx={{ marginLeft: 1, width: '50%' }} inputProps={{ readOnly: true }} />
                  </Box>


                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div onClick={handleCloseModalViewEmpPayroll} >
                      <Button variant="contained" style={buttonstyle}>Close</Button>
                    </div >
                  </div>

                </Box>
              </Box>
            </Box>
          </Modal>
        </Box>
      </Box>

      {confirmClose && (
        <Portal>
          <Snackbar
            open={confirmClose}
            autoHideDuration={3000}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            sx={{
              zIndex: 1301,  // Ensures it appears on top
            }}
          >
            <Alert
              severity="warning"
              action={
                <>
                  <Button color="inherit" size="small" onClick={() => handleConfirmClose(true)}>
                    Yes
                  </Button>
                  <Button color="inherit" size="small" onClick={() => handleConfirmClose(false)}>
                    No
                  </Button>
                </>
              }
            >
              Are you sure you want to close this? The data filled will not be saved.
            </Alert>
          </Snackbar>
        </Portal>
      )}

      {/* Main Snackbar */}
      <Portal>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={snackbarSeverity === 'warning' || snackbarSeverity === 'success' ? 3000 : 6000} // Set duration based on severity
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          sx={{
            zIndex: 1301,  // Ensures it appears on top
          }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={snackbarSeverity}
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Portal>

    </>
  );
}
