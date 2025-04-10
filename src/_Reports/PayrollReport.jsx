import React, { useState, useEffect } from 'react'
import SideNav from '../Components/SideNav'
import Box from '@mui/material/Box'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Table from '@mui/joy/Table'
import GeneratePayrollReport from '../_Modals/GeneratePayrollReport'
import axios from 'axios'



const drawerWidth = 240;

export default function PayrollReport() {
  const [payrollreport, setPayrollReport] = useState([]);
  const [generateReportModal, setGenerateReportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);


  useEffect(() => {
    fetchPayrollReport();
  }, []);

  const fetchPayrollReport = () => {
    axios.get('http://localhost:8800/fetch-payroll-report')
      .then((response) => {
        setPayrollReport(response.data);
      })
      .catch((error) => {
        console.error('Error fetching reports:', error);
      });
  }

  const OpenGenerateReportModal = () => {
    setSelectedReport(null); // create mode
    setIsViewMode(false);
    setGenerateReportModal(true);
  }

  const OpenViewModal = (report) => {
    setSelectedReport(report); // view mode
    setIsViewMode(true);
    setGenerateReportModal(true);
  }

  const CloseGenerateReportModal = () => {
    setGenerateReportModal(false);
  }

  const SubmitGenerateModal = (data) => {
    const newReport = {
      date: data.date,
      employeeId: data.employeeId,
      employeeName: data.employeeName,
      details: data.details
    };
  
    axios.post('http://localhost:8800/payroll-report', newReport)
      .then(() => console.log("Employee Report Created"))
      .catch((err) => console.log(err));
  
    setPayrollReport([...payrollreport, newReport]);
    fetchPayrollReport();
    setGenerateReportModal(false);
  }  

  return (
    <Box sx={{display: "flex" }}>
      <SideNav/>
      <AppBar position="fixed" sx={{ width: { sm: `calc(100% - ${drawerWidth}px)` }, ml: { sm: `${drawerWidth}px` } }}>
          <Toolbar>
            <Typography variant="h6" noWrap component="div">
            Payroll Report
            </Typography>
          </Toolbar>
      </AppBar>

      <Box sx={{ flexGrow: 1, p: 3, mt: 7, ml: -11 }}>
        <Grid container spacing={0} direction="row" sx={{ flexGrow: 1, justifyContent: "flex-end", alignItems: "center" }} >
          <Grid size={4} sx={{ marginRight: -3 }}>
            <Button type='Submit' color="primary" variant="outlined" sx={{ marginRight: 3, marginBottom: 3 }} onClick={OpenGenerateReportModal}>Generate Payroll Report</Button>
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
              {payrollreport.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center' }}>No data available</td>
                </tr>
              ) : (
                payrollreport.map((payrrep, key) => (
                  <tr key={key}>
                    <td style={{ cursor: 'pointer' }}>{payrrep.report_id}</td>
                    <td style={{ cursor: 'pointer' }}>{payrrep.date}</td>
                    <td style={{ cursor: 'pointer' }}>{payrrep.details}</td>
                    <td style={{ cursor: 'pointer' }}><Button variant='contained' onClick={() => OpenViewModal(payrrep)}>View</Button></td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Grid>
        <GeneratePayrollReport
          onOpen={generateReportModal}
          onClose={CloseGenerateReportModal}
          onSubmit={SubmitGenerateModal}
          readOnly={isViewMode}
          defaultValues={selectedReport}
        />
      </Box>
    </Box>
  )
}
