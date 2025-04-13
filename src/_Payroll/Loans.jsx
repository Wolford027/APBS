import React, { useState, useEffect } from 'react'
import SideNav from '../Components/SideNav'
import Box from '@mui/material/Box'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Table from '@mui/joy/Table'
import axios from 'axios'
import { Button, Modal, TextField, Autocomplete } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import SearchBar from '../Components/SearchBar'
import ModalClose from '@mui/joy/ModalClose';
import Divider from '@mui/material/Divider';
import Grid from '@mui/joy/Grid';
import ViewListLoans from '../_Modals/ViewListLoans';
const drawerWidth = 240;

export default function Loans() {

  function getLoans() {
    axios.get('http://localhost:8800/loans').then(function (response) {
    });
  }



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
            Loans
          </Typography>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}>
        <Toolbar />
        <Grid container spacing={2}>
          <Grid xs={12} md={12}>
            <ViewListLoans />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
