import mqtt from "mqtt";

// AWS IoT Endpoint (replace with yours)
const AWS_MQTT_URL = "wss://aovyutir1busg-ats.iot.ap-southeast-2.amazonaws.com/mqtt"; 

// AWS MQTT Config
const options = {
  protocol: "wss",
  clientId: `webapp-${Math.random().toString(16).substr(2, 8)}`,
  username: "", // AWS IoT does not use username/password, leave blank
  password: "", // AWS IoT does not use username/password, leave blank
  reconnectPeriod: 2000, // Auto-reconnect every 2 seconds
};

let client;

// **Connect to MQTT Broker**
export const connectMQTT = (onMessageCallback) => {
  if (!client || !client.connected) {
    client = mqtt.connect(AWS_MQTT_URL, options);

    client.on("connect", () => {
      console.log("Connected to MQTT Broker");
      client.subscribe("smart_irrigation/sensor_data");
    });

    client.on("message", (topic, message) => {
      console.log(`Received message from ${topic}: ${message.toString()}`);
      onMessageCallback(topic, JSON.parse(message.toString()));
    });

    client.on("error", (err) => {
      console.error("MQTT Connection Error: ", err);
    });

    client.on("close", () => {
      console.warn("MQTT Disconnected!");
    });
  }
};

// **Publish a message**
export const publishMQTT = (topic, message) => {
  if (client && client.connected) {
    client.publish(topic, JSON.stringify(message));
    console.log(`Published to ${topic}:`, message);
  } else {
    console.warn("MQTT not connected!");
  }
};

// **Disconnect MQTT**
export const disconnectMQTT = () => {
  if (client) {
    client.end();
    console.log("Disconnected from MQTT Broker");
  }
};
