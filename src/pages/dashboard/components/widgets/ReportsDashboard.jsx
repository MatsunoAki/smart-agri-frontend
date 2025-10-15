import React, { useEffect, useState } from "react";
import { db } from "../../../../../firebase";
import { useAuth } from "../../../../contexts/AuthContext";
import { collection, query, orderBy, where, getDocs } from "firebase/firestore";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";

export default function ReportsDashboard() {
  const { user } = useAuth();
  const [userDevices, setUserDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [eventLogs, setEventLogs] = useState([]);
  const [filter, setFilter] = useState("daily");
  const [loading, setLoading] = useState(true);
  const [isDeviceListLoading, setIsDeviceListLoading] = useState(true);

  // 🔹 Fetch user's registered devices
  useEffect(() => {
    if (!user) return;
    const fetchUserDevices = async () => {
      setIsDeviceListLoading(true);
      try {
        const devicesRef = collection(db, "devices");
        const q = query(devicesRef, where("owner", "==", user.uid));
        const snapshot = await getDocs(q);
        const devices = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUserDevices(devices);
        if (devices.length > 0) setSelectedDeviceId(devices[0].id);
      } catch (error) {
        console.error("Error fetching user devices:", error);
      } finally {
        setIsDeviceListLoading(false);
      }
    };
    fetchUserDevices();
  }, [user]);

  // 🔹 Fetch history and watering event data
  useEffect(() => {
    if (!selectedDeviceId) {
      setHistoryData([]);
      setEventLogs([]);
      setLoading(false);
      return;
    }

    const fetchReports = async () => {
      setLoading(true);
      try {
        // --- Fetch sensor history ---
        const historyRef = collection(
          db,
          "device_reports",
          selectedDeviceId,
          "history"
        );
        const q = query(historyRef, orderBy("timestamp", "asc"));
        const snapshot = await getDocs(q);

        const now = dayjs();
        const history = snapshot.docs.map((doc) => {
          const data = doc.data();
          const timestamp = data.timestamp?.toDate
            ? data.timestamp.toDate()
            : data.timestamp;
          return { id: doc.id, ...data, timestamp };
        });

        // Filter based on user-selected timeframe
        const filtered = history.filter((item) => {
          const itemDate = dayjs(item.timestamp);
          if (filter === "daily") return itemDate.isAfter(now.subtract(1, "day"));
          if (filter === "weekly") return itemDate.isAfter(now.subtract(7, "day"));
          if (filter === "monthly") return itemDate.isAfter(now.subtract(30, "day"));
          return true;
        });
        setHistoryData(filtered);

        // --- Fetch watering events ---
        const eventRef = collection(
          db,
          "device_reports",
          selectedDeviceId,
          "watering_events"
        );
        const eventQ = query(eventRef, orderBy("timestamp", "desc"));
        const eventSnap = await getDocs(eventQ);

        const events = eventSnap.docs.map((doc) => {
          const data = doc.data();
          const timestamp = data.timestamp?.toDate
            ? data.timestamp.toDate()
            : data.timestamp;
          return { id: doc.id, ...data, timestamp };
        });

        setEventLogs(events);
      } catch (err) {
        console.error("Error fetching Firestore data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [selectedDeviceId, filter]);

  const avg = (field) =>
    historyData.length
      ? (
          historyData.reduce((sum, d) => sum + (d[field] || 0), 0) /
          historyData.length
        ).toFixed(1)
      : 0;

  const selectedDevice = userDevices.find((d) => d.id === selectedDeviceId);

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 md:p-6 bg-[#f1f3f4] min-h-screen">
      {/* 🧭 Sidebar for Device Selection */}
      <div className="w-full lg:w-1/4 p-4 shadow-md bg-white rounded-xl h-fit">
        <h2 className="text-lg font-semibold mb-4">Your Devices</h2>
        <div className="flex flex-col gap-3">
          {isDeviceListLoading ? (
            <p>Loading devices...</p>
          ) : userDevices.length > 0 ? (
            userDevices.map((device) => (
              <button
                key={device.id}
                onClick={() => setSelectedDeviceId(device.id)}
                className={`w-full text-left p-3 rounded-lg font-medium transition-colors ${
                  selectedDeviceId === device.id
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 hover:bg-green-100"
                }`}
              >
                {device.deviceName || device.id}
              </button>
            ))
          ) : (
            <p className="text-gray-500">No registered devices found.</p>
          )}
        </div>
      </div>

      {/* 📊 Main Dashboard Area */}
      <div className="flex-1">
        {selectedDeviceId ? (
          <div className="space-y-6">
            {/* ✅ Header + Filter */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <h1 className="text-2xl font-bold">
                📊 Reports: {selectedDevice?.deviceName || selectedDeviceId}
              </h1>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border p-2 rounded w-full sm:w-auto"
              >
                <option value="daily">Last 24 Hours</option>
                <option value="weekly">Last 7 Days</option>
                <option value="monthly">Last 30 Days</option>
              </select>
            </div>

            {/* ✅ Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-100 p-4 rounded-xl shadow">
                <p className="font-semibold">🌡️ Avg Temp</p>
                <h2 className="text-xl font-bold">{avg("temperature")}°C</h2>
              </div>
              <div className="bg-blue-100 p-4 rounded-xl shadow">
                <p className="font-semibold">💧 Avg Humidity</p>
                <h2 className="text-xl font-bold">{avg("humidity")}%</h2>
              </div>
              <div className="bg-yellow-100 p-4 rounded-xl shadow">
                <p className="font-semibold">🌱 Avg Soil Moisture</p>
                <h2 className="text-xl font-bold">{avg("soilMoisture")}%</h2>
              </div>
            </div>

            {/* ✅ Line Chart */}
            <div className="bg-white p-4 rounded-xl shadow h-96">
              {loading ? (
                <p className="text-center pt-4">Loading report data...</p>
              ) : historyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={(t) =>
                        filter === "daily"
                          ? dayjs(t).format("HH:mm")
                          : dayjs(t).format("MMM D")
                      }
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(l) =>
                        dayjs(l).format("MMM D, YYYY HH:mm")
                      }
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="temperature"
                      stroke="#ef4444"
                      name="Temp (°C)"
                    />
                    <Line
                      type="monotone"
                      dataKey="humidity"
                      stroke="#3b82f6"
                      name="Humidity (%)"
                    />
                    <Line
                      type="monotone"
                      dataKey="soilMoisture"
                      stroke="#22c55e"
                      name="Soil (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-500 mt-4">
                  No report data available for this period.
                </p>
              )}
            </div>

            {/* ✅ Watering Events Section */}
            <div className="bg-white p-4 rounded-xl shadow">
              <h2 className="text-lg font-semibold mb-2">🪣 Watering Events</h2>
              <div className="space-y-3">
                {eventLogs.length > 0 ? (
                  eventLogs.map((e) => (
                    <div
                      key={e.id}
                      className="grid grid-cols-2 gap-2 border-b pb-2 text-sm"
                    >
                      <p className="font-medium text-gray-600">Timestamp:</p>
                      <p className="text-right">
                        {dayjs(e.timestamp).format("MMM D, HH:mm")}
                      </p>

                      <p className="font-medium text-gray-600">Trigger:</p>
                      <p className="text-right font-semibold">
                        {e.trigger === "SCHEDULED"
                          ? "Scheduled Watering"
                          : e.trigger === "MANUAL"
                          ? "Manual Watering"
                          : e.trigger === "AUTO"
                          ? "Auto Watering"
                          : e.trigger || "—"}
                      </p>

                      <p className="font-medium text-gray-600">Status:</p>
                      <p className="text-right">
                        {e.status ? "Pump ON" : "Pump OFF"}
                      </p>

                      <p className="font-medium text-gray-600">Soil Moisture:</p>
                      <p className="text-right">{e.soilMoisture ?? "—"}%</p>

                      <p className="font-medium text-gray-600">Temp:</p>
                      <p className="text-right">{e.temperature ?? "—"}°C</p>

                      <p className="font-medium text-gray-600">Humidity:</p>
                      <p className="text-right">{e.humidity ?? "—"}%</p>
                    </div>
                  ))
                ) : (
                  <p className="p-2 text-gray-500">No watering events to show.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full p-6 bg-white rounded-xl shadow">
            <h1 className="text-xl font-bold text-gray-500">
              {isDeviceListLoading
                ? "Loading devices..."
                : "Select a device to view reports"}
            </h1>
          </div>
        )}
      </div>
    </div>
  );
}
