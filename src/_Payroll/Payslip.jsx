import React, { useState, useEffect } from 'react'
import SideNav from '../Components/SideNav'
import Box from '@mui/material/Box'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Table from '@mui/joy/Table'
import axios from 'axios'
import { Button } from '@mui/material'
import SearchBar from '../Components/SearchBar'
import Grid from '@mui/joy/Grid';

const drawerWidth = 240;

export default function Payslip() {

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
            <Typography variant="h6" noWrap component="div" > Payslip </Typography>
          </Toolbar>
        </AppBar>
        <Box sx={{ flexGrow: 1, p: 3, mt: 7, ml: -11 }}>
          <Grid container spacing={0} direction="row" sx={{ flexGrow: 1, justifyContent: "space-between", alignItems: "center" }} >
            <Grid size={4} sx={{ marginLeft: -3 }}>
              <SearchBar />
            </Grid>
            <Grid size={4} sx={{ marginRight: -3 }}>
              <Button type='Submit' color="primary" variant="outlined" sx={{ marginRight: 3, }}> Generate Payslip</Button>
            </Grid>
          </Grid>

          <Table hoverRow sx={{}} borderAxis="both">
            <thead>
              <tr>
                <th style={{ width: '10%' }}>Payslip No.</th>
                <th style={{ width: '20%' }}>Date</th>
                <th style={{ width: '10%' }}>Year</th>
                <th style={{ width: '10%' }}>Month</th>
                <th style={{ width: '20%' }} >Action</th>
              </tr>
            </thead>
            <tbody>
              <tr >
                <td style={{ cursor: 'pointer' }}>{ }</td>
                <td style={{ cursor: 'pointer' }}>{ }</td>
                <td style={{ cursor: 'pointer' }}>{ }</td>
                <td style={{ cursor: 'pointer' }}>{ }</td>
                <td>
                  <Button variant='contained' style={{ marginRight: 5, width: '25%', fontSize: 12, fontWeight: 'bold' }} >Lock</Button>
                  <Button variant='contained' style={{ width: '25%', fontSize: 12, fontWeight: 'bold' }}> View </Button>
                  <Button variant='contained' style={{ marginRight: 5, marginLeft: 5, width: '35%', fontSize: 12, fontWeight: 'bold' }} >Update</Button>
                </td>
              </tr>
            </tbody>
          </Table>
        </Box>
      </Box>
    </>
  );
}
