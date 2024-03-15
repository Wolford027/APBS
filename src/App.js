import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Dashboard from './Pages/Dashboard'
import Login from './Pages/Login'
import EmployeeList from './Employee/EmployeeList'
import EmployeeAttendance from './Employee/EmployeeAttendance'
import EmployeeLoan from './Employee/EmployeeLoan'
import Payroll from './Payroll/Payroll'
 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/employee-list' element={<EmployeeList/>} />
        <Route path='/employee-attendance' element={<EmployeeAttendance/>} />
        <Route path='/employee-loan' element={<EmployeeLoan/>} />
        <Route path='/payroll' element={<Payroll/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;