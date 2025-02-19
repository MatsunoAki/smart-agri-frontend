import { useState, useEffect } from "react";
import { ref, onValue, off, set } from "firebase/database";
import { database } from "../../../../../firebase";
import { useAuth } from "../../../../contexts/AuthContext";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Alert,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input
} from "@material-tailwind/react";

const DeviceList = () => {
  const { user } = useAuth();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [deviceName, setDeviceName] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [registrationCode, setRegistrationCode] = useState("");
  
  const handleAddDevice = async () => {
    if (!deviceName || !deviceId || !registrationCode) {
      alert("Please fill in all fields.");
      return;
    }
  
    try {
      const token = await user.getIdToken(); // 🔥 Get Firebase Auth Token
  
      const response = await fetch("http://your-api-url/api/devices/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ Attach token here
        },
        body: JSON.stringify({
          deviceId,
          deviceName,
          userId: user.uid,  // Attach user ID for linking device
          registrationCode,
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || "Failed to register device.");
      }
  
      alert("Device registered successfully!");
      setOpen(false);
      setDeviceName("");
      setDeviceId("");
      setRegistrationCode("");
    } catch (error) {
      console.error("Error adding device:", error);
      alert(error.message || "Failed to add device. Please try again.");
    }
  };
  
  
  return (
    <div className="flex flex-col w-full p-10">
      <h1 className="text-2xl font-bold mb-6">Your Devices</h1>
      {loading && <Alert color="blue">Loading devices...</Alert>}
      {!loading && devices.length === 0 && (
        <Alert color="red">
          <Typography variant="h6">No devices found</Typography>
          <Typography variant="paragraph">Please add a device to see it here.</Typography>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          className="shadow-md p-4 flex items-center justify-center cursor-pointer bg-gray-100 hover:bg-gray-200 transition-all"
          onClick={() => setOpen(true)}
        >
          <CardBody className="flex flex-col items-center">
            <Typography variant="h4" className="font-bold text-gray-600">+</Typography>
            <Typography variant="h6" className="text-gray-700">Add Device</Typography>
          </CardBody>
        </Card>

        {devices.map((device) => (
          <Card key={device.id} className="shadow-md p-4">
            <CardHeader className="bg-gray-100 p-3 rounded-t">
              <Typography variant="h6" className="text-gray-700">
                {device.name || "Unnamed Device"}
              </Typography>
            </CardHeader>
            <CardBody className="flex flex-col gap-2">
              <Typography variant="h5" className="font-semibold">
                Status: <span className={device.status === "online" ? "text-green-500" : "text-red-500"}>{device.status || "Unknown"}</span>
              </Typography>
              <Typography variant="small" className="text-gray-500">
                Last Active: {device.lastActive || "N/A"}
              </Typography>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Device Registration Modal */}
      <Dialog open={open} handler={() => setOpen(false)}>
        <DialogHeader className="mb-6">Add New Device</DialogHeader>
        <DialogBody className="space-y-6">
          <Input
            label="Device Name"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            className="mb-3"
          />
          <Input
            label="Device ID"
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
            className="mb-3"
          />
          <Input
            label="Registration Code"
            value={registrationCode}
            onChange={(e) => setRegistrationCode(e.target.value)}
            className="mb-3"
          />
        </DialogBody>
        <DialogFooter className="flex justify-end space-x-4">
          <Button variant="text" color="red" onClick={() => setOpen(false)}>Cancel</Button>
          <Button color="blue" onClick={handleAddDevice}>Add Device</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default DeviceList;
