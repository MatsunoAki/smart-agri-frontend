import React, { useState, useEffect, useRef } from "react";
import { ref, onValue, update, push, remove, set } from "firebase/database";
import { database } from "../../../../../firebase";
import { useAuth } from "../../../../contexts/AuthContext";
import { WiHumidity } from "react-icons/wi";
import { FaThermometerHalf } from "react-icons/fa";
import { GiWaterDrop } from "react-icons/gi";
import { MdPowerSettingsNew, MdDeleteForever } from "react-icons/md";
import { LuWifiOff } from "react-icons/lu";

const SensorCard = ({ icon, label, value }) => (
  <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4">
    <div className="text-4xl">{icon}</div>
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const MonitoringData = () => {
  const { user } = useAuth();
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [sensorData, setSensorData] = useState(null);
  const [pumpMode, setPumpMode] = useState("AUTO");
  const [scheduleList, setScheduleList] = useState([]);
  const [newTime, setNewTime] = useState("");
  const statusListeners = useRef({});

  useEffect(() => {
    if (!user) return;
    const devicesRef = ref(database, "devices");
    const unsubscribeDevices = onValue(devicesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const userDevices = Object.keys(data)
          .map((key) => ({ id: key, ...data[key] }))
          .filter((device) => device.ownerUID === user.uid);
        setDevices(userDevices);
        if (userDevices.length > 0 && !selectedDeviceId)
          setSelectedDeviceId(userDevices[0].id);
        userDevices.forEach((device) => {
          const statusPath = `devices/${device.id}/status`;
          if (statusListeners.current[device.id]) {
            statusListeners.current[device.id]();
          }
          statusListeners.current[device.id] = onValue(
            ref(database, statusPath),
            (statusSnapshot) => {
              const statusData = statusSnapshot.val();
              if (statusData?.lastActive) {
                const lastActive = new Date(statusData.lastActive).getTime();
                const isOnline = Date.now() - lastActive < 20000;
                setDevices((prev) =>
                  prev.map((d) =>
                    d.id === device.id
                      ? { ...d, status: isOnline ? "online" : "offline" }
                      : d
                  )
                );
              } else {
                setDevices((prev) =>
                  prev.map((d) =>
                    d.id === device.id ? { ...d, status: "offline" } : d
                  )
                );
              }
            }
          );
        });
      } else {
        setDevices([]);
      }
    });
    return () => {
      unsubscribeDevices();
      Object.values(statusListeners.current).forEach((unsubscribe) => unsubscribe && unsubscribe());
    };
  }, [user, selectedDeviceId]);

  useEffect(() => {
    if (!selectedDeviceId) {
      setSensorData(null);
      setPumpMode("AUTO");
      return;
    }
    const dataRef = ref(database, `devices/${selectedDeviceId}/sensorData`);
    const unsubscribeSensor = onValue(dataRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setSensorData(data);
        setPumpMode(data.pumpMode || "AUTO");
      } else {
        setSensorData(null);
      }
    });
    return () => unsubscribeSensor();
  }, [selectedDeviceId]);

  useEffect(() => {
    if (!selectedDeviceId) return;
    const scheduleRef = ref(database, `devices/${selectedDeviceId}/schedule`);
    const unsubscribeSchedule = onValue(scheduleRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([key, time]) => ({ key, time }));
        setScheduleList(list);
      } else setScheduleList([]);
    });
    return () => unsubscribeSchedule();
  }, [selectedDeviceId]);

  const handlePumpToggle = () => {
    if (!selectedDeviceId || !sensorData) return;
    const newPumpStatus = !sensorData.pumpStatus;
    update(ref(database, `devices/${selectedDeviceId}/sensorData`), {
      pumpStatus: newPumpStatus,
    });
  };

  const handleModeCycle = () => {
    if (!selectedDeviceId) return;
    const modes = ["AUTO", "MANUAL", "SCHEDULED"];
    const nextMode = modes[(modes.indexOf(pumpMode) + 1) % modes.length];
    setPumpMode(nextMode);
    update(ref(database, `devices/${selectedDeviceId}/sensorData`), {
      pumpMode: nextMode,
    });
  };

  const handleAddSchedule = async () => {
    if (!newTime || !selectedDeviceId) return;
    const scheduleRef = ref(database, `devices/${selectedDeviceId}/schedule`);
    const newRef = push(scheduleRef);
    await set(newRef, newTime);
    setNewTime("");
  };

  const handleDeleteSchedule = async (key) => {
    if (!selectedDeviceId) return;
    await remove(ref(database, `devices/${selectedDeviceId}/schedule/${key}`));
  };

  const selectedDevice = devices.find((d) => d.id === selectedDeviceId);
  const isOnline = selectedDevice?.status === "online";

  // --- This is the new UI with the "Branded" theme ---

  return (
    // The main div no longer needs background or min-height,
    // as this is handled by the Dashboard.js layout
    <div className="flex flex-col lg:flex-row gap-6 font-sans">
      
      {/* Sidebar */}
      <aside className="w-full lg:w-1/4 lg:max-w-xs p-4 bg-white rounded-xl shadow-sm h-fit">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Your Devices</h2>
        <div className="flex flex-col gap-2">
          {devices.length > 0 ? (
            devices.map((device) => (
              <button
                key={device.id}
                onClick={() => setSelectedDeviceId(device.id)}
                className={`w-full text-left p-3 rounded-lg font-medium flex items-center justify-between transition-colors duration-200 ${
                  selectedDeviceId === device.id
                    ? "bg-[#334b35] text-white shadow-md" 
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                <span>{device.name || device.id}</span>
                <span className="flex items-center gap-2 text-xs capitalize">
                  {device.status}
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      device.status === "online" ? "bg-green-500" : "bg-red-500" 
                    }`}
                  />
                </span>
              </button>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">No registered devices.</p>
          )}
        </div>
      </aside>

      <main className="flex-1">
        {selectedDevice ? (
          isOnline && sensorData ? (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-900">
                Monitoring: {selectedDevice.name || selectedDevice.id}
              </h1>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                <SensorCard
                  label="Temperature"
                  value={`${sensorData.temperature ?? 'N/A'}°C`}
                  icon={<FaThermometerHalf className="text-red-500" />}
                />
                <SensorCard
                  label="Humidity"
                  value={`${sensorData.humidity ?? 'N/A'}%`}
                  icon={<WiHumidity className="text-blue-500" />}
                />
                <SensorCard
                  label="Soil Moisture"
                  value={`${sensorData.soilMoisture ?? 'N/A'}%`}
                  icon={<GiWaterDrop className="text-green-600" />}
                />
                <SensorCard
                  label="Pump Status"
                  value={sensorData.pumpStatus ? "ON" : "OFF"}
                  icon={
                    <MdPowerSettingsNew
                      className={sensorData.pumpStatus ? "text-green-500" : "text-gray-400"}
                    />
                  }
                />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Controls</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <p className="font-semibold text-gray-600 mb-2">Pump Mode</p>
                    <p className={`text-3xl font-bold capitalize ${
                      pumpMode === "AUTO" ? "text-green-600" : 
                      pumpMode === "MANUAL" ? "text-blue-600" : 
                      "text-purple-600" 
                    }`}>{pumpMode}</p>
                    <button onClick={handleModeCycle} className="mt-4 w-full bg-[#334b35] text-white font-semibold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-all">
                      Change Mode
                    </button>
                  </div>

                  {pumpMode === "MANUAL" && (
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                      <p className="font-semibold text-gray-600 mb-2">Manual Pump Control</p>
                      <p className={`text-3xl font-bold ${sensorData.pumpStatus ? "text-green-600" : "text-red-600"}`}>
                        {sensorData.pumpStatus ? "ON" : "OFF"}
                      </p>
                      <button onClick={handlePumpToggle} className={`mt-4 w-full text-white font-semibold py-2 px-4 rounded-lg transition-colors ${
                        sensorData.pumpStatus ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                      }`}>
                        {sensorData.pumpStatus ? "Turn OFF" : "Turn ON"}
                      </button>
                    </div>
                  )}

                  {pumpMode === "SCHEDULED" && (
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                      <p className="font-semibold text-gray-600 mb-3">Scheduled Times</p>
                      <div className="flex gap-2 mb-4">
                        <input
                          type="time"
                          value={newTime}
                          onChange={(e) => setNewTime(e.target.value)}
                          className="w-full border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-600 focus:border-green-600"
                        />
                        <button onClick={handleAddSchedule} className="bg-green-600 text-white font-semibold px-4 rounded-lg hover:bg-green-700 transition-colors">
                          Add
                        </button>
                      </div>
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                        {scheduleList.length > 0 ? (
                          scheduleList.map((item) => (
                            <div key={item.key} className="flex justify-between items-center bg-gray-50 p-2 rounded-md">
                              <p className="font-mono text-gray-700">{item.time}</p>
                              <button onClick={() => handleDeleteSchedule(item.key)} className="text-red-600 hover:text-red-700 transition-colors">
                                <MdDeleteForever size={20} />
                              </button>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 text-center py-2">No schedules added.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : ( 
            <div className="flex flex-col items-center justify-center h-full text-center bg-white p-10 rounded-xl shadow-sm">
              <LuWifiOff className="text-6xl text-red-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedDevice?.name || "Unnamed Device"}</h2>
              <p className="text-lg font-semibold text-red-600">Device is Offline</p>
              <p className="text-gray-500 mt-1">Waiting for device to reconnect or send data.</p>
            </div>
          )
        ) : ( 
          <div className="flex flex-col items-center justify-center h-full text-center bg-white p-10 rounded-xl shadow-sm">
            <GiWaterDrop className="text-6xl text-[#334b35] mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">Select a Device</h2>
            <p className="text-gray-500 mt-1">Choose a device from the sidebar to view its live data.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default MonitoringData;