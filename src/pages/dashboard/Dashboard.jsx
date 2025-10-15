import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getDatabase, ref, onValue } from "firebase/database";
import Navbar from "./components/navbar/Navbar";
import Sidebar from "./components/sidebar/Sidebar";
import MonitoringData from "../..//pages/dashboard/components/widgets/MonitoringData"; // Import the monitoring component
import DeviceList from "../..//pages/dashboard/components/widgets/DeviceList"; // Import the device list component
const Dashboard = () => {
  const { user } = useAuth();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const db = getDatabase();

  useEffect(() => {
    if (!user) return;

    const userDevicesRef = ref(db, `users/${user.uid}/devices`);
    
    onValue(userDevicesRef, (snapshot) => {
      const userDevicesData = snapshot.val();
      if (!userDevicesData) {
        setDevices([]);
        setLoading(false);
        return;
      }

      const devicesArray = Object.keys(userDevicesData).map((deviceId) => ({
        id: deviceId,
        ...userDevicesData[deviceId], 
      }));

      setDevices(devicesArray);
      setLoading(false);
    });
  }, [user]);

  return (
    <div className="h-screen flex flex-col bg-[#f1f3f4]">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 p-5 overflow-y-auto max-h-screen">
          {/* Pass Selected Device ID to MonitoringData */}
          {selectedDeviceId && <MonitoringData deviceId={selectedDeviceId} />}
          
          {/* Pass selectedDeviceId to ReportsDashboard */}
          {selectedDeviceId && (
            <ReportsDashboard selectedDeviceId={selectedDeviceId} />
          )}
          {/* Renders Nested Routes */}
          <Outlet />
        </div>    
      </div>
    </div>
  );
  
};

export default Dashboard;
