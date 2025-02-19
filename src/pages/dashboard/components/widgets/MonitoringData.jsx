import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../../../firebase";
import { useAuth } from "../../../../contexts/AuthContext";
import mqtt from 'mqtt';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
} from "@material-tailwind/react";
import { WiHumidity } from "react-icons/wi";
import { FaThermometerHalf } from "react-icons/fa";
import { GiWaterDrop } from "react-icons/gi";

const MonitoringData = () => {
  const { user } = useAuth();
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [sensorData, setSensorData] = useState(null);
  const [mqttClient, setMqttClient] = useState(null);

  const mqttConfig = {
    host: 'wss://aovyutir1busg-ats.iot.ap-southeast-2.amazonaws.com/mqtt',
    clientId: `web_${Math.random().toString(16).substr(2, 8)}`,
    protocol: 'wss',
  };

  // Fetch devices from Firestore
  useEffect(() => {
    const fetchDevices = async () => {
      if (!user?.uid) return; // Ensure user is available
      try {
        const q = query(collection(db, "devices"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const userDevices = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDevices(userDevices);
        if (userDevices.length > 0) {
          setSelectedDeviceId(userDevices[0].deviceId);
        }
      } catch (error) {
        console.error("Error fetching devices:", error);
      }
    };
    fetchDevices();
  }, [user]); // ✅ Runs only when `user` changes
  

  // Connect to MQTT when a device is selected
  useEffect(() => {
    if (!selectedDeviceId) return; // ✅ Ensure a device is selected
  
    const client = mqtt.connect(mqttConfig);
  
    client.on("connect", () => {
      console.log("Connected to MQTT broker");
      client.subscribe(`smart_irrigation/sensor_data/${selectedDeviceId}`);
    });
  
    client.on("message", (topic, message) => {
      try {
        const payload = JSON.parse(message.toString());
        if (topic === `smart_irrigation/sensor_data/${selectedDeviceId}`) {
          setSensorData({
            temperature: parseFloat(payload.temperature) || 0,
            humidity: parseFloat(payload.humidity) || 0,
            moisture: parseInt(payload.soil_moisture) || 0,
            pumpStatus: payload.pump_status === "ON",
          });
        }
      } catch (error) {
        console.error("Error parsing MQTT message:", error);
      }
    });
  
    setMqttClient(client);
  
    return () => client.end();
  }, [selectedDeviceId]); // ✅ Wait for `selectedDeviceId` before connecting
  

  return (
    <div className="flex flex-col w-full p-4 sm:p-10">
      <Card className="bg-[#f1f3f4] p-4 sm:p-10">
        <CardHeader className="text-xl sm:text-2xl font-bold mb-4">Monitoring Data</CardHeader>
        <CardBody>
          {devices.length > 0 ? (
            <div>
              <Typography variant="h6">Select Device</Typography>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {devices.map((device) => (
                  <button
                    key={device.id}
                    className={`p-3 rounded-lg ${
                      selectedDeviceId === device.deviceId ? "bg-blue-500 text-white" : "bg-gray-300"
                    }`}
                    onClick={() => setSelectedDeviceId(device.deviceId)}
                  >
                    {device.name} - {device.status}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <Typography className="text-red-500 text-center">No devices found. Please add a device.</Typography>
          )}

          {selectedDeviceId && sensorData && (
            <div className="mt-6">
              <Typography variant="h6">Sensor Data</Typography>
              <div className="flex flex-wrap gap-4">
                <Card className="p-4 bg-white">
                  <FaThermometerHalf size={40} />
                  <Typography>Temperature: {sensorData.temperature}°C</Typography>
                </Card>
                <Card className="p-4 bg-white">
                  <WiHumidity size={40} />
                  <Typography>Humidity: {sensorData.humidity}%</Typography>
                </Card>
                <Card className="p-4 bg-white">
                  <GiWaterDrop size={40} />
                  <Typography>Soil Moisture: {sensorData.moisture}%</Typography>
                </Card>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default MonitoringData;
