import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Dashboard from "./pages/dashboard/Dashboard";
import DashboardHome from "./pages/dashboard/components/widgets/MonitoringData";
import Devices from "./pages/dashboard/components/widgets/DeviceList";
import PrivateRoute from "./Components/PrivateRoute";

function ProtectedRedirect() {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard/home" replace /> : <Home />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Redirect "/" to "/dashboard/home" if logged in */}
          <Route path="/" element={<ProtectedRedirect />} />

          {/* Public Routes */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Private Routes - Only for Logged-In Users */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />}>
              {/* Redirect /dashboard to /dashboard/home */}
              <Route index element={<Navigate to="/dashboard/home" replace />} />
              <Route path="home" element={<DashboardHome />} />
              <Route path="devices" element={<Devices />} />
            </Route>
          </Route>

          {/* Catch-all: Redirect unknown paths to Dashboard */}
          <Route path="*" element={<Navigate to="/dashboard/home" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
