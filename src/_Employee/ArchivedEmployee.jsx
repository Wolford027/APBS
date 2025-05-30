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

export default function ArchivedEmployee() {
  const [archivedlist, setArchivedlist] = useState([]);
  const dialogs = useDialogs();

  useEffect(() => {
    fetchArchive();
  }, []);

  const fetchArchive = async () => {
    try {
      const res = await axios.get('http://localhost:8800/archived');
      console.log(res.data)
      setArchivedlist(res.data);
    } catch (err) {
      console.log(err);
    }
  }

  const handleUnarchive = async (id) => {
    const confirmed = await dialogs.confirm('Are you sure you want to Unarchive this?', {
      okText: 'Yes',
      cancelText: 'No',
    });
    if (confirmed) {
      try {
        const response = await axios.put(`http://localhost:8800/emp/${id}`, { is_archive: 0 });
        console.log(response.data);
        if (response.data.status === 1) {
          // Remove the unarchived employee from the archived list
          setArchivedlist(archivedlist.filter(arch => arch.id !== id));
          fetchArchive();
        } else {
          alert('Failed to unarchive employee');
        }
        await dialogs.alert("Unarchived Successful");
      } catch (error) {
        console.error("There was an error unarchiving the employee!", error);
      }
    } else {
      await dialogs.alert('Ok, forget about it!');
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
              Archived Employees
            </Typography>
      
          </Toolbar>
        </AppBar>
        <Box sx={{ flexGrow: 1, p: 3, mt: 7, ml: -11 }}>

        <Grid container spacing={0} direction="row" sx={{ flexGrow: 1, justifyContent: "space-between",     alignItems: "center", marginBottom:0  }} >
            <Grid size={4} sx={{ marginLeft:-3 }}>
              <SearchBar />
            </Grid>
          
          </Grid>

        <Table hoverRow sx={{}} borderAxis='both'>
          <thead>
            <tr>
              <th style={{ width: '10%' }}>Employee Id</th>
              <th style={{ width: '20%' }}>Employee Name</th>
              <th>Employee Position</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {archivedlist.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '1rem', color: 'gray' }}>
                  No archived employees found.
                </td>
              </tr>
            ) : (
              archivedlist.map((emp) => (
                <tr key={emp.emp_id}>
                  <td style={{ cursor: "pointer" }}>{emp.emp_id}</td>
                  <td style={{ cursor: "pointer" }}>{emp.f_name + " " + emp.l_name}</td>
                  <td style={{ cursor: "pointer" }}>{emp.emp_pos}</td>
                  <td>
                    <Button
                      variant='contained'
                      style={{ width: '25%', fontSize: 12, fontWeight: 'bold' }}
                      onClick={() => handleUnarchive(emp.emp_id)}
                    >
                      Unarchive
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Box>
      </Box>
  );
}
