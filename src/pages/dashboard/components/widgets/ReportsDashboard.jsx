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
import { FaThermometerHalf } from "react-icons/fa";
import { WiHumidity } from "react-icons/wi";
import { GiWaterDrop } from "react-icons/gi";

const StatCard = ({ icon, label, value }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm flex items-center gap-4">
    <div className="text-4xl">{icon}</div>
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

export default function ReportsDashboard() {
  const { user } = useAuth();
  const [userDevices, setUserDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [eventLogs, setEventLogs] = useState([]);
  const [filter, setFilter] = useState("daily");
  const [loading, setLoading] = useState(true);
  const [isDeviceListLoading, setIsDeviceListLoading] = useState(true);


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
        const historyRef = collection(
          db, "device_reports", selectedDeviceId, "history"
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

        const filtered = history.filter((item) => {
          const itemDate = dayjs(item.timestamp);
          if (filter === "daily") return itemDate.isAfter(now.subtract(1, "day"));
          if (filter === "weekly") return itemDate.isAfter(now.subtract(7, "day"));
          if (filter === "monthly") return itemDate.isAfter(now.subtract(30, "day"));
          return true;
        });
        setHistoryData(filtered);

        const eventRef = collection(
          db, "device_reports", selectedDeviceId, "watering_events"
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
    <div className="flex flex-col lg:flex-row gap-6 font-sans">
      
      <div className="w-full lg:w-1/4 lg:max-w-xs p-4 bg-white rounded-xl shadow-sm h-fit">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Your Devices</h2>
        <div className="flex flex-col gap-2">
          {isDeviceListLoading ? (
            <p className="text-gray-500 p-2">Loading devices...</p>
          ) : userDevices.length > 0 ? (
            userDevices.map((device) => (
              <button
                key={device.id}
                onClick={() => setSelectedDeviceId(device.id)}
                className={`w-full text-left p-3 rounded-lg font-medium transition-colors duration-200 ${
                  selectedDeviceId === device.id
                    ? "bg-[#334b35] text-white shadow-md"
                    : "hover:bg-gray-100 text-gray-700" 
                }`}
              >
                {device.deviceName || device.id}
              </button>
            ))
          ) : (
            <p className="text-gray-500 text-center py-2">No registered devices found.</p>
          )}
        </div>
      </div>

      <div className="flex-1">
        {selectedDeviceId ? (
          <div className="space-y-6">
            {/* Header + Filter */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <h1 className="text-3xl font-bold text-gray-900">
                Reports: {selectedDevice?.deviceName || selectedDeviceId}
              </h1>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full sm:w-auto bg-white border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-600 focus:border-green-600"
              >
                <option value="daily">Last 24 Hours</option>
                <option value="weekly">Last 7 Days</option>
                <option value="monthly">Last 30 Days</option>
              </select>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <StatCard
                icon={<FaThermometerHalf className="text-red-500" />}
                label="Avg Temp"
                value={`${avg("temperature")}°C`}
              />
              <StatCard
                icon={<WiHumidity className="text-blue-500" />}
                label="Avg Humidity"
                value={`${avg("humidity")}%`}
              />
              <StatCard
                icon={<GiWaterDrop className="text-green-600" />}
                label="Avg Soil Moisture"
                value={`${avg("soilMoisture")}%`}
              />
            </div>

            {/* Line Chart */}
            <div className="bg-white p-4 rounded-xl shadow-sm h-96">
              {loading ? (
                <div className="flex justify-center items-center h-full text-gray-500">
                  Loading report data...
                </div>
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
                      stroke="#f97316" // Orange
                      name="Temp (°C)"
                    />
                    <Line
                      type="monotone"
                      dataKey="humidity"
                      stroke="#0ea5e9" // Blue
                      name="Humidity (%)"
                    />
                    <Line
                      type="monotone"
                      dataKey="soilMoisture"
                      stroke="#84cc16" // Green
                      name="Soil (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex justify-center items-center h-full text-gray-500">
                  No report data available for this period.
                </div>
              )}
            </div>

            {/* Watering Events Section */}
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">🪣 Watering Events</h2>
              <div className="space-y-3">
                {eventLogs.length > 0 ? (
                  eventLogs.map((e) => (
                    <div
                      key={e.id}
                      className="grid grid-cols-2 gap-x-4 gap-y-2 bg-gray-50 p-3 rounded-lg text-sm"
                    >
                      <p className="font-medium text-gray-500">Timestamp:</p>
                      <p className="text-right text-gray-700">
                        {dayjs(e.timestamp).format("MMM D, HH:mm")}
                      </p>

                      <p className="font-medium text-gray-500">Trigger:</p>
                      <p className="text-right font-semibold text-gray-700">
                        {e.trigger === "SCHEDULED"
                          ? "Scheduled"
                          : e.trigger === "MANUAL"
                          ? "Manual"
                          : e.trigger === "AUTO"
                          ? "Auto"
                          : e.trigger || "—"}
                      </p>

                      <p className="font-medium text-gray-500">Status:</p>
                      <p className="text-right text-gray-700">
                        {e.status ? "Pump ON" : "Pump OFF"}
                      </p>

                      <p className="font-medium text-gray-500">Soil Moisture:</p>
                      <p className="text-right text-gray-700">{e.soilMoisture ?? "—"}%</p>

                      <p className="font-medium text-gray-500">Temp:</p>
                      <p className="text-right text-gray-700">{e.temperature ?? "—"}°C</p>

                      <p className="font-medium text-gray-500">Humidity:</p>
                      <p className="text-right text-gray-700">{e.humidity ?? "—"}%</p>
                    </div>
                  ))
                ) : (
                  <p className="p-2 text-gray-500 text-center">No watering events to show.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center bg-white p-10 rounded-xl shadow-sm">
            <GiWaterDrop className="text-6xl text-[#334b35] mb-4" /> 
            <h2 className="text-2xl font-bold text-gray-900">
              {isDeviceListLoading
                ? "Loading devices..."
                : "Select a Device"}
            </h2>
            <p className="text-gray-500 mt-1">
              {isDeviceListLoading
                ? "Please wait while we fetch your devices."
                : "Choose a device from the sidebar to view its reports."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}