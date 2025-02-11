

<h1>🌱 Smart Agri Irrigation</h1>
<p>A smart irrigation system with a web-integrated platform for <strong>ESP32-based devices</strong>. 
This system monitors <strong>soil moisture, temperature, and humidity</strong> and features an <strong>auto-pump mode</strong> for efficient water management.</p>

<h2>🚀 Features</h2>
<ul>
    <li><strong>ESP32 Sensor Monitoring</strong>: Collects real-time data from soil moisture, temperature, and humidity sensors.</li>
    <li><strong>Auto & Manual Pump Control</strong>: Automates irrigation based on soil conditions or allows manual control.</li>
    <li><strong>Web Dashboard</strong>: A React-based web app for monitoring and controlling irrigation.</li>
    <li><strong>Device Registration</strong>: Users can add and manage multiple ESP32 devices.</li>
    <li><strong>Real-Time Data Updates</strong>: Uses <strong>MQTT (AWS IoT)</strong> for live updates and Firebase/Firestore for storage.</li>
</ul>

<h2>📌 Tech Stack</h2>
<ul>
    <li><strong>Hardware</strong>: ESP32, Soil Moisture Sensor, DHT22 (Temp & Humidity), Relay Module (for pump control)</li>
    <li><strong>Backend</strong>: AWS IoT (MQTT), Firebase/Firestore, MongoDB Atlas</li>
    <li><strong>Frontend</strong>: React.js (hosted on Vercel)</li>
    <li><strong>Connectivity</strong>: Web Bluetooth API for device registration</li>
</ul>

<h2>🛠️ Installation & Setup</h2>

<h3>1️⃣ Clone the Repository</h3>
<pre><code>
git clone https://github.com/yourusername/smart-agri-irrigation.git
cd smart-agri-irrigation
</code></pre>

<h3>2️⃣ ESP32 Firmware</h3>
<ul>
    <li>Install dependencies:</li>
    <ul>
        <li><strong>VS Code with PlatformIO</strong></li>
        <li>Libraries: <code>PubSubClient</code> (MQTT), <code>Firebase ESP32</code>, <code>DHT Sensor</code></li>
    </ul>
    <li>Flash ESP32 with <code>firmware.ino</code></li>
    <li>Configure <strong>WiFi & MQTT Credentials</strong></li>
</ul>

<h3>3️⃣ Web App</h3>
<pre><code>
cd web
npm install
npm start
</code></pre>

<h2>📡 Data Flow</h2>
<ol>
    <li><strong>ESP32</strong> collects sensor data and publishes it via <strong>AWS IoT MQTT</strong>.</li>
    <li><strong>Web App</strong> fetches real-time data from Firestore and displays it on the dashboard.</li>
    <li><strong>Users</strong> can control the pump manually or enable <strong>AutoPump mode</strong> based on soil moisture levels.</li>
</ol>

<h2>📷 Screenshots</h2>
<p><em>(Add images of the web dashboard & ESP32 setup here.)</em></p>

<h2>🤝 Contributing</h2>
<ol>
    <li>Fork the repository</li>
    <li>Create a new branch (<code>feature-xyz</code>)</li>
    <li>Commit changes and push (<code>git push origin feature-xyz</code>)</li>
    <li>Open a pull request</li>
</ol>

<h2>📜 License</h2>
<p>MIT License - Feel free to use and modify this project!</p>

</body>
</html>