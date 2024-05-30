import React, { useState, useEffect } from 'react'
import SideNav from '../Components/SideNav'
import Box from '@mui/material/Box'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Table from '@mui/joy/Table'
import axios from 'axios'


const drawerWidth = 240;

export default function Earnings() {

  const [earnings, setEarnings] = useState([]);

  useEffect(() => {
    getEarnings();
  },[]);

  function getEarnings() {
    axios.get('http://localhost/Another1/APBS/api/user/earnings/').then(function (response) {
      console.log(response.data);
      setEarnings(response.data);
    });
  }


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
            Earnings
          </Typography>
        </Toolbar>
    </AppBar>

    <Table hoverRow sx={{ marginTop: 10, marginLeft: -12 }} borderAxis="both">
          <thead>
            <tr>
              <th style={{ width: '10%' }}>ID No.</th>
              <th style={{ width: '20%' }}>Employee Name</th>
              <th>Salary</th>
            </tr>
          </thead>
          <tbody>
            {earnings.map((earn, key) => (
              <tr key={key}>
                <td style={{ cursor: 'pointer' }}>{earn.id}</td>
                <td style={{ cursor: 'pointer' }}>{earn.empName}</td>
                <td style={{ cursor: 'pointer' }}>{earn.position}</td>
              </tr>
            ))}
          </tbody>
        </Table>
    </Box>
    </>
  )
}
