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
            <SearchBar />
          </Toolbar>
        </AppBar>

        <Table hoverRow sx={{ marginTop: 10, marginLeft: -12 }} borderAxis='both'>
          <thead>
            <tr>
              <th style={{ width: '10%' }}>Employee Id</th>
              <th style={{ width: '20%' }}>Employee Name</th>
              <th>Employee Position</th>
              <th>Configuration</th>
            </tr>
          </thead>
          <tbody>
            {archivedlist.map((emp, i) => (
              <tr key={i}>
                <td style={{ cursor: "pointer" }}>{emp.emp_id}</td>
                <td style={{ cursor: "pointer" }}>{emp.f_name}</td>
                <td style={{ cursor: "pointer" }}>{emp.l_name}</td>
                <td>
                  <Button variant='contained' style={{ width: '25%', fontSize: 12, fontWeight: 'bold' }} onClick={() => handleUnarchive(emp.emp_id)}>Unarchive</Button>
                </td>
              </tr>
            ))}
        
          </tbody>
        </Table>
      </Box>
  );
}
