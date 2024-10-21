import React, { useState, useEffect } from 'react';
import SideNav from '../Components/SideNav';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Table from '@mui/joy/Table';
import { Button } from '@mui/material';
import axios from 'axios';
import SearchBar from '../Components/SearchBar'
import { useDialogs } from '@toolpad/core';
import Grid from '@mui/joy/Grid';


const drawerWidth = 240;

export default function ManageAccount() {
  const [ManageUsers, setManageUsers] = useState([]);
  const dialogs = useDialogs();

  useEffect(() => {
    fetchusers();
  }, []);

  const fetchusers = async () => {
    try {
      const res = await axios.get('http://localhost:8800/manage-users');
      console.log(res.data)
      setManageUsers(res.data);
    } catch (err) {
      console.log(err);
    }
  }

  return (
      <Box sx={{ display: "flex" }}>
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
            Manage Account
            </Typography>
      
          </Toolbar>
        </AppBar>
        <Box sx={{ flexGrow: 1, p: 3, mt: 7, ml: -11 }}>

        <Grid container spacing={0} direction="row" sx={{ flexGrow: 1, justifyContent: "space-between", alignItems: "center", marginBottom: 0 }}>
            <Grid size={4} sx={{ marginLeft: -3 }}>
              <SearchBar />
            </Grid>
            <Grid size={4}>
              <Button type='Submit' color="primary" variant="contained" sx={{ marginRight: 3 }} > Add User Account</Button>
            </Grid>
          </Grid>

        <Table hoverRow sx={{}} borderAxis='both'>
          <thead>
            <tr>
              <th style={{ width: '10%' }}>Employee Id</th>
              <th style={{ width: '40%' }}>Employee Name</th>
              <th style={{ width: '20%' }}>Employee Position</th>
              <th style={{ width: '20%' }}>Configuration</th>
            </tr>
          </thead>
          <tbody>
            {ManageUsers.map((emp, i) => (
              <tr key={i}>
                <td style={{ cursor: "pointer" }}>{emp.employee_id}</td>
                <td style={{ cursor: "pointer" }}>{emp.first_name +" "+ emp.last_name}</td>
                <td style={{ cursor: "pointer" }}>{emp.position}</td>
                <td >
                  <Button variant='contained' style={{ width: '70%', fontSize: 12, alignItems: "center", fontWeight: 'bold' }} >Mange Account </Button>
                </td>
              </tr>
            ))}
        
          </tbody>
        </Table>
      </Box>
      </Box>
  );
}
