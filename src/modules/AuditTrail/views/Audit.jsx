import React, { useState, useEffect } from 'react';
import SideNav from '../../../shared/components/SideNav';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import PremiumTable, { TableSkeleton, TableEmptyState } from '../../../shared/components/PremiumTable';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import axios from 'axios';

const drawerWidth = 240;

export default function Audit() {
  const [audit, setAudit] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlldata();
  }, []);
  
  const fetchAlldata = async () => {
    try {
      const res = await axios.get('http://localhost:8800/fetch-audit');
      console.log(res.data)
      setAudit(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
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

        <Box sx={{ flexGrow: 1, mt: 10, ml: -12, mr: 3, minWidth: 0 }}>
          <PremiumTable>
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
              {loading ? (
                <TableSkeleton rows={8} columns={['id', 'avatarText', 'chip', 'date', 'textLong']} />
              ) : audit.length === 0 ? (
                <TableEmptyState
                  colSpan={5}
                  icon={HistoryOutlinedIcon}
                  title="No audit activity"
                  description="System actions are recorded here so you can trace who changed what, and when."
                />
              ) : audit.map((aud, key) => (
                  <tr key={key}>
                    <td style={{ cursor: 'pointer' }}>{aud.audit_id}</td>
                    <td style={{ cursor: 'pointer' }}>{aud.username}</td>
                    <td style={{ cursor: 'pointer' }}>{aud.role}</td>
                    <td style={{ cursor: 'pointer' }}>{aud.date}</td>
                    <td style={{ cursor: 'pointer' }}>{aud.action}</td>
                  </tr>
                ))}
            </tbody>
          </PremiumTable>
        </Box>
      </Box>
    </>
  );
}