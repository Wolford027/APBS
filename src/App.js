import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Dashboard from './Pages/Dashboard'
import Login from './Pages/Login'
import EmployeeList from './Employee/EmployeeList'
import EmployeeAttendance from './Employee/EmployeeAttendance'
import ArchivedEmployee from './Employee/ArchivedEmployee'
import Payroll from './Payroll/Payroll'
 

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;