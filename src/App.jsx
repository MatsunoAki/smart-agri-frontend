import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; 
import './App.css'
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home'
import Navbar from './Components/Navbar'
import Login from './pages/Auth/login'
import Register from './pages/Auth/register'
import Dashboard from './pages/dashboard/Dashboard';
import Devices from './pages/dashboard/Devices';
import { useState } from 'react'

function App() {
  return (

    <Router>
    <AuthProvider>
    <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard/home" element={<Dashboard />} />
          <Route path="/dashboard/devices" element={<Devices />} />
        </Routes>
      </div>    </AuthProvider>
    </Router>
  );
}
export default App