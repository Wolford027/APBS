import React, { useState, useEffect } from 'react'
import SideNav from '../Components/SideNav'
import Box from '@mui/material/Box'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Table from '@mui/joy/Table'
import GenerateEmpReport from '../_Modals/GenerateEmpReport'



const drawerWidth = 240;

export default function EmployeeReport() {
  const [empreport, setEmpReport] = useState([]);
  const [generateReportModal, setGenerateReportModal] = useState(false);

  const OpenGenerateReportModal = () => {
    setGenerateReportModal(true);
  }

  const CloseGenerateReportModal = () => {
    setGenerateReportModal(false);
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
            <Button type='Submit' color="primary" variant="outlined" sx={{ marginRight: 3, marginBottom: 3 }} onClick={OpenGenerateReportModal}>Generate Employee Report</Button>
          </Grid>
          <Table hoverRow sx={{ marginTop: 0, marginLeft: 0 }} borderAxis="both">
            <thead>
              <tr>
                <th style={{ width: '5%' }}>Report No.</th>
                <th style={{ width: '10%' }}>Date</th>
                <th style={{ width: '30%' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {empreport.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center' }}>No data available</td>
                </tr>
              ) : (
                empreport.map((aud, key) => (
                  <tr key={key}>
                    <td style={{ cursor: 'pointer' }}>{aud.reportNo}</td>
                    <td style={{ cursor: 'pointer' }}>{aud.date}</td>
                    <td style={{ cursor: 'pointer' }}>{aud.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Grid>
        <GenerateEmpReport onOpen={generateReportModal} onClose={CloseGenerateReportModal} />
      </Box>
    </Box>
  )
}
