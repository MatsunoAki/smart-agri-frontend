import React, { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../../../../../firebase"
import {
Card,
CardHeader,
CardBody,
Typography,
} from "@material-tailwind/react";
import { WiHumidity } from "react-icons/wi"; // Humidity icon
import { FaThermometerHalf } from "react-icons/fa"; // Temperature icon
import { GiWaterDrop } from "react-icons/gi"; // Water drop icon
import { MdPowerSettingsNew } from "react-icons/md"; // Pump status icon

const MonitoringData = () => {
// Mock sensor data - replace with actual data from Firebase or API
const [sensorData, setSensorData] = useState({
    temperature: 0,
    humidity: 0,
    moisture: 0,
    pumpStatus: false,
});

useEffect(() => {
    const sensorRef = ref(database, "sensor_data/ESP32_FARM_ABC123/readings");    // setSensorData(fetchedData);

    onValue(sensorRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            setSensorData({
                temperature: data.temperature || 0,
                humidity: data.humidity || 0,
                moisture: data.moisture || 0,
                pumpStatus: data.pump_status || false,
            });
        }
    });
}, []);

return (
    <div className="flex flex-col w-full p-10">
    {/* Title Section */}
    <h1 className="text-2xl font-bold mb-6 p-4">Plant Monitoring System</h1>

    {/* Sensor Data and Pump Status in a Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Temperature Card */}
        <Card>
        <CardHeader className="flex items-center gap-2">
            <FaThermometerHalf className="text-red-500 text-2xl" />
            <Typography variant="h6">Temperature</Typography>
        </CardHeader>
        <CardBody>
            <Typography variant="h4" className="font-semibold">
            {sensorData.temperature.toFixed(1)}°C
            </Typography>
        </CardBody>
        </Card>

        {/* Humidity Card */}
        <Card>
        <CardHeader className="flex items-center gap-2">
            <WiHumidity className="text-blue-500 text-2xl" />
            <Typography variant="h6">Humidity</Typography>
        </CardHeader>
        <CardBody>
            <Typography variant="h4" className="font-semibold">
            {sensorData.humidity.toFixed(1)}%
            </Typography>
        </CardBody>
        </Card>

        {/* Soil Moisture Card */}
        <Card>
        <CardHeader className="flex items-center gap-2">
            <GiWaterDrop className="text-green-500 text-2xl" />
            <Typography variant="h6">Soil Moisture</Typography>
        </CardHeader>
        <CardBody>
            <Typography variant="h4" className="font-semibold">
            {sensorData.moisture}%
            </Typography>
        </CardBody>
        </Card>

        {/* Pump Status Card */}
        <Card>
        <CardHeader className="flex items-center gap-2">
            <MdPowerSettingsNew
            className={`text-2xl ${
                sensorData.pumpStatus ? "text-green-500" : "text-red-500"
            }`}
            />
            <Typography variant="h6">Pump Status</Typography>
        </CardHeader>
        <CardBody>
            <Typography
            variant="h4"
            className={`font-semibold ${
                sensorData.pumpStatus ? "text-green-600" : "text-red-600"
            }`}
            >
            {sensorData.pumpStatus ? "ON" : "OFF"}
            </Typography>
        </CardBody>
        </Card>
    </div>
    </div>
);
};

export default MonitoringData;
