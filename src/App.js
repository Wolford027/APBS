import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Dashboard from './Pages/Dashboard'
import Login from './Pages/Login'
import EmployeeList from './Employee/EmployeeList'
import EmployeeAttendance from './Employee/EmployeeAttendance'
import ArchivedEmployee from './Employee/ArchivedEmployee'
import Payroll from './Payroll/Payroll'
import Deductions from './Payroll/Deductions'
import Earnings from './Payroll/Earnings'
import Loans from './Payroll/Loans'
import Payslip from './Payroll/Payslip'
 

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;