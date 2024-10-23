import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Dashboard from './Pages/Dashboard';
import Login from './Pages/Login';
import EmployeeList from './_Employee/EmployeeList';
import EmployeeAttendance from './_Employee/EmployeeAttendance';
import EmployeeLeave from './_Employee/EmployeeLeave';
import ArchivedEmployee from './_Employee/ArchivedEmployee';
import Payroll from './_Payroll/Payroll';
import Deductions from './_Payroll/Deductions';
import Earnings from './_Payroll/Earnings';
import Loans from './_Payroll/Loans';
import Payslip from './_Payroll/Payslip';
import UserAccount from './_Accounts/UserProfile';
import ManageAccount from './_Accounts/ManageAccount';
import AuditTrail from './_AuditTrail/Audit';
import EmployeeRep from './_Reports/EmployeeReport';
import PayrollRep from './_Reports/PayrollReport';
import SystemVariable from './_SystemVariable/SystemVariable';
import Backup from './_Backup&Restore/Backup';
import Loading from './Pages/Loading';
import ForgotPass from './Pages/ForgotPass';
import { AuthProvider } from './_Auth/AuthContext';
import ProtectedRoute from './_Auth/ProtectedRoute';
import { DialogsProvider } from '@toolpad/core';
import AttendancePage from './Pages/AttendancePage';

function App() {
  return (
    <AuthProvider>
      <DialogsProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/loading" element={<Loading />} />
          <Route path="/forgot-password" element={<ForgotPass />} />
          <Route path="/attendance-scan" element={<AttendancePage />} />

          {/* Admin Routes */}
          <Route path="/manage-account" element={<ProtectedRoute element={<ManageAccount />} allowedRoles={['admin']} />} />
          <Route path="/audit-trail" element={<ProtectedRoute element={<AuditTrail />} allowedRoles={['admin']} />} />
          <Route path="/system-variable" element={<ProtectedRoute element={<SystemVariable />} allowedRoles={['admin']} />} />
          <Route path="/backup-restore" element={<ProtectedRoute element={<Backup />} allowedRoles={['admin']} />} />

          {/* User and Admin Routes */}
          <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} allowedRoles={['admin', 'hr', 'accountant']} />} />
          <Route path="/employee-list" element={<ProtectedRoute element={<EmployeeList />} allowedRoles={['admin', 'hr']} />} />
          <Route path="/employee-attendance" element={<ProtectedRoute element={<EmployeeAttendance />} allowedRoles={['admin', 'hr']} />} />
          <Route path="/employee-leave" element={<ProtectedRoute element={<EmployeeLeave />} allowedRoles={['admin', 'hr']} />} />
          <Route path="/archived-employee" element={<ProtectedRoute element={<ArchivedEmployee />} allowedRoles={['admin', 'hr']} />} />
          <Route path="/payroll" element={<ProtectedRoute element={<Payroll />} allowedRoles={['admin', 'accountant']} />} />
          <Route path="/deductions" element={<ProtectedRoute element={<Deductions />} allowedRoles={['admin', 'accountant']} />} />
          <Route path="/earings" element={<ProtectedRoute element={<Earnings />} allowedRoles={['admin', 'accountant']} />} />
          <Route path="/loans" element={<ProtectedRoute element={<Loans />} allowedRoles={['admin', 'accountant']} />} />
          <Route path="/payslip" element={<ProtectedRoute element={<Payslip />} allowedRoles={['admin', 'accountant']} />} />
          <Route path="/user-profile" element={<ProtectedRoute element={<UserAccount />} allowedRoles={['admin', 'hr']} />} />
          <Route path="/employee-report" element={<ProtectedRoute element={<EmployeeRep />} allowedRoles={['admin', 'hr']} />} />
          <Route path="/payroll-report" element={<ProtectedRoute element={<PayrollRep />} allowedRoles={['admin', 'accountant']} />} />
        </Routes>
      </BrowserRouter>
      </DialogsProvider>
    </AuthProvider>
  );
}

export default App;
