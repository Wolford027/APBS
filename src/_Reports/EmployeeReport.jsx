import React, { useState, useEffect } from 'react'
import SideNav from '../Components/SideNav'
import Table from '@mui/joy/Table'
import { Button, Grid, Typography, Toolbar, AppBar, Box, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import GenerateEmpReport from '../_Modals/GenerateEmpReport'
import GeneratePayrollReport from '../_Modals/GeneratePayrollReport'
import axios from 'axios'



const drawerWidth = 240;

export default function EmployeeReport() {
  const [empreport, setEmpReport] = useState([]);
  const [generateEmployeeReportModal, setGenerateEmployeeReportModal] = useState(false);
  const [generatePayrollReportModal, setGeneratePayrollReportModal] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);


  useEffect(() => {
    fetchEmpReport();
  }, []);

  const fetchEmpReport = () => {
    axios.get('http://localhost:8800/fetch-emp-report')
      .then((response) => {
        setEmpReport(response.data);
      })
      .catch((error) => {
        console.error('Error fetching reports:', error);
      });
  }

  const OpenGenerateEmployeeReportModal = () => {
    setIsViewMode(false);
    setGenerateEmployeeReportModal(true);
    setOpenModal(false);
  }

  const OpenGeneratePayrollReportModal = () => {
    setIsViewMode(false);
    setGeneratePayrollReportModal(true);
    setOpenModal(false);
  }

  const OpenViewModal = (report) => {
    setIsViewMode(true);
    setGenerateEmployeeReportModal(true);
  }

  const CloseGenerateEmployeeReportModal = () => {
    setGenerateEmployeeReportModal(false);
  }

  const CloseGeneratePayrollReportModal = () => {
    setGeneratePayrollReportModal(false);
  }

  const CloseGenerateModal = () => {
    setOpenModal(false);
  }

  const OpenGenerateModal = () => {
    setOpenModal(true);
  }

  const SubmitGenerateReportModal = (data) => {
    const newReport = {
      date: data.date,
      employeeId: data.employeeId,
      employeeName: data.employeeName,
      details: data.details
    };
  
    axios.post('http://localhost:8800/emp-report', newReport)
      .then(() => console.log("Employee Report Created"))
      .catch((err) => console.log(err));
  
    setEmpReport([...empreport, newReport]);
    fetchEmpReport();
    setGenerateEmployeeReportModal(false);
    setGeneratePayrollReportModal(false);
  }  

  return (
    <Box sx={{display: "flex" }}>
      <SideNav/>
      <AppBar position="fixed" sx={{ width: { sm: `calc(100% - ${drawerWidth}px)` }, ml: { sm: `${drawerWidth}px` } }}>
          <Toolbar>
            <Typography variant="h6" noWrap component="div">
            Employee Report
            </Typography>
          </Toolbar>
      </AppBar>

      <Box sx={{ flexGrow: 1, p: 3, mt: 7, ml: -11 }}>
        <Grid container spacing={0} direction="row" sx={{ flexGrow: 1, justifyContent: "flex-end", alignItems: "center" }} >
          <Grid size={4} sx={{ marginRight: -3 }}>
            <Button type='Submit' color="primary" variant="outlined" sx={{ marginRight: 3, marginBottom: 3 }} onClick={OpenGenerateModal}>Generate Employee Report</Button>
          </Grid>
          <Table hoverRow sx={{ marginTop: 0, marginLeft: 0 }} borderAxis="both">
            <thead>
              <tr>
                <th style={{ width: '5%' }}>Report No.</th>
                <th style={{ width: '10%' }}>Date</th>
                <th style={{ width: '30%' }}>Details</th>
                <th style={{ width: '30%' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {empreport.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center' }}>No data available</td>
                </tr>
              ) : (
                empreport.map((emprep, key) => (
                  <tr key={key}>
                    <td style={{ cursor: 'pointer' }}>{emprep.report_id}</td>
                    <td style={{ cursor: 'pointer' }}>{emprep.date}</td>
                    <td style={{ cursor: 'pointer' }}>{emprep.details}</td>
                    <td style={{ cursor: 'pointer' }}><Button variant='contained' onClick={() => OpenViewModal(emprep)}>View</Button></td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Grid>
        <Dialog open={openModal} onClose={CloseGenerateModal} fullWidth maxWidth="sm">
          <DialogTitle>Select Type of Report</DialogTitle>
          <DialogContent>
            <Box>
              <Box>
                <Button onClick={OpenGenerateEmployeeReportModal} variant='contained'>Employee Report</Button>
                <Button onClick={OpenGeneratePayrollReportModal} variant='contained'>Payroll Report</Button>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={CloseGenerateModal} color="primary">Close</Button>
          </DialogActions>
        </Dialog>
        <GenerateEmpReport
          onOpen={generateEmployeeReportModal}
          onClose={CloseGenerateEmployeeReportModal}
          onSubmit={SubmitGenerateReportModal}
          readOnly={isViewMode}
          onTitle={"Employee"}
        />
        <GeneratePayrollReport
          onOpen={generatePayrollReportModal}
          onClose={CloseGeneratePayrollReportModal}
          onSubmit={SubmitGenerateReportModal}
          readOnly={isViewMode}
        />
      </Box>
    </Box>
  )
}
