import React, { useEffect, useState } from "react";
import { auth, db, database } from "../../../../../firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { ref, update, onValue, off } from "firebase/database";
import { IoMdAdd } from "react-icons/io";
import { MdDeleteForever } from "react-icons/md";
import { FiX, FiAlertTriangle, FiCheckCircle } from "react-icons/fi";

const DeviceList = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deviceID, setDeviceID] = useState("");
  const [serialKey, setSerialKey] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [removeModal, setRemoveModal] = useState(false);
  const [deviceToRemove, setDeviceToRemove] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const user = auth.currentUser;

  useEffect(() => {
    const listeners = {};
    const fetchDevices = async () => {
      if (!user) return;
      setLoading(true);
      const devicesRef = collection(db, "devices");
      const snapshot = await getDocs(devicesRef);
      const ownedDevices = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.owner === user.uid && data.registered) {
          ownedDevices.push({
            id: docSnap.id,
            name: data.deviceName || "Unnamed Device",
            status: "loading",
            lastActive: null,
          });
        }
      });

      ownedDevices.forEach((device) => {
        const statusRef = ref(database, `devices/${device.id}/status`);
        listeners[device.id] = onValue(
          statusRef,
          (snapshot) => {
            const val = snapshot.val();
            const now = Date.now();
            if (val?.lastActive) {
              const lastActiveTime = new Date(val.lastActive).getTime();
              const diff = now - lastActiveTime;
              const isOnline = diff < 10000; // 10-second threshold
              setDevices((prev) =>
                prev.map((d) =>
                  d.id === device.id
                    ? {
                        ...d,
                        status: isOnline ? "online" : "offline",
                        lastActive: val.lastActive,
                      }
                    : d
                )
              );
            } else {
              setDevices((prev) =>
                prev.map((d) =>
                  d.id === device.id
                    ? { ...d, status: "offline", lastActive: "N/A" }
                    : d
                )
              );
            }
          },
          (error) => console.error("RTDB listener error:", error)
        );
      });
      setDevices(ownedDevices);
      setLoading(false);
    };

    fetchDevices();
    return () => {
      Object.keys(listeners).forEach((id) =>
        off(ref(database, `devices/${id}/status`))
      );
    };
  }, [user]);

  const handleAddDevice = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    if (!deviceID || !serialKey) {
      setErrorMsg("Please enter both Device ID and Serial Key.");
      return;
    }
    setIsSubmitting(true);
    try {
      const deviceRef = doc(db, "devices", deviceID);
      const docSnap = await getDoc(deviceRef);
      if (!docSnap.exists()) {
        setErrorMsg("Device not found in Database.");
        setIsSubmitting(false);
        return;
      }
      const deviceDataFS = docSnap.data();
      if (deviceDataFS.serialKey !== serialKey) {
        setErrorMsg("Invalid Serial Key!");
        setIsSubmitting(false);
        return;
      }
      if (deviceDataFS.registered) {
        setErrorMsg("This device is already registered.");
        setIsSubmitting(false);
        return;
      }
      const deviceData = {
        name: deviceDataFS.deviceName || deviceID,
        ownerUID: user.uid,
        registered: true,
        registeredAt: new Date().toISOString(),
        serialKey: deviceDataFS.serialKey,
      };
      await setDoc(
        deviceRef,
        {
          ...deviceDataFS,
          owner: user.uid,
          registered: true,
          registeredAt: new Date().toISOString(),
        },
        { merge: true }
      );
      const deviceRTDBRef = ref(database, `devices/${deviceID}`);
      await update(deviceRTDBRef, deviceData);
      
      setDevices(prev => [...prev, {
        id: deviceID,
        name: deviceData.name,
        status: 'offline', 
        lastActive: 'N/A'
      }]);
      
      setSuccessMsg("Device Registered!");
      setDeviceID("");
      setSerialKey("");
      setTimeout(() => {
        setOpenModal(false);
        setSuccessMsg("");
      }, 1500);
    } catch (error) {
      console.error("Error registering device:", error);
      setErrorMsg("Error registering device. Please try again.");
    }
    setIsSubmitting(false);
  };

  const handleConfirmRemove = (id) => {
    setDeviceToRemove(id);
    setRemoveModal(true);
  };

  const handleRemoveDevice = async () => {
    setIsSubmitting(true);
    try {
      const firestoreRef = doc(db, "devices", deviceToRemove);
      await updateDoc(firestoreRef, {
        owner: "",
        registered: false,
        registeredAt: "",
      });
      const rtdbRef = ref(database, `devices/${deviceToRemove}`);
      await update(rtdbRef, {
        name: "",
        ownerUID: "",
        registered: false,
        registeredAt: "",
        serialKey: "",
      });
      
      setDevices(prev => prev.filter(d => d.id !== deviceToRemove));
      
      setRemoveModal(false);
      setDeviceToRemove(null);
    } catch (error) {
      console.error("Error removing device:", error);
      setErrorMsg("Error removing device. Please try again.");
    }
    setIsSubmitting(false);
  };
  
  
  return (
    <div className="font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Your Devices</h1>
        <button
          onClick={() => {
            setOpenModal(true);
            setErrorMsg("");
            setSuccessMsg("");
            setDeviceID("");
            setSerialKey("");
          }}
          className="flex items-center gap-2 bg-[#334b35] text-white font-semibold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-all shadow-sm"
        >
          <IoMdAdd size={20} />
          Add Device
        </button>
      </div>

      {/* Loading / Empty State */}
      {loading && (
        <p className="text-gray-500">Loading devices...</p>
      )}
      {!loading && devices.length === 0 && (
        <div className="text-center py-10 px-6 bg-white rounded-xl shadow-sm">
          <h3 className="text-xl font-semibold text-gray-700">No Devices Found</h3>
          <p className="text-gray-500 mt-2">Click "Add Device" to register your first device.</p>
        </div>
      )}

      {/* Device Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {devices.map((device) => (
          <div
            key={device.id}
            className="bg-white p-5 rounded-xl shadow-sm flex flex-col justify-between transition-all hover:shadow-md"
          >
            <div>
              <div className="flex justify-between items-start mb-3">
                <h2 className="font-bold text-gray-900 text-lg break-all pr-2">
                  {device.name}
                </h2>
                <div
                  className={`flex items-center gap-2 text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${
                    device.status === "online"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500" 
                  }`}
                >
                  <div
                    className={`h-2 w-2 rounded-full ${
                      device.status === "online" ? "bg-green-500" : (device.status === "loading" ? "bg-gray-400 animate-pulse" : "bg-red-500") // BRANDED change
                    }`}
                  />
                  {device.status}
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-500">
                <p>
                  <span className="font-semibold text-gray-600">ID:</span>{" "}
                  <span className="font-mono bg-gray-50 px-1 rounded">{device.id}</span>
                </p>
                <p>
                  <span className="font-semibold text-gray-600">Last Active:</span>{" "}
                  {device.lastActive && device.lastActive !== "N/A"
                    ? new Date(device.lastActive).toLocaleString("en-PH") 
                    : "N/A"}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleConfirmRemove(device.id)}
              className="w-full mt-4 flex items-center justify-center gap-2 text-red-600 font-semibold py-2 px-4 rounded-lg hover:bg-red-50 transition-colors"
            >
              <MdDeleteForever size={18} />
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* Add Device Modal */}
      {openModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center p-5 border-b">
              <h3 className="text-xl font-bold text-gray-900">Register New Device</h3>
              <button onClick={() => setOpenModal(false)} className="text-gray-500 hover:text-gray-900"><FiX size={24} /></button>
            </div>
            <div className="p-5 space-y-4">
              <input type="text" placeholder="Device ID" value={deviceID} onChange={(e) => setDeviceID(e.target.value)} className="w-full border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-600 focus:border-green-600" />
              <input type="password" placeholder="Serial Key" value={serialKey} onChange={(e) => setSerialKey(e.target.value)} className="w-full border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-600 focus:border-green-600" />
              
              {errorMsg && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm flex gap-2">
                  <FiAlertTriangle size={20} className="flex-shrink-0" />
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                  <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm flex gap-2">
                  <FiCheckCircle size={20} className="flex-shrink-0" />
                  {successMsg}
                </div>
              )}
            </div>
            <div className="p-5 bg-gray-50 rounded-b-xl flex justify-end gap-3">
              <button onClick={() => setOpenModal(false)} className="font-semibold text-gray-600 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
              <button onClick={handleAddDevice} disabled={isSubmitting || successMsg} className="bg-[#334b35] text-white font-semibold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors disabled:bg-gray-400">
                {isSubmitting ? 'Registering...' : 'Register Device'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Device Modal */}
      {removeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 text-center">
              <FiAlertTriangle className="mx-auto text-5xl text-red-500 mb-4"/>
              <h3 className="text-xl font-bold text-gray-900">Confirm Removal</h3>
              <p className="text-gray-500 mt-2">Are you sure you want to remove this device? This will unassign it from your account.</p>
            </div>
            <div className="p-5 bg-gray-50 rounded-b-xl flex justify-center gap-4">
              <button onClick={() => setRemoveModal(false)} className="w-full font-semibold text-gray-600 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
              <button onClick={handleRemoveDevice} disabled={isSubmitting} className="w-full bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-300">
                {isSubmitting ? 'Removing...' : 'Yes, Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceList;