import React, { useEffect } from 'react';
import Company from '../Components/Company';
import SideNav from '../Components/SideNav';
import DepartmentFilter from '../Components/DepartmentFilter';
import DataWork from '../Components/DataWork';
import TotalEmployee from '../Components/TotalEmployee';
import Leaves from '../Components/Leaves';
import AttendanceDepartment from '../Components/AttendanceDepartment';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../_Auth/AuthContext';

export default function Dashboard() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <>
      <SideNav />
      <Company />
      <DepartmentFilter />
      <DataWork />
      <TotalEmployee />
      <Leaves />
      <AttendanceDepartment />
    </>
  );
}
