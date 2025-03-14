import React, { useState } from 'react';
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
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const drawerWidth = 240;

export default function EmployeeAttendance() {
  const [openModal, setOpenModal] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [search, setSearch] = useState('');

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleFileData = (data) => {
    setAttendanceData(data);
  };


  const exportToPDF = () => {
    const input = document.getElementById('attendance-table'); // ID of the table

    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgWidth = 190; // Set the width of the image in the PDF
      const pageHeight = pdf.internal.pageSize.height;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('attendance.pdf');
    });
  };

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
            <SearchBar onSearchChange={(value) => setSearch(value)} />
          </Grid>
          <Box>
            <Button type="Submit" color="primary" variant="outlined" sx={{ marginRight: 1 }} onClick={handleOpenModal} >Upload Attendance </Button>
            <Button color='primary' variant='outlined' onClick={exportToPDF}>Export Attendance</Button>
          </Box>
        </Grid>
        <TableAttendance onSearch={search} data={attendanceData} />
      </Box>
      <UploadAttendanceModal
        onOpen={openModal}
        onClose={handleCloseModal}
        onFileData={handleFileData}
      />
    </Box>
  );
}
