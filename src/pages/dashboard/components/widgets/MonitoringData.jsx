// TODO: 1. Add time drop for Schedule mode in Pump
// TODO: 2. Configure ESP32 to communicate with the firebase for scheduled pump

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
  Input,
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
  const [pumpMode, setPumpMode] = useState("Manual"); // Default mode
  const [schedules, setSchedules] = useState([]); // State to manage schedules
  const [newSchedule, setNewSchedule] = useState(""); // State to manage new schedule input

  const pumpModes = ["Scheduled", "Manual", "Automatic"];

  useEffect(() => {
    if (!user) return;
    const devicesRef = ref(database, "devices");

    const unsubscribe = onValue(devicesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const userDevices = Object.keys(data)
          .map((key) => ({
            id: key,
            ...data[key],
          }))
          .filter((device) => device.userId === user.uid);

        setDevices(userDevices);
        if (userDevices.length > 0) {
          setSelectedDeviceId(userDevices[0].id);
        }
      } else {
        setDevices([]);
      }
    });

    return () => off(devicesRef);
  }, [user]);

  useEffect(() => {
    if (!selectedDeviceId) return;
    const sensorRef = ref(database, `sensor_data/${selectedDeviceId}/readings`);
    const modeRef = ref(database, `sensor_data/${selectedDeviceId}/pump_mode`);
    const schedulesRef = ref(
      database,
      `sensor_data/${selectedDeviceId}/schedules`
    );

    const sensorUnsubscribe = onValue(sensorRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setSensorData({
          temperature: data.temperature || 0,
          humidity: data.humidity || 0,
          moisture: data.moisture || 0,
          pumpStatus: data.pump_status || false,
        });
      } else {
        setSensorData(null);
      }
    });

    const modeUnsubscribe = onValue(modeRef, (snapshot) => {
      if (snapshot.exists()) {
        setPumpMode(snapshot.val());
      }
    });

    const schedulesUnsubscribe = onValue(schedulesRef, (snapshot) => {
      if (snapshot.exists()) {
        setSchedules(snapshot.val());
      } else {
        setSchedules([]);
      }
    });

    return () => {
      off(sensorRef);
      off(modeRef);
      off(schedulesRef);
    };
  }, [selectedDeviceId]);

  const handlePumpModeChange = () => {
    const currentIndex = pumpModes.indexOf(pumpMode);
    const nextMode = pumpModes[(currentIndex + 1) % pumpModes.length];

    setPumpMode(nextMode);

    if (selectedDeviceId) {
      const modeRef = ref(
        database,
        `sensor_data/${selectedDeviceId}/pump_mode`
      );
      update(modeRef, nextMode);
    }
  };

  const handleAddSchedule = () => {
    if (newSchedule.trim() === "") return;

    const updatedSchedules = [...schedules, newSchedule];
    setSchedules(updatedSchedules);
    setNewSchedule("");

    if (selectedDeviceId) {
      const schedulesRef = ref(
        database,
        `sensor_data/${selectedDeviceId}/schedules`
      );
      update(schedulesRef, updatedSchedules);
    }
  };

  return (
    <div className="flex flex-col w-full p-4 sm:p-10">
      <Card className="bg-[#f1f3f4] p-4 sm:p-10">
        <CardHeader className="text-xl sm:text-2xl font-bold mb-4 w-fit p-2 bg-[#ffffff]">
          Monitoring Data
        </CardHeader>
        <CardBody>
          {devices.length > 0 ? (
            <Card className="p-2 mt-6 sm:mt-12 w-full bg-opacity-30 bg-[#ffffff] rounded-xl shadow-lg">
              <CardHeader className="text-lg font-semibold w-fit p-2">
                Select Device
              </CardHeader>
              <CardBody className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
                {devices.map((device) => (
                  <button
                    key={device.id}
                    className={`w-full bg-[#263c28] text-white p-3 sm:p-4 rounded-lg shadow-md transition-all ${
                      selectedDeviceId === device.id
                        ? "bg-[#f5c066]"
                        : "hover:bg-[#3a4e3c]"
                    }`}
                    onClick={() => setSelectedDeviceId(device.id)}
                  >
                    {device.name || "Unnamed Device"} -{" "}
                    <span
                      className={
                        device.status === "online"
                          ? "text-green-300"
                          : "text-red-300"
                      }
                    >
                      {device.status || "Unknown"}
                    </span>
                  </button>
                ))}
              </CardBody>
            </Card>
          ) : (
            <Typography variant="h5" className="text-red-500 text-center">
              No devices found. Please add a device.
            </Typography>
          )}

          {selectedDeviceId && (
            <Card className="p-2 mt-6 sm:mt-12 w-full bg-opacity-30 bg-[#ffffff] rounded-xl shadow-lg">
              <CardHeader className="text-lg font-semibold w-fit p-2">
                Sensor Data
              </CardHeader>
              <CardBody className="m-2 sm:m-4">
                {sensorData ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      {
                        title: "Temperature",
                        value: `${sensorData.temperature.toFixed(1)}°C`,
                        icon: (
                          <FaThermometerHalf className="text-red-500 text-4xl sm:text-5xl" />
                        ),
                      },
                      {
                        title: "Humidity",
                        value: `${sensorData.humidity.toFixed(1)}%`,
                        icon: (
                          <WiHumidity className="text-blue-500 text-4xl sm:text-5xl" />
                        ),
                      },
                      {
                        title: "Soil Moisture",
                        value: `${sensorData.moisture}%`,
                        icon: (
                          <GiWaterDrop className="text-green-500 text-4xl sm:text-5xl" />
                        ),
                      },
                      {
                        title: "Pump Status",
                        value: sensorData.pumpStatus ? "ON" : "OFF",
                        icon: (
                          <MdPowerSettingsNew
                            className={`text-4xl sm:text-5xl ${
                              sensorData.pumpStatus
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          />
                        ),
                      },
                    ].map((sensor, index) => (
                      <Card key={index} className="p-4 sm:p-6">
                        <CardHeader className="flex items-center gap-2">
                          {sensor.icon}
                          <Typography variant="h6">{sensor.title}</Typography>
                        </CardHeader>
                        <CardBody>
                          <Typography
                            variant="h4"
                            className="font-semibold text-lg sm:text-xl"
                          >
                            {sensor.value}
                          </Typography>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Typography variant="h5" className="text-red-500 text-center">
                    No sensor data available for this device.
                  </Typography>
                )}
              </CardBody>
            </Card>
          )}
          {selectedDeviceId && sensorData && (
            <Card className="p-2 mt-6 sm:mt-12 w-full bg-opacity-30 bg-[#ffffff] rounded-xl shadow-lg">
              <CardHeader className="text-lg font-semibold w-fit p-2">
                Pump Mode
              </CardHeader>
              <CardBody className="flex flex-col items-center">
                <MdPowerSettingsNew className="text-blue-500 text-4xl sm:text-5xl mb-2" />
                <Typography
                  variant="h4"
                  className="font-semibold mb-4 text-lg sm:text-xl"
                >
                  {pumpMode}
                </Typography>
                <Button
                  className="bg-blue-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 transition-all text-sm sm:text-base"
                  onClick={handlePumpModeChange}
                >
                  Change Mode
                </Button>

                {pumpMode === "Scheduled" && (
                  <div className="mt-4 w-full">
                    <Typography variant="h6" className="font-semibold mb-2">
                      Schedule Times
                    </Typography>
                    <div className="flex flex-col gap-2">
                      {schedules.map((schedule, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-gray-100 rounded-lg"
                        >
                          <Typography
                            variant="paragraph"
                            className="text-sm sm:text-base"
                          >
                            Time {index + 1}: {schedule}
                          </Typography>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Input
                        type="time"
                        value={newSchedule}
                        onChange={(e) => setNewSchedule(e.target.value)}
                        className="w-full"
                      />
                      <Button
                        className="bg-green-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-green-600 transition-all"
                        onClick={handleAddSchedule}
                      >
                        Add Time
                      </Button>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          )}
        </CardBody>
      </Card>
    </div>
  );
};
export default MonitoringData;