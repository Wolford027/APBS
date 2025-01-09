import React, { useState, useEffect } from 'react';
import SideNav from '../Components/SideNav';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Table from '@mui/joy/Table';
import axios from 'axios';

const drawerWidth = 240;

export default function Audit() {
  const [audit, setAudit] = useState([]);

  useEffect(() => {
    fetchAlldata();
  }, []);
  
  const fetchAlldata = async () => {
    try {
      const res = await axios.get('http://localhost:8800/login-history-fetch');
      console.log(res.data)
      setAudit(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <Box sx={{ display: "flex" }}>
        <SideNav />
        <AppBar position="fixed" sx={{ width: { sm: `calc(100% - ${drawerWidth}px)` }, ml: { sm: `${drawerWidth}px` }}}>
          <Toolbar>
            <Typography variant="h6" noWrap component="div">
              Audit Trail
            </Typography>
          </Toolbar>
        </AppBar>

        <Table hoverRow sx={{ marginTop: 10, marginLeft: -12 }} borderAxis="both">
          <thead>
            <tr>
              <th style={{ width: '5%' }}>Audit No.</th>
              <th style={{ width: '10%' }}>Employee Name</th>
              <th style={{ width: '10%' }}>Role</th>
              <th style={{ width: '10%' }}>Date</th>
              <th style={{ width: '10%' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {audit.map((aud, key) => (
                <tr key={key}>
                  <td style={{ cursor: 'pointer' }}>{aud.audit_id}</td>
                  <td style={{ cursor: 'pointer' }}>{aud.username}</td>
                  <td style={{ cursor: 'pointer' }}>{aud.role}</td>
                  <td style={{ cursor: 'pointer' }}>{aud.date}</td>
                  <td style={{ cursor: 'pointer' }}>Logged in</td>
                </tr>
              ))}
          </tbody>
        </Table>
      </Box>
    </>
  );
}