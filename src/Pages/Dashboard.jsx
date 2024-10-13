import React, { useEffect } from 'react';
import Company from '../Components/Company';
import SideNav from '../Components/SideNav';
import DepartmentFilter from '../Components/DepartmentFilter';
import EmplBreakDownLoc from '../Components/DataWork';
import TotalEmployee from '../Components/TotalEmployee';
import Leaves from '../Components/Leaves';
import AttendanceDepartment from '../Components/AttendanceDepartment';
import Calendar from '../Components/Calendar';
import MiniStatisticsA from '../Components/MiniStatisticsA';
import MiniStatisticsI from '../Components/MiniStatisticsI';
import MiniStatisticsT from '../Components/MiniStatisticsT';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../_Auth/AuthContext';
import { Box, Grid } from '@mui/material';

export default function Dashboard() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <Box>
      <SideNav />
      <Box marginLeft={30}>
        <Grid container spacing={2} sx={{ padding: '20px', paddingTop: 0, marginTop:-12 }}>
          <Grid item xs={12} sm={6} md={4}>
            <MiniStatisticsA />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <MiniStatisticsI />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <MiniStatisticsT />
          </Grid>
        </Grid>

        <DepartmentFilter />
        <EmplBreakDownLoc />
        <Calendar />
        <TotalEmployee />
        <Leaves />
        <AttendanceDepartment />
      </Box>
    </Box>
  );
}
