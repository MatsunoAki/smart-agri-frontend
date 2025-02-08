#include <WiFi.h>
#include <Firebase_ESP_Client.h>
// Provide the token generation process info.
#include "addons/TokenHelper.h"
// Provide the RTDB payload printing info and other helper functions.
#include "addons/RTDBHelper.h"
#include <DHT.h>

// WiFi credentials
const char* WIFI_SSID = "Error 404";
const char* WIFI_PASSWORD = "CVZzHg2M";

// Firebase Credentials
#define API_KEY "AIzaSyCiCadn4yWKCEeWGCMgMFRXf8Ka8kgGT4s"
#define DATABASE_URL "https://smart-agri-irrigation-default-rtdb.asia-southeast1.firebasedatabase.app/"

// Unique Device ID
#define DEVICE_ID "ESP32_FARM_ABC123"

// Initialize Firebase objects
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// DHT Sensor
#define DHTPIN 5
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

// Sensor and relay pins
#define POT_PIN 34    // Potentiometer for soil moisture
#define RELAY_PIN 13  // Relay module pin

unsigned long sendDataPrevMillis = 0;
bool signupOK = false;

void setup() {
  Serial.begin(115200);
  dht.begin();
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);  // Initially turn off the pump

  // Connect to WiFi
  Serial.print("Connecting to Wi-Fi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println("\nWiFi Connected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  // Initialize Firebase
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  if (Firebase.signUp(&config, &auth, "", "")) {
    Serial.println("Firebase signup successful.");
    signupOK = true;
  } else {
    Serial.printf("Firebase signup failed: %s\n", config.signer.signupError.message.c_str());
  }

  config.token_status_callback = tokenStatusCallback;  // Monitor token status
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}

void loop() {
  // Read sensor values
  float temperatureC = dht.readTemperature();
  float humidity = dht.readHumidity();
  int rawSoilMoisture = analogRead(POT_PIN);
  int soilMoisture = map(rawSoilMoisture, 0, 1300, 100, 0);
  bool pumpStatus = (soilMoisture < 40);

  // Print sensor data to Serial Monitor
  Serial.println("------ SENSOR DATA ------");
  Serial.printf("Temperature: %.1f°C\n", temperatureC);
  Serial.printf("Humidity: %.1f%%\n", humidity);
  Serial.printf("Raw Soil Moisture: %d\n", rawSoilMoisture);
  Serial.printf("Mapped Soil Moisture: %d%%\n", soilMoisture);
  Serial.printf("Pump Status: %s\n", pumpStatus ? "ON" : "OFF");
  Serial.println("--------------------------\n");

  // Control pump
  digitalWrite(RELAY_PIN, pumpStatus ? HIGH : LOW);

  // Send data to Firebase every 5 seconds
  if (Firebase.ready() && signupOK && (millis() - sendDataPrevMillis > 5000 || sendDataPrevMillis == 0)) {
    sendDataPrevMillis = millis();

    FirebaseJson json;
    json.set("moisture", soilMoisture);
    json.set("temperature", temperatureC);
    json.set("humidity", humidity);
    json.set("pump-status", pumpStatus);
    json.set("timestamp/.sv", "timestamp");

    String path = "/sensor_data/" + String(DEVICE_ID) + "/readings";

    if (Firebase.RTDB.setJSON(&fbdo, path.c_str(), &json)) {
      Serial.println("Data sent to Firebase successfully.");
    } else {
      Serial.println("Failed to send data.");
      Serial.println("Error: " + fbdo.errorReason());
    }
  }

  delay(2000);  // Update every 2 seconds
}
