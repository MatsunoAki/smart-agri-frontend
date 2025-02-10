import { useState, useEffect } from "react";
import { ref, onValue, off, set } from "firebase/database";
import { database } from "../../../../../firebase";
import { useAuth } from "../../../../contexts/AuthContext"; // Import AuthContext to get user ID
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Alert,
  Button,
} from "@material-tailwind/react";

const DeviceList = () => {
  const { user } = useAuth(); // Get the logged-in user
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return; // Ensure user is logged in

    const devicesRef = ref(database, "devices");

    const unsubscribe = onValue(devicesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const filteredDevices = Object.keys(data)
          .map((key) => ({
            id: key,
            ...data[key],
          }))
          .filter((device) => device.userId === user.uid); // Filter devices by userId

        setDevices(filteredDevices);
      } else {
        setDevices([]);
      }
      setLoading(false); // Stop loading after data fetch
    });

    return () => off(devicesRef); // Unsubscribe on component unmount
  }, [user]);

  // ✅ Function to Add Device
  const handleAddDevice = () => {
    const deviceName = prompt("Enter Device Name:");
    if (!deviceName) return;

    const deviceId = deviceName.trim().replace(/\s+/g, "-").toLowerCase(); // Convert to a valid ID
    const deviceRef = ref(database, `devices/${deviceId}`);
    const userDeviceRef = ref(
      database,
      `users/${user.uid}/devices/${deviceId}`
    ); // Reference to user's devices

    const deviceData = {
      name: deviceName,
      status: "online",
      addedAt: new Date().toISOString(),
      userId: user.uid, // Attach user ID for filtering
    };

    // Save Device Data to Firebase
    set(deviceRef, deviceData)
      .then(() => {
        // Also save the device under the user's devices node
        return set(userDeviceRef, {
          addedAt: deviceData.addedAt,
          name: deviceData.name,
          status: deviceData.status,
        });
      })
      .then(() => {
        alert("Device added successfully!");
      })
      .catch((error) => {
        console.error("Error adding device:", error);
        alert("Failed to add device. Please try again.");
      });
  };

  return (
    <div className="flex flex-col w-full p-10">
      <h1 className="text-2xl font-bold mb-6">Your Devices</h1>

      {/* Show Loading Indicator */}
      {loading && <Alert color="blue">Loading devices...</Alert>}

      {/* Show No Devices Message */}
      {!loading && devices.length === 0 && (
        <Alert color="red">
          <Typography variant="h6">No devices found</Typography>
          <Typography variant="paragraph">
            Please add a device to see it here.
          </Typography>
        </Alert>
      )}

      {/* Device Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ✅ Add Device Card */}
        <Card
          className="shadow-md p-4 flex items-center justify-center cursor-pointer bg-gray-100 hover:bg-gray-200 transition-all"
          onClick={handleAddDevice}
        >
          <CardBody className="flex flex-col items-center">
            <Typography variant="h4" className="font-bold text-gray-600">
              +
            </Typography>
            <Typography variant="h6" className="text-gray-700">
              Add Device
            </Typography>
          </CardBody>
        </Card>

        {/* ✅ User Devices List */}
        {devices.map((device) => (
          <Card key={device.id} className="shadow-md p-4">
            <CardHeader className="bg-gray-100 p-3 rounded-t">
              <Typography variant="h6" className="text-gray-700">
                {device.name || "Unnamed Device"}
              </Typography>
            </CardHeader>
            <CardBody className="flex flex-col gap-2">
              <Typography variant="h5" className="font-semibold">
                Status:{" "}
                <span
                  className={
                    device.status === "online"
                      ? "text-green-500"
                      : "text-red-500"
                  }
                >
                  {device.status || "Unknown"}
                </span>
              </Typography>
              <Typography variant="small" className="text-gray-500">
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
