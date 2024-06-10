import React, { useState, useEffect } from 'react'
import SideNav from '../Components/SideNav'
import Box from '@mui/material/Box'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Table from '@mui/joy/Table'


const drawerWidth = 240;

export default function EmployeeReport() {
  const [empreport, setEmpReport] = useState([]);



  return (
    <>
    <Box sx={{display: "flex" }}>
    <SideNav/>
    <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
          Employee Report
          </Typography>
        </Toolbar>
    </AppBar>

    <Table hoverRow sx={{marginTop: 10, marginLeft: -12}} borderAxis="both">
          <thead>
            <tr>
              <th style={{ width: '5%' }}>Report No.</th>
              <th style={{ width: '10%' }}>Date</th>
              <th style={{ width: '30%' }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {empreport.map((aud, key) => (
              <tr key={key}>
                <td style={{ cursor: 'pointer' }}>{}</td>
                <td style={{ cursor: 'pointer' }}>{}</td>
                <td style={{ cursor: 'pointer' }}>{}</td>
              </tr>
            ))}
          </tbody>
        </Table>
    </Box>
    </>
  )
}
