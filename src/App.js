import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Dashboard from './Pages/Dashboard';
import Login from './Pages/Login';
 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/dashboard' element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;