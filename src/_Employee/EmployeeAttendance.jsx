// EmployeeAttendance.jsx
import React, { useState, useEffect } from 'react';
import SideNav from '../Components/SideNav';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import TableAttendance from '../Components/TableAttendance';
import SearchBar from '../Components/SearchBar';
import Grid from '@mui/joy/Grid';
import { Button } from '@mui/material';
import UploadAttendanceModal from '../_Modals/UploadAttendanceModal';
import axios from 'axios';

const drawerWidth = 240;

export default function EmployeeAttendance() {
  const [openModal, setOpenModal] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleFileData = (data) => {
    setAttendanceData(data);
  };

  const fetchAttendanceData = async () => {
    try {
      const response = await axios.get('http://localhost:8800/attendance');
      if (response.status === 200) {
        setAttendanceData(response.data);
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      alert('Failed to fetch attendance data. Please try again.');
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  return (
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
            Employee Attendance
          </Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{ flexGrow: 1, p: 3, mt: 7, ml: -11 }}>
        <Grid container spacing={0} direction="row" sx={{ flexGrow: 1, alignItems: 'center', marginBottom: 0, justifyContent: 'space-between' }}>
          <Grid size={4} sx={{ marginLeft: -3 }}>
            <SearchBar />
          </Grid>
          <Button
            type="Submit"
            color="primary"
            variant="contained"
            sx={{ marginRight: 3 }}
            onClick={handleOpenModal}
          >
            Upload Attendance
          </Button>
        </Grid>
        <TableAttendance data={attendanceData} />
      </Box>
      <UploadAttendanceModal 
        onOpen={openModal} 
        onClose={handleCloseModal} 
        onFileData={handleFileData} 
        onRefresh={fetchAttendanceData} // Pass fetchAttendanceData here
      />
    </Box>
  );
}
