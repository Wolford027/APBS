import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Dashboard from './Pages/Dashboard'
import Login from './Pages/Login'
import EmployeeList from './_Employee/EmployeeList'
import EmployeeAttendance from './_Employee/EmployeeAttendance'
import ArchivedEmployee from './_Employee/ArchivedEmployee'
import Payroll from './_Payroll/Payroll'
import Deductions from './_Payroll/Deductions'
import Earnings from './_Payroll/Earnings'
import Loans from './_Payroll/Loans'
import Payslip from './_Payroll/Payslip'
import UserAccount from './_Accounts/UsersAccount'
import ManageAccount from './_Accounts/ManageAccount'
import AuditTrail from './_AuditTrail/Audit'
import EmployeeRep from './_Reports/EmployeeReport'
import PayrollRep from './_Reports/PayrollReport'
import SystemVariable from './_SystemVariable/SystemVariable'
 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/employee-list' element={<EmployeeList/>} />
        <Route path='/employee-attendance' element={<EmployeeAttendance/>} />
        <Route path='/archived-employee' element={<ArchivedEmployee/>} />
        <Route path='/payroll' element={<Payroll/>} />
        <Route path='/deductions' element={<Deductions/>} />
        <Route path='/earings' element={<Earnings/>} />
        <Route path='/loans' element={<Loans/>} />
        <Route path='/payslip' element={<Payslip/>} />
        <Route path='/user-account' element={<UserAccount/>} />
        <Route path='/manage-account' element={<ManageAccount/>} />
        <Route path='/audit-trail' element={<AuditTrail/>} />
        <Route path='/employee-report' element={<EmployeeRep/>} />
        <Route path='/payroll-report' element={<PayrollRep/>} />
        <Route path='/system-variable' element={<SystemVariable/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;