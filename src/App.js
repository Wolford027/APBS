import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Dashboard from './Pages/Dashboard';
import Login from './Pages/Login';
import EmployeeList from './_Employee/EmployeeList';
import EmployeeAttendance from './_Employee/EmployeeAttendance';
import ArchivedEmployee from './_Employee/ArchivedEmployee';
import Payroll from './_Payroll/Payroll';
import Deductions from './_Payroll/Deductions';
import Earnings from './_Payroll/Earnings';
import Loans from './_Payroll/Loans';
import Payslip from './_Payroll/Payslip';
import UserAccount from './_Accounts/UsersAccount';
import ManageAccount from './_Accounts/ManageAccount';
import AuditTrail from './_AuditTrail/Audit';
import EmployeeRep from './_Reports/EmployeeReport';
import PayrollRep from './_Reports/PayrollReport';
import SystemVariable from './_SystemVariable/SystemVariable';
import Loading from './Pages/Loading';
import ForgotPass from './Pages/ForgotPass';
import { AuthProvider } from './_Auth/AuthContext';
import ProtectedRoute from './_Auth/ProtectedRoute';
import { DialogsProvider } from '@toolpad/core';

function App() {
  return (
    <AuthProvider>
      <DialogsProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/loading" element={<Loading />} />
          <Route path="/forgot-password" element={<ForgotPass />} />

          {/* Admin Routes */}
          <Route path="/manage-account" element={<ProtectedRoute element={<ManageAccount />} allowedRoles={['admin']} />} />
          <Route path="/audit-trail" element={<ProtectedRoute element={<AuditTrail />} allowedRoles={['admin']} />} />
          <Route path="/system-variable" element={<ProtectedRoute element={<SystemVariable />} allowedRoles={['admin']} />} />

          {/* User and Admin Routes */}
          <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} allowedRoles={['admin', 'user']} />} />
          <Route path="/employee-list" element={<ProtectedRoute element={<EmployeeList />} allowedRoles={['admin', 'user']} />} />
          <Route path="/employee-attendance" element={<ProtectedRoute element={<EmployeeAttendance />} allowedRoles={['admin', 'user']} />} />
          <Route path="/archived-employee" element={<ProtectedRoute element={<ArchivedEmployee />} allowedRoles={['admin', 'user']} />} />
          <Route path="/payroll" element={<ProtectedRoute element={<Payroll />} allowedRoles={['admin', 'user']} />} />
          <Route path="/deductions" element={<ProtectedRoute element={<Deductions />} allowedRoles={['admin', 'user']} />} />
          <Route path="/earings" element={<ProtectedRoute element={<Earnings />} allowedRoles={['admin', 'user']} />} />
          <Route path="/loans" element={<ProtectedRoute element={<Loans />} allowedRoles={['admin', 'user']} />} />
          <Route path="/payslip" element={<ProtectedRoute element={<Payslip />} allowedRoles={['admin', 'user']} />} />
          <Route path="/user-account" element={<ProtectedRoute element={<UserAccount />} allowedRoles={['admin', 'user']} />} />
          <Route path="/employee-report" element={<ProtectedRoute element={<EmployeeRep />} allowedRoles={['admin', 'user']} />} />
          <Route path="/payroll-report" element={<ProtectedRoute element={<PayrollRep />} allowedRoles={['admin', 'user']} />} />

          <Route path="*" element={<div>Page not Found</div>} />
        </Routes>
      </BrowserRouter>
      </DialogsProvider>
    </AuthProvider>
  );
}

export default App;
