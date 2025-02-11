

<h1>🌱 Smart Agri Irrigation</h1>

A smart irrigation system with a web-integrated platform for ESP32-based devices. This system monitors soil moisture, temperature, and humidity and features an auto-pump mode for efficient water management.

🚀 Features

ESP32 Sensor Monitoring: Collects real-time data from soil moisture, temperature, and humidity sensors.

Auto & Manual Pump Control: Automates irrigation based on soil conditions or allows manual control.

Web Dashboard: A React-based web app for monitoring and controlling irrigation.

Device Registration: Users can add and manage multiple ESP32 devices.

Real-Time Data Updates: Uses MQTT (AWS IoT) for live updates and Firebase/Firestore for storage.


📌 Tech Stack

Hardware: ESP32, Soil Moisture Sensor, DHT22 (Temp & Humidity), Relay Module (for pump control)

Backend: AWS IoT (MQTT), Firebase/Firestore, MongoDB Atlas

Frontend: React.js (hosted on Vercel)

Connectivity: Web Bluetooth API for device registration


🛠️ Installation & Setup

1️⃣ Clone the Repository

git clone https://github.com/yourusername/smart-agri-irrigation.git
cd smart-agri-irrigation

2️⃣ ESP32 Firmware

Install dependencies:

VS Code with PlatformIO

Libraries: PubSubClient (MQTT), Firebase ESP32, DHT Sensor


Flash ESP32 with firmware.ino

Configure WiFi & MQTT Credentials


3️⃣ Web App

Install dependencies:

cd web
npm install

Run the development server:

npm start


📡 Data Flow

1. ESP32 collects sensor data and publishes it via AWS IoT MQTT.


2. Web App fetches real-time data from Firestore and displays it on the dashboard.


3. Users can control the pump manually or enable AutoPump mode based on soil moisture levels.



📷 Screenshots

Add images of the web dashboard & ESP32 setup here.

🤝 Contributing

1. Fork the repository


2. Create a new branch (feature-xyz)


3. Commit changes and push (git push origin feature-xyz)


4. Open a pull request



📜 License

MIT License - Feel free to use and modify this project!


