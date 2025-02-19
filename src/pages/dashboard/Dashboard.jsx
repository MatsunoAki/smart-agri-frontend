import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getDatabase, ref, onValue } from "firebase/database";
import Navbar from "./components/navbar/Navbar";
import Sidebar from "./components/sidebar/Sidebar";
import MonitoringData from "../..//pages/dashboard/components/widgets/MonitoringData"; // Import the monitoring component


const Dashboard = () => {
  const { user } = useAuth();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const db = getDatabase();

  console.log("Stored token:", localStorage.getItem("token"));
  const fetchProtectedData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token not found. Redirecting to login...");
        return; // Prevents unnecessary API call
      }
  
      const response = await fetch("http://localhost:3000/api/protected", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch protected data. Token may be invalid or expired.");
      }
  
      const data = await response.json();
      console.log("Protected data received:", data);
    } catch (error) {
      console.error("Error fetching protected data:", error);
      
      // If the error suggests an invalid/expired token, clear storage & redirect
      if (error.message.includes("Token may be invalid")) {
        localStorage.removeItem("token");
        window.location.href = "/login"; // Redirect to login
      }
    }
  };
  
  // Fetch data when the component mounts
  useEffect(() => {
    fetchProtectedData();
  }, []);
  

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
          <Outlet />
        </div>
      </div>
    </div>
  );
  
};

export default Dashboard;


