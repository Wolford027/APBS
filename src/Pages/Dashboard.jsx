import React, { useEffect } from 'react';
import Company from '../Components/Company';
import SideNav from '../Components/SideNav';
import DepartmentFilter from '../Components/DepartmentFilter';
import EmplBreakDownLoc from '../Components/DataWork';
import TotalEmployee from '../Components/TotalEmployee';
import Leaves from '../Components/Leaves';
import AttendanceDepartment from '../Components/AttendanceDepartment';
import Calendar from '../Components/Calendar';
import Data from '../Components/Data';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../_Auth/AuthContext';
import { Box } from '@mui/material';

export default function Dashboard() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row' }}>
      <SideNav />
      <Box sx={{ flexGrow: 1, padding: 2 }}>
        <DepartmentFilter />
        <EmplBreakDownLoc />
        <Calendar />
        <TotalEmployee />
        <Leaves />
        <AttendanceDepartment />
        <Data />
      </Box>
    </Box>
  );
}
