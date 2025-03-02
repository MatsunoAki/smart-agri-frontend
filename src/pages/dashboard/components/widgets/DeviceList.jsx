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
} from "@material-tailwind/react";

const DeviceList = () => {
  const { user } = useAuth();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const devicesRef = ref(database, "devices");

    const unsubscribe = onValue(devicesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setDevices(
          Object.keys(data)
            .map((key) => ({
              id: key,
              ...data[key],
            }))
            .filter((device) => device.userId === user.uid)
        );
      } else {
        setDevices([]);
      }
      setLoading(false);
    });

    return () => off(devicesRef);
  }, [user]);

  //  New useEffect: Check status every second
  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = new Date();

      devices.forEach((device) => {
        const lastActiveTime = device.lastActive
          ? new Date(device.lastActive)
          : null;

        const isOffline =
          lastActiveTime &&
          (currentTime - lastActiveTime) / 1000 > 10;

        if (isOffline && device.status !== "offline") {
          const statusRef = ref(database, `devices/${device.id}/status`);
          set(statusRef, "offline").catch((error) =>
            console.error("Failed to update status:", error)
          );
        }
      });
    }, 1000); //  Check every second

    return () => clearInterval(interval);
  }, [devices]); //  Runs every time devices change

  return (
    <div className="flex flex-col w-full p-10">
      <h1 className="text-2xl font-bold mb-6">Your Devices</h1>

      {loading && <Alert color="blue">Loading devices...</Alert>}

      {!loading && devices.length === 0 && (
        <Alert color="red">
          <Typography variant="h6">No devices found</Typography>
          <Typography variant="paragraph">
            Please add a device to see it here.
          </Typography>
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                Last Active: {device.lastActive ? new Date(device.lastActive).toLocaleString() : "N/A"}
              </Typography>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DeviceList;
