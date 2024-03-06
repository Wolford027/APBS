import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Dashboard from './Pages/Dashboard';
import Login from './Pages/Login';
import EmployeeList from './Pages/EmployeeList';
 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/employee-list' element={<EmployeeList/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;