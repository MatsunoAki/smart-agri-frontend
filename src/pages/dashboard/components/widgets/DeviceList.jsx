import React, { useEffect, useState } from "react";
import {
Card,
CardBody,
CardHeader,
Typography,
Button,
Dialog,
DialogHeader,
DialogBody,
DialogFooter,
Input,
Alert,
} from "@material-tailwind/react";
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

const user = auth.currentUser;
const listeners = {};

// ✅ Fetch owned devices from Firestore
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

// Start listeners for each device’s status node
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
        const isOnline = diff < 20000; // if >20s no updates → offline

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

useEffect(() => {
fetchDevices();
return () => {
Object.keys(listeners).forEach((id) =>
off(ref(database, `devices/${id}/status`))
);
};
}, [user]);

// ✅ Register Device
const handleAddDevice = async () => {
setErrorMsg("");
setSuccessMsg("");
if (!deviceID || !serialKey) {
setErrorMsg("Please enter both Device ID and Serial Key.");
return;
}
try {
const deviceRef = doc(db, "devices", deviceID);
const docSnap = await getDoc(deviceRef);
if (!docSnap.exists()) {
setErrorMsg("Device not found in Database.");
return;
}
const deviceDataFS = docSnap.data();
if (deviceDataFS.serialKey !== serialKey) {
setErrorMsg("Invalid Serial Key!");
return;
}
if (deviceDataFS.registered) {
setErrorMsg("This device is already registered.");
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
setSuccessMsg("Device Registered!");
setDeviceID("");
setSerialKey("");
fetchDevices();
setTimeout(() => {
setOpenModal(false);
setSuccessMsg("");
}, 1500);
} catch (error) {
console.error("Error registering device:", error);
setErrorMsg("Error registering device. Please try again.");
}
};

// ✅ Remove Device
const handleConfirmRemove = (id) => {
setDeviceToRemove(id);
setRemoveModal(true);
};

const handleRemoveDevice = async () => {
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
setSuccessMsg("Device removed successfully.");
setRemoveModal(false);
fetchDevices();
} catch (error) {
console.error("Error removing device:", error);
setErrorMsg("Error removing device. Please try again.");
}
};

// ✅ UI
return ( <div className="flex flex-col w-full p-10"> <div className="flex justify-between items-center mb-6"> <h1 className="text-2xl font-bold">Your Devices</h1>
<Button color="green" onClick={() => setOpenModal(true)}>
+ Add Device </Button> </div>

  {loading && <Alert color="blue">Loading devices...</Alert>}

  {!loading && devices.length === 0 && (
    <Alert color="red">
      <Typography variant="h6">No devices found</Typography>
      <Typography>Please add a device to see it here.</Typography>
    </Alert>
  )}

  {/* ✅ Device Cards */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {devices.map((device) => (
      <Card
        key={device.id}
        className="shadow-md p-4 flex flex-col justify-between"
      >
        <div>
          <CardHeader className="bg-gray-100 p-3 rounded-t">
            <Typography
              variant="h6"
              className="text-gray-700 font-semibold"
            >
              {device.name || "Unnamed Device"}
            </Typography>
            <Typography variant="small" className="text-gray-500">
              ID: {device.id}
            </Typography>
          </CardHeader>
          <CardBody className="flex flex-col gap-2">
            <Typography variant="h5" className="font-semibold">
              Status:{" "}
              <span
                className={
                  device.status === "online"
                    ? "text-green-500"
                    : device.status === "loading"
                    ? "text-gray-400"
                    : "text-red-500"
                }
              >
                {device.status}
              </span>
            </Typography>
            <Typography variant="small" className="text-gray-500">
              Last Active:{" "}
              {device.lastActive && device.lastActive !== "N/A"
                ? new Date(device.lastActive).toLocaleString("en-PH", {
                    timeZone: "Asia/Manila",
                  })
                : "N/A"}
            </Typography>
          </CardBody>
        </div>

        <Button
          color="red"
          size="sm"
          className="mt-3"
          onClick={() => handleConfirmRemove(device.id)}
        >
          Remove Device
        </Button>
      </Card>
    ))}
  </div>

  {/* ✅ Add Device Modal */}
  <Dialog open={openModal} handler={() => setOpenModal(!openModal)}>
    <DialogHeader>Add New Device</DialogHeader>
    <DialogBody divider>
      <div className="flex flex-col gap-4">
        <Input
          label="Device ID"
          value={deviceID}
          onChange={(e) => setDeviceID(e.target.value)}
        />
        <Input
          label="Serial Key"
          type="password"
          value={serialKey}
          onChange={(e) => setSerialKey(e.target.value)}
        />
        {errorMsg && <Alert color="red">{errorMsg}</Alert>}
        {successMsg && <Alert color="green">{successMsg}</Alert>}
      </div>
    </DialogBody>
    <DialogFooter>
      <Button
        variant="text"
        color="red"
        onClick={() => setOpenModal(false)}
        className="mr-2"
      >
        Cancel
      </Button>
      <Button color="green" onClick={handleAddDevice}>
        Register Device
      </Button>
    </DialogFooter>
  </Dialog>

  {/* ✅ Remove Device Modal */}
  <Dialog open={removeModal} handler={() => setRemoveModal(false)}>
    <DialogHeader>Confirm Device Removal</DialogHeader>
    <DialogBody divider>
      <Typography>
        Are you sure you want to remove this device? This will unassign it
        from your account.
      </Typography>
    </DialogBody>
    <DialogFooter>
      <Button
        variant="text"
        color="gray"
        onClick={() => setRemoveModal(false)}
        className="mr-2"
      >
        Cancel
      </Button>
      <Button color="red" onClick={handleRemoveDevice}>
        Remove Device
      </Button>
    </DialogFooter>
  </Dialog>
</div>

);
};

export default DeviceList;
