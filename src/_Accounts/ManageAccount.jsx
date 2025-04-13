import React, { useState, useEffect } from 'react';
import SideNav from '../Components/SideNav';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Table from '@mui/joy/Table';
import { Button } from '@mui/material';
import axios from 'axios';
import SearchBar from '../Components/SearchBar';
import { useDialogs } from '@toolpad/core';
import Grid from '@mui/joy/Grid';
import ManageAccountModal from '../_Modals/ManageAccountModal';

const drawerWidth = 240;

export default function ManageAccount() {
  const [ManageUsers, setManageUsers] = useState([]);
  const [openModal, setOpenModal] = useState(false)
  const dialogs = useDialogs();

  const handleCloseModal = () => {
    setOpenModal(false)
  }

  const handleOpenModal = () => {
    setOpenModal(true)
  }

  useEffect(() => {
    fetchusers();
  }, []);

  const fetchusers = async () => {
    try {
      const res = await axios.get('http://localhost:8800/manage-users');
      console.log(res.data);
      // Filter out the admin user
      const filteredUsers = res.data.filter(user => user.role !== 'admin'); // Adjust 'role' and 'admin' as per your data structure
      setManageUsers(filteredUsers);
    } catch (err) {
      console.log(err);
    }
  };

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
                <td style={{ cursor: "pointer" }}>{emp.first_name + " " + emp.last_name}</td>
                <td style={{ cursor: "pointer" }}>{emp.position}</td>
                <td>
                  <Button variant='contained' style={{ width: '70%', fontSize: 12, alignItems: "center", fontWeight: 'bold' }} onClick={handleOpenModal}>Manage Account</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Box>
      <ManageAccountModal onOpen={openModal} onClose={handleCloseModal} />
    </Box>
  );
}