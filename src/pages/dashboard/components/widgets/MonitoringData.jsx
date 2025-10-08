import React, { useState, useEffect } from "react";
import { ref, onValue, off, update } from "firebase/database";
import { database } from "../../../../../firebase";
import { useAuth } from "../../../../contexts/AuthContext";
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
import { MdPowerSettingsNew } from "react-icons/md";

const MonitoringData = () => {
  const { user } = useAuth();

  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [sensorData, setSensorData] = useState(null);

  // Fetch user devices
  useEffect(() => {
    if (!user) return;
    const devicesRef = ref(database, "devices");

    const unsubscribe = onValue(devicesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const userDevices = Object.keys(data)
          .map((key) => ({ id: key, ...data[key] }))
          .filter((device) => device.ownerUID === user.uid);

        setDevices(userDevices);
        if (userDevices.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(userDevices[0].id);
        }
      } else {
        setDevices([]);
      }
    });

    return () => off(devicesRef);
  }, [user]);

  // Listen for sensor data changes
  useEffect(() => {
    if (!selectedDeviceId) return;

    const dataRef = ref(database, `devices/${selectedDeviceId}/sensorData`);
    const unsubscribe = onValue(dataRef, (snapshot) => {
      if (snapshot.exists()) {
        setSensorData(snapshot.val());
      } else {
        setSensorData(null);
      }
    });

    return () => off(dataRef);
  }, [selectedDeviceId]);

  // Toggle pump ON/OFF manually
  const handlePumpToggle = () => {
    if (!selectedDeviceId || !sensorData) return;
    const newPumpStatus = !sensorData.pumpStatus;
    update(ref(database, `devices/${selectedDeviceId}/sensorData`), {
      pumpStatus: newPumpStatus,
    });
  };

  // Toggle AutoPump mode
  const handlePumpModeToggle = () => {
    if (!selectedDeviceId || !sensorData) return;
    const newAutoPump = !sensorData.autoPump;
    update(ref(database, `devices/${selectedDeviceId}/sensorData`), {
      autoPump: newAutoPump,
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 bg-[#f1f3f4] min-h-screen">
      {/* Sidebar */}
      <Card className="w-full lg:w-1/4 p-4 shadow-md bg-white">
        <CardHeader className="text-lg font-semibold mb-4">
          Your Devices
        </CardHeader>
        <CardBody className="flex flex-col gap-3">
          {devices.length > 0 ? (
            devices.map((device) => (
              <button
                key={device.id}
                className={`w-full text-left p-3 rounded-lg font-medium transition-all ${
                  selectedDeviceId === device.id
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 hover:bg-green-100"
                }`}
                onClick={() => setSelectedDeviceId(device.id)}
              >
                {device.name || device.id}
              </button>
            ))
          ) : (
            <Typography color="red" className="text-center">
              No registered devices.
            </Typography>
          )}
        </CardBody>
      </Card>
      {/* Monitoring Panel */}
      <Card className="flex-1 p-6 bg-white shadow-lg rounded-xl">
        {selectedDeviceId && sensorData ? (
          <>
            <CardHeader className="text-2xl font-bold mb-6">
              Monitoring:{" "}
              {
                devices.find((device) => device.id === selectedDeviceId)?.name ||
                "Unnamed Device"
              }
            </CardHeader>
      {/* Sensor Readings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Temperature",
            value: `${sensorData.temperature?.toFixed(1)}°C`,
            icon: (
              <FaThermometerHalf className="text-red-500 text-4xl" />
            ),
          },
          {
            label: "Humidity",
            value: `${sensorData.humidity?.toFixed(1)}%`,
            icon: <WiHumidity className="text-blue-500 text-4xl" />,
          },
          {
            label: "Soil Moisture",
            value: `${sensorData.soilMoisture}%`,
            icon: <GiWaterDrop className="text-green-500 text-4xl" />,
          },
          {
            label: "Pump Status",
            value: sensorData.pumpStatus ? "ON" : "OFF",
            icon: (
              <MdPowerSettingsNew
                className={`text-4xl ${
                  sensorData.pumpStatus
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              />
            ),
          },
        ].map((sensor, i) => (
          <Card key={i} className="p-4 bg-gray-50 rounded-lg shadow">
            <div className="flex items-center gap-3 mb-2">
              {sensor.icon}
              <Typography variant="h6">{sensor.label}</Typography>
            </div>
            <Typography className="text-2xl font-bold">
              {sensor.value}
            </Typography>
          </Card>
        ))}
      </div>
      {/* Pump Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <Card className="p-4 flex-1 bg-gray-50 shadow-md">
          <Typography variant="h6" className="mb-2 font-semibold">
            Pump Mode
          </Typography>
          <Typography
            variant="h5"
            className={`font-bold ${
              sensorData.autoPump ? "text-green-600" : "text-blue-600"
            }`}
          >
            {sensorData.autoPump ? "Automatic" : "Manual"}
          </Typography>
          <Button
            className="mt-4 bg-blue-600 text-white hover:bg-blue-700"
            onClick={handlePumpModeToggle}
          >
            Toggle Mode
          </Button>
        </Card>

        {!sensorData.autoPump && (
          <Card className="p-4 flex-1 bg-gray-50 shadow-md">
            <Typography variant="h6" className="mb-2 font-semibold">
              Manual Pump Control
            </Typography>
            <Typography
              variant="h5"
              className={`font-bold ${
                sensorData.pumpStatus ? "text-green-600" : "text-red-600"
              }`}
            >
              {sensorData.pumpStatus ? "Pump ON" : "Pump OFF"}
            </Typography>
            <Button
              className={`mt-4 ${
                sensorData.pumpStatus
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-green-600 hover:bg-green-700"
              } text-white`}
              onClick={handlePumpToggle}
            >
              {sensorData.pumpStatus ? "Turn OFF" : "Turn ON"}
            </Button>
          </Card>
        )}
      </div>
          </>
        ) : (
          <Typography
            variant="h5"
            color="red"
            className="text-center mt-20 font-semibold"
          >
            Select a device to view monitoring data.
          </Typography>
        )}
      </Card>
    </div>
  );
};

export default MonitoringData;
