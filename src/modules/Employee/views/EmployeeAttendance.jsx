import React, { useState } from 'react';
import PageLayout from '../../../shared/components/PageLayout';
import Box from '@mui/material/Box';
import TableAttendance from '../components/TableAttendance';
import SearchBar from '../../../shared/components/SearchBar';
import { Button } from '@mui/material';
import UploadAttendanceModal from '../components/UploadAttendanceModal';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
    <PageLayout title="Employee Attendance">
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <SearchBar onSearchChange={(value) => setSearch(value)} />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button color="primary" variant="outlined" onClick={handleOpenModal}>Upload Attendance</Button>
          <Button color="primary" variant="outlined" onClick={exportToPDF}>Export Attendance</Button>
        </Box>
      </Box>
      <TableAttendance onSearch={search} data={attendanceData} />
      <UploadAttendanceModal
        onOpen={openModal}
        onClose={handleCloseModal}
        onFileData={handleFileData}
      />
    </PageLayout>
  );
}
