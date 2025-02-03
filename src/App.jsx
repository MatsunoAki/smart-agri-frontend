import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; 
import './App.css'
import Home from './pages/Home'
import Navbar from './Components/Navbar'
import Login from './pages/Auth/login'
import Register from './pages/Auth/register'
import Dashboard from './pages/dashboard/Dashboard';
import { useState } from 'react'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}
export default App