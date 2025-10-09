import React, { useState, useEffect, useRef } from "react";
import { ref, onValue, off, update, push, remove, get, set } from "firebase/database";
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
  const [pumpMode, setPumpMode] = useState("AUTO");
  const [scheduleList, setScheduleList] = useState([]);
  const [newTime, setNewTime] = useState("");
  const statusUnsubscribes = useRef({});

  // 🔹 Get user devices and status
  useEffect(() => {
    if (!user) return;
    const devicesRef = ref(database, "devices");

    const unsubscribeDevices = onValue(devicesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const userDevices = Object.keys(data)
          .map((key) => ({
            id: key,
            ...data[key],
            status: "loading",
            lastActiveTimestamp: null,
          }))
          .filter((device) => device.ownerUID === user.uid);

        setDevices(userDevices);
        if (userDevices.length > 0 && !selectedDeviceId)
          setSelectedDeviceId(userDevices[0].id);

        userDevices.forEach((device) => {
          if (statusUnsubscribes.current[device.id])
            statusUnsubscribes.current[device.id]();

          const statusRef = ref(database, `devices/${device.id}/status`);
          statusUnsubscribes.current[device.id] = onValue(
            statusRef,
            (statusSnapshot) => {
              const statusData = statusSnapshot.val();
              const lastActiveTime = statusData?.lastActive
                ? new Date(statusData.lastActive).getTime()
                : null;
              const isOnline = lastActiveTime
                ? Date.now() - lastActiveTime < 20000
                : false;

              setDevices((prev) =>
                prev.map((d) =>
                  d.id === device.id
                    ? {
                        ...d,
                        status: isOnline ? "online" : "offline",
                        lastActiveTimestamp: lastActiveTime,
                      }
                    : d
                )
              );
            }
          );
        });
      } else setDevices([]);
    });

    return () => {
      unsubscribeDevices();
      Object.values(statusUnsubscribes.current).forEach((fn) => fn && fn());
    };
  }, [user]);

  // 🔹 Sensor data listener
  useEffect(() => {
    if (!selectedDeviceId) {
      setSensorData(null);
      setPumpMode("AUTO");
      return;
    }

    const dataRef = ref(database, `devices/${selectedDeviceId}/sensorData`);
    const unsubscribeSensorData = onValue(dataRef, (snapshot) => {
      if (!snapshot.exists()) return;
      const data = snapshot.val();
      setSensorData(data);
      setPumpMode(data.pumpMode || (data.autoPump ? "AUTO" : "MANUAL"));
    });

    return () => unsubscribeSensorData();
  }, [selectedDeviceId]);

  // 🔹 Fetch schedule from separate node
  useEffect(() => {
    if (!selectedDeviceId) return;
    const scheduleRef = ref(database, `devices/${selectedDeviceId}/schedule`);

    const unsubscribe = onValue(scheduleRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const times = Object.entries(data).map(([key, time]) => ({
          key,
          time,
        }));
        setScheduleList(times);
      } else {
        setScheduleList([]);
      }
    });

    return () => unsubscribe();
  }, [selectedDeviceId]);

  // 🔹 Offline fallback checker
  useEffect(() => {
    const intervalId = setInterval(() => {
      setDevices((prev) =>
        prev.map((device) => {
          if (!device.lastActiveTimestamp)
            return { ...device, status: "offline" };
          const isOnline = Date.now() - device.lastActiveTimestamp < 20000;
          return { ...device, status: isOnline ? "online" : "offline" };
        })
      );
    }, 5000);
    return () => clearInterval(intervalId);
  }, []);

  // 🔹 Manual pump toggle
  const handlePumpToggle = () => {
    if (!selectedDeviceId || !sensorData) return;
    const newPumpStatus = !sensorData.pumpStatus;
    update(ref(database, `devices/${selectedDeviceId}/sensorData`), {
      pumpStatus: newPumpStatus,
    });
  };

  // 🔹 Mode toggle cycle: AUTO → MANUAL → SCHEDULED
  const handleModeCycle = () => {
    if (!selectedDeviceId) return;
    const modes = ["AUTO", "MANUAL", "SCHEDULED"];
    const nextMode = modes[(modes.indexOf(pumpMode) + 1) % modes.length];
    setPumpMode(nextMode);
    update(ref(database, `devices/${selectedDeviceId}/sensorData`), {
      pumpMode: nextMode,
    });
  };

  // 🔹 Add new schedule (to separate node)
  const handleAddSchedule = async () => {
    if (!newTime || !selectedDeviceId) return;
    const scheduleRef = ref(database, `devices/${selectedDeviceId}/schedule`);
    const newRef = push(scheduleRef);
    await set(newRef, newTime);
    setNewTime("");
  };

  // 🔹 Delete schedule (from separate node)
  const handleDeleteSchedule = async (key) => {
    if (!selectedDeviceId) return;
    const itemRef = ref(database, `devices/${selectedDeviceId}/schedule/${key}`);
    await remove(itemRef);
  };

  const selectedDevice = devices.find((d) => d.id === selectedDeviceId);
  const isOnline = selectedDevice?.status === "online";

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 bg-[#f1f3f4] min-h-screen">
      {/* Sidebar */}
      <Card className="w-full lg:w-1/4 p-4 shadow-md bg-white">
        <CardHeader
          shadow={false}
          floated={false}
          className="text-lg font-semibold mb-4 bg-transparent p-0"
        >
          Your Devices
        </CardHeader>
        <CardBody className="flex flex-col gap-3 p-0">
          {devices.length > 0 ? (
            devices.map((device) => (
              <button
                key={device.id}
                onClick={() => setSelectedDeviceId(device.id)}
                className={`w-full text-left p-3 rounded-lg font-medium flex items-center justify-between ${
                  selectedDeviceId === device.id
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 hover:bg-green-100"
                }`}
              >
                <span>{device.name || device.id}</span>
                <span className="flex items-center gap-2 text-xs capitalize">
                  {device.status}
                  <span
                    className={`h-3 w-3 rounded-full ${
                      device.status === "online"
                        ? "bg-green-400"
                        : "bg-red-400"
                    }`}
                  />
                </span>
              </button>
            ))
          ) : (
            <Typography color="gray" className="text-center">
              No registered devices.
            </Typography>
          )}
        </CardBody>
      </Card>

      {/* Main Monitoring Panel */}
      <Card className="flex-1 p-6 bg-white shadow-lg rounded-xl">
        {selectedDevice ? (
          isOnline && sensorData ? (
            <>
              <Typography variant="h4" className="font-bold mb-6">
                Monitoring: {selectedDevice.name || selectedDevice.id}
              </Typography>

              {/* Sensor Readings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  {
                    label: "Temperature",
                    value: `${sensorData.temperature?.toFixed(1)}°C`,
                    icon: <FaThermometerHalf className="text-red-500 text-4xl" />,
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
                ].map((s, i) => (
                  <Card key={i} className="p-4 bg-gray-50">
                    <div className="flex items-center gap-3 mb-2">
                      {s.icon}
                      <Typography variant="h6">{s.label}</Typography>
                    </div>
                    <Typography className="text-2xl font-bold">{s.value}</Typography>
                  </Card>
                ))}
              </div>

              {/* Pump Mode Section */}
              <div className="flex flex-col sm:flex-row gap-6">
                <Card className="flex-1 p-4 bg-gray-50 shadow-md">
                  <Typography variant="h6" className="mb-2 font-semibold">
                    Pump Mode
                  </Typography>
                  <Typography
                    variant="h5"
                    className={`font-bold ${
                      pumpMode === "AUTO"
                        ? "text-green-600"
                        : pumpMode === "MANUAL"
                        ? "text-blue-600"
                        : "text-purple-600"
                    }`}
                  >
                    {pumpMode}
                  </Typography>
                  <Button
                    className="mt-4 bg-blue-600 text-white hover:bg-blue-700"
                    onClick={handleModeCycle}
                  >
                    Change Mode
                  </Button>
                </Card>

                {/* Manual Pump Control */}
                {pumpMode === "MANUAL" && (
                  <Card className="flex-1 p-4 bg-gray-50 shadow-md">
                    <Typography variant="h6" className="mb-2 font-semibold">
                      Manual Pump Control
                    </Typography>
                    <Typography
                      variant="h5"
                      className={`font-bold ${
                        sensorData.pumpStatus
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {sensorData.pumpStatus ? "ON" : "OFF"}
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

                {/* Scheduled Pump Control */}
                {pumpMode === "SCHEDULED" && (
                  <Card className="flex-1 p-4 bg-gray-50 shadow-md">
                    <Typography
                      variant="h6"
                      className="mb-3 font-semibold text-purple-700"
                    >
                      Scheduled Times
                    </Typography>
                    <div className="flex gap-2 mb-4 items-center">
                      <input
                        type="time"
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                        className="border rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <Button
                        color="green"
                        onClick={handleAddSchedule}
                        className="whitespace-nowrap"
                      >
                        Add
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {scheduleList.length > 0 ? (
                        scheduleList.map((item) => (
                          <div
                            key={item.key}
                            className="flex justify-between items-center bg-white p-2 rounded shadow-sm border"
                          >
                            <Typography>{item.time}</Typography>
                            <Button
                              size="sm"
                              color="red"
                              onClick={() => handleDeleteSchedule(item.key)}
                            >
                              Delete
                            </Button>
                          </div>
                        ))
                      ) : (
                        <Typography color="gray" className="text-sm">
                          No schedules added.
                        </Typography>
                      )}
                    </div>
                  </Card>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Typography variant="h5" color="blue-gray" className="font-semibold mb-2">
                {selectedDevice.name || "Unnamed Device"}
              </Typography>
              <Typography variant="h6" color="red">
                Device is Offline
              </Typography>
              <Typography color="gray" className="mt-1">
                No real-time data is available. Please check the device's connection.
              </Typography>
            </div>
          )
        ) : (
          <Typography
            variant="h5"
            color="blue-gray"
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
