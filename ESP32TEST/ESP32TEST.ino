#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"
#include <DHT.h>
#include "time.h"

// WiFi credentials
const char* WIFI_SSID = "Error 404";
const char* WIFI_PASSWORD = "CVZzHg2M";

// Firebase Credentials
#define API_KEY "AIzaSyCiCadn4yWKCEeWGCMgMFRXf8Ka8kgGT4s"
#define DATABASE_URL "https://smart-agri-irrigation-default-rtdb.asia-southeast1.firebasedatabase.app/"
#define USER_EMAIL "rivera.sambile@gmail.com"
#define USER_PASSWORD "Johnlex"
#define DEVICE_ID "ESP32_FARM_ABC123"

// Pin Definitions
#define DHTPIN 5
#define DHTTYPE DHT11
#define POT_PIN 34    // Soil moisture sensor
#define RELAY_PIN 13  // Relay/pump control

// NTP Server Settings
const char* ntpServer = "asia.pool.ntp.org";
const long gmtOffset_sec = 28800;  // GMT+8 for the Philippines
const int daylightOffset_sec = 0;  // No daylight saving time

// Firebase Setup
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;
DHT dht(DHTPIN, DHTTYPE);

// Global variables
unsigned long sendDataPrevMillis = 0;
const unsigned long SEND_INTERVAL = 2000;  // Send data every 2 seconds
bool signupOK = false;

void setup() {
  Serial.begin(115200);

  // Initialize sensors
  dht.begin();
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);  

  // Connect to WiFi
  Serial.print("Connecting to Wi-Fi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }
  Serial.println("\nWiFi Connected!");

  // Configure time from NTP Server
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
  Serial.println("Time synchronization complete.");

  // Initialize Firebase
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  Serial.println("Waiting for Firebase authentication...");
  while (fbdo.errorCode() != 0) {
    Serial.print(".");
    delay(300);
  }

  signupOK = true;
  Serial.println("Firebase authentication ready!");
}

void loop() {
  // Get local time
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    Serial.println("Failed to obtain time");
    return;
  }

  // Format timestamp as HH-MM
  char formattedTime[6];  
  strftime(formattedTime, sizeof(formattedTime), "%H-%M", &timeinfo);

  // Read sensor values
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  int rawSoilMoisture = analogRead(POT_PIN);
  int soilMoisture = map(rawSoilMoisture, 0, 1300, 100, 0);
  soilMoisture = constrain(soilMoisture, 0, 100);  

  // Determine pump status
  bool pumpStatus = (soilMoisture < 40);
  digitalWrite(RELAY_PIN, pumpStatus ? HIGH : LOW);

  // Print sensor data
  Serial.println("\n------ SENSOR DATA ------");
  Serial.printf("Temperature: %.1f°C\n", temperature);
  Serial.printf("Humidity: %.1f%%\n", humidity);
  Serial.printf("Soil Moisture: %d%%\n", soilMoisture);
  Serial.printf("Pump Status: %s\n", pumpStatus ? "ON" : "OFF");
  Serial.printf("Timestamp: %s\n", formattedTime);
  Serial.println("--------------------------\n");

  // Send data to Firebase every 2 seconds
  if (Firebase.ready() && signupOK && 
      (millis() - sendDataPrevMillis > SEND_INTERVAL || sendDataPrevMillis == 0)) {
    sendDataPrevMillis = millis();

    FirebaseJson json;
    json.set("moisture", soilMoisture);
    json.set("temperature", temperature);
    json.set("humidity", humidity);
    json.set("pump-status", pumpStatus);
    json.set("timestamp", formattedTime);  // New formatted timestamp

    String path = "/sensor_data/" + String(DEVICE_ID) + "/readings";
    
    if (Firebase.RTDB.setJSON(&fbdo, path.c_str(), &json)) {
      Serial.println("Data sent to Firebase successfully");
    } else {
      Serial.println("Failed to send data");
      Serial.println("Error: " + fbdo.errorReason());
    }
  }

  delay(2000);
}
