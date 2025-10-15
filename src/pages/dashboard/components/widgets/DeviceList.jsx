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
import { FiX, FiAlertTriangle } from "react-icons/fi";

const DeviceList = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deviceID, setDeviceID] = useState("");
  const [serialKey, setSerialKey] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [removeModal, setRemoveModal] = useState(false);
  const [deviceToRemove, setDeviceToRemove] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const user = auth.currentUser;

  // ✅ All your data-fetching and handling logic remains the same.
  // No changes needed to the functions below.
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const listeners = {};

    const fetchDevices = async () => {
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
        listeners[device.id] = onValue(statusRef, (snapshot) => {
          const val = snapshot.val();
          const now = Date.now();
          let newStatus = "offline";
          let newLastActive = "N/A";

          if (val?.lastActive) {
            const lastActiveTime = new Date(val.lastActive).getTime();
            if (now - lastActiveTime < 20000) {
              newStatus = "online";
            }
            newLastActive = val.lastActive;
          }
          
          setDevices((prev) =>
            prev.map((d) =>
              d.id === device.id
                ? { ...d, status: newStatus, lastActive: newLastActive }
                : d
            )
          );
        });
      });

      setDevices(ownedDevices);
      setLoading(false);
    };

    fetchDevices();

    return () => {
      Object.keys(listeners).forEach((id) => {
        off(ref(database, `devices/${id}/status`), 'value', listeners[id]);
      });
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
      if (!docSnap.exists() || docSnap.data().serialKey !== serialKey) {
        setErrorMsg("Invalid Device ID or Serial Key.");
        setIsSubmitting(false);
        return;
      }
      const deviceDataFS = docSnap.data();
      if (deviceDataFS.registered) {
        setErrorMsg("This device is already registered to an account.");
        setIsSubmitting(false);
        return;
      }
      const updateDataFS = {
        owner: user.uid,
        registered: true,
        registeredAt: new Date().toISOString(),
      };
      await updateDoc(deviceRef, updateDataFS);

      const updateDataRTDB = {
        ownerUID: user.uid,
        registered: true,
        registeredAt: updateDataFS.registeredAt,
      };
      await update(ref(database, `devices/${deviceID}`), updateDataRTDB);
      
      setSuccessMsg("Device registered successfully!");
      setDevices(prev => [...prev, {id: deviceID, name: deviceDataFS.deviceName, status: 'offline', lastActive: 'N/A'}]);
      setDeviceID("");
      setSerialKey("");
      setTimeout(() => {
        setOpenModal(false);
        setSuccessMsg("");
      }, 1500);
    } catch (error) {
      console.error("Error registering device:", error);
      setErrorMsg("An unexpected error occurred. Please try again.");
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
      await updateDoc(doc(db, "devices", deviceToRemove), {
        owner: "",
        registered: false,
        registeredAt: "",
      });
      await update(ref(database, `devices/${deviceToRemove}`), {
        ownerUID: "",
        registered: false,
        registeredAt: "",
      });
      setDevices(prev => prev.filter(d => d.id !== deviceToRemove));
      setRemoveModal(false);
    } catch (error) {
      console.error("Error removing device:", error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="p-4 md:p-6 bg-slate-100 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-slate-800">Your Devices</h1>
        <button
          onClick={() => {
            setOpenModal(true);
            setErrorMsg("");
            setSuccessMsg("");
          }}
          className="flex items-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <IoMdAdd size={20} />
          Add Device
        </button>
      </div>

      {/* Device Grid */}
      {loading ? (
        <p className="text-slate-500">Loading devices...</p>
      ) : devices.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {devices.map((device) => (
            <div
              key={device.id}
              className="bg-white p-5 rounded-xl shadow-sm flex flex-col justify-between transition-all hover:shadow-md"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <h2 className="font-bold text-slate-800 text-lg break-all">
                    {device.name}
                  </h2>
                  <div
                    className={`flex items-center gap-2 text-xs font-semibold px-2 py-1 rounded-full ${
                      device.status === "online"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <div
                      className={`h-2 w-2 rounded-full ${
                        device.status === "online" ? "bg-emerald-500" : "bg-slate-400"
                      }`}
                    />
                    {device.status}
                  </div>
                </div>
                <div className="space-y-2 text-sm text-slate-500">
                  <p>
                    <span className="font-semibold text-slate-600">ID:</span>{" "}
                    <span className="font-mono bg-slate-100 px-1 rounded">{device.id}</span>
                  </p>
                  <p>
                    <span className="font-semibold text-slate-600">Last Active:</span>{" "}
                    {device.lastActive && device.lastActive !== "N/A"
                      ? new Date(device.lastActive).toLocaleString("en-PH")
                      : "N/A"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleConfirmRemove(device.id)}
                className="w-full mt-4 flex items-center justify-center gap-2 text-rose-500 font-semibold py-2 px-4 rounded-lg hover:bg-rose-50 transition-colors"
              >
                <MdDeleteForever size={18} />
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 px-6 bg-white rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold text-slate-700">No Devices Found</h3>
            <p className="text-slate-500 mt-2">Click "Add Device" to register your first device.</p>
        </div>
      )}

      {/* Add Device Modal */}
      {openModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center p-5 border-b">
              <h3 className="text-xl font-bold text-slate-800">Register New Device</h3>
              <button onClick={() => setOpenModal(false)} className="text-slate-500 hover:text-slate-800"><FiX size={24} /></button>
            </div>
            <div className="p-5 space-y-4">
              <input type="text" placeholder="Device ID" value={deviceID} onChange={(e) => setDeviceID(e.target.value)} className="w-full border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
              <input type="password" placeholder="Serial Key" value={serialKey} onChange={(e) => setSerialKey(e.target.value)} className="w-full border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
              {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}
              {successMsg && <p className="text-sm text-green-600">{successMsg}</p>}
            </div>
            <div className="p-5 bg-slate-50 rounded-b-xl flex justify-end gap-3">
              <button onClick={() => setOpenModal(false)} className="font-semibold text-slate-600 py-2 px-4 rounded-lg hover:bg-slate-200 transition-colors">Cancel</button>
              <button onClick={handleAddDevice} disabled={isSubmitting} className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-300">
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
              <FiAlertTriangle className="mx-auto text-5xl text-rose-500 mb-4"/>
              <h3 className="text-xl font-bold text-slate-800">Confirm Removal</h3>
              <p className="text-slate-500 mt-2">Are you sure you want to remove this device? This will unassign it from your account.</p>
            </div>
            <div className="p-5 bg-slate-50 rounded-b-xl flex justify-center gap-4">
              <button onClick={() => setRemoveModal(false)} className="w-full font-semibold text-slate-600 py-2 px-4 rounded-lg hover:bg-slate-200 transition-colors">Cancel</button>
              <button onClick={handleRemoveDevice} disabled={isSubmitting} className="w-full bg-rose-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-rose-700 transition-colors disabled:bg-rose-300">
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