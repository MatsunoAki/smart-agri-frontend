import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../../../../../firebase"
import { Card, CardHeader, CardBody, Typography, Button, Alert, AlertDescription  } from "@material-tailwind/react";


const DeviceList = () => {
    const [devices, setDevices] = useState([]);

    useEffect(() => {
        const devicesRef = ref(database, "devices");

    onValue(devicesRef, (snapshot) => {
    if (snapshot.exists()) {
        const data = snapshot.val();
        const deviceArray = Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
        }));
        setDevices(deviceArray);
    } else {
        setDevices([]); // No data found
    }
        });
    }, []);
    
return (
    <div className="flex flex-col w-full p-10">
    <h1 className="text-2xl font-bold mb-6">Device List</h1>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {devices.map((device) => (
        <Card key={device.id}>
            <CardHeader>
            <Typography variant="h6">{device.name || "Unnamed Device"}</Typography>
            </CardHeader>
            <CardBody>
            <Typography variant="h5" className="font-semibold">
                Status: {device.status || "Unknown"}
            </Typography>
            <Typography variant="body2">
                Last Active: {device.lastActive || "N/A"}
            </Typography>
            </CardBody>
        </Card>
        ))}
    </div>
    </div>
);
};
    
export default DeviceList;

