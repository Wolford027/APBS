import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Dashboard from './modules/Dashboard/views/Dashboard';
import LandingPage from './modules/Landing/views/LandingPage';
import Login from './modules/Auth/views/Login';
import EmployeeList from './modules/Employee/views/EmployeeList';
import EmployeeAttendance from './modules/Employee/views/EmployeeAttendance';
import EmployeeLeave from './modules/Employee/views/EmployeeLeave';
import ArchivedEmployee from './modules/Employee/views/ArchivedEmployee';
import Payroll from './modules/Payroll/views/Payroll';
import Deductions from './modules/Payroll/views/Deductions';
import Earnings from './modules/Payroll/views/Earnings';
import Loans from './modules/Payroll/views/Loans';
import Payslip from './modules/Payroll/views/Payslip';
import UserAccount from './modules/Accounts/views/UserProfile';
import ManageAccount from './modules/Accounts/views/ManageAccount';
import AuditTrail from './modules/AuditTrail/views/Audit';
import EmployeeRep from './modules/Reports/views/EmployeeReport';
import PayrollRep from './modules/Reports/views/PayrollReport';
import SystemVariable from './modules/SystemVariable/views/SystemVariable';
import Backup from './modules/BackupRestore/views/Backup';
import Loading from './modules/Auth/views/Loading';
import ForgotPass from './modules/Auth/views/ForgotPass';
import { AuthProvider } from './modules/Auth/hooks/AuthContext';
import ProtectedRoute from './modules/Auth/components/ProtectedRoute';
import { DialogsProvider } from '@toolpad/core';
import RfidPage from './modules/Rfid/views/RfidPage';
import RegisterRfid from './modules/Rfid/views/RegisterRfid';


function App() {
  return (
    <AuthProvider>
      <DialogsProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/loading" element={<Loading />} />
          <Route path="/forgot-password" element={<ForgotPass />} />
          <Route path="/scan-rfid" element={<RfidPage />} />
          <Route path="/register-rfid" element={<RegisterRfid />} />
          {/* <Route path="/PayslipFormat" element={<PayslipFormat />} /> */}

          {/* Admin Routes */}
          <Route path="/manage-account" element={<ProtectedRoute element={<ManageAccount />} allowedRoles={['Admin']} />} />
          <Route path="/audit-trail" element={<ProtectedRoute element={<AuditTrail />} allowedRoles={['Admin']} />} />
          <Route path="/system-variable" element={<ProtectedRoute element={<SystemVariable />} allowedRoles={['Admin']} />} />
          <Route path="/backup-restore" element={<ProtectedRoute element={<Backup />} allowedRoles={['Admin']} />} />

          {/* User and Admin Routes */}
          <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} allowedRoles={['Admin', 'HR', 'Accountant']} />} />
          <Route path="/employee-list" element={<ProtectedRoute element={<EmployeeList />} allowedRoles={['Admin', 'HR']} />} />
          <Route path="/employee-attendance" element={<ProtectedRoute element={<EmployeeAttendance />} allowedRoles={['Admin', 'HR']} />} />
          <Route path="/employee-leave" element={<ProtectedRoute element={<EmployeeLeave />} allowedRoles={['Admin', 'HR']} />} />
          <Route path="/archived-employee" element={<ProtectedRoute element={<ArchivedEmployee />} allowedRoles={['Admin', 'HR']} />} />
          <Route path="/payroll" element={<ProtectedRoute element={<Payroll />} allowedRoles={['Admin', 'Accountant']} />} />
          <Route path="/deductions" element={<ProtectedRoute element={<Deductions />} allowedRoles={['Admin', 'Accountant']} />} />
          <Route path="/earings" element={<ProtectedRoute element={<Earnings />} allowedRoles={['Admin', 'Accountant']} />} />
          <Route path="/loans" element={<ProtectedRoute element={<Loans />} allowedRoles={['Admin', 'Accountant']} />} />
          <Route path="/payslip" element={<ProtectedRoute element={<Payslip />} allowedRoles={['Admin', 'Accountant']} />} />
          <Route path="/user-profile" element={<ProtectedRoute element={<UserAccount />} allowedRoles={['Admin', 'HR']} />} />
          <Route path="/employee-report" element={<ProtectedRoute element={<EmployeeRep />} allowedRoles={['Admin', 'HR']} />} />
          <Route path="/payroll-report" element={<ProtectedRoute element={<PayrollRep />} allowedRoles={['Admin', 'Accountant']} />} />
        </Routes>
      </BrowserRouter>
      </DialogsProvider>
    </AuthProvider>
  );
}

export default App;
