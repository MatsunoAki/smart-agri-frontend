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
#define USER_EMAIL "user1.user@gmail.com"  // Removed trailing space that was causing issues
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
  Serial.println("\n----- Starting System -----");

  // Initialize relay first - Set to LOW (OFF) immediately
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, HIGH);  // Set initial state to OFF
  Serial.println("Relay initialized to OFF state");

  // Initialize DHT sensor
  dht.begin();
  Serial.println("DHT sensor initialized");

  // Connect to WiFi
  Serial.print("Connecting to Wi-Fi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int wifiAttempts = 0;
  while (WiFi.status() != WL_CONNECTED && wifiAttempts < 20) {  // Added timeout
    Serial.print(".");
    delay(500);
    wifiAttempts++;
  }

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("\nWiFi connection failed! Restarting...");
    ESP.restart();
  }

  Serial.println("\nWiFi Connected!");
  Serial.printf("IP Address: %s\n", WiFi.localIP().toString().c_str());

  // Configure time from NTP Server
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
  Serial.println("Time synchronization complete.");

  // Initialize Firebase with timeout
  Serial.println("Initializing Firebase...");
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  // Wait for Firebase with timeout
  unsigned long authStart = millis();
  Serial.print("Authenticating with Firebase");
  while (!Firebase.ready() && (millis() - authStart) < 10000) {  // 10 second timeout
    Serial.print(".");
    delay(300);
  }

  if (Firebase.ready()) {
    signupOK = true;
    Serial.println("\nFirebase authentication successful!");
  } else {
    Serial.println("\nFirebase authentication timed out. Continuing without Firebase...");
  }

  Serial.println("----- Setup Complete -----\n");
}

void loop() {
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi connection lost. Reconnecting...");
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    delay(5000);
    return;
  }

  // Get local time
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    Serial.println("Failed to obtain time");
    return;
  }

  // Format timestamp
  char formattedTime[6];
  strftime(formattedTime, sizeof(formattedTime), "%H-%M", &timeinfo);

  // Read sensor values with error checking
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  // if (isnan(temperature) || isnan(humidity)) {
  //   Serial.println("Failed to read from DHT sensor!");
  //   delay(2000);
  //   return;
  // }

  // Read soil moisture
  int rawSoilMoisture = analogRead(POT_PIN);
  int soilMoisture = map(rawSoilMoisture, 2040, 4095, 100, 0);
  soilMoisture = constrain(soilMoisture, 0, 100);

  // Control pump
  bool pumpStatus = (soilMoisture < 40);
  digitalWrite(RELAY_PIN, pumpStatus ? LOW : HIGH);

  // Print sensor data
  Serial.println("\n------ SENSOR DATA ------");
  Serial.printf("Raw Soil Reading: %d\n", rawSoilMoisture);
  Serial.printf("Temperature: %.1f°C\n", temperature);
  Serial.printf("Humidity: %.1f%%\n", humidity);
  Serial.printf("Soil Moisture: %d%%\n", soilMoisture);
  Serial.printf("Pump Status: %s\n", pumpStatus ? "ON" : "OFF");
  Serial.printf("Timestamp: %s\n", formattedTime);
  Serial.println("--------------------------\n");

  // Send data to Firebase if connected
  if (Firebase.ready() && signupOK && (millis() - sendDataPrevMillis > SEND_INTERVAL || sendDataPrevMillis == 0)) {

    sendDataPrevMillis = millis();
    FirebaseJson json;
    json.set("moisture", soilMoisture);
    json.set("temperature", temperature);
    json.set("humidity", humidity);
    json.set("pump-status", pumpStatus);
    json.set("timestamp", formattedTime);

    String path = "/sensor_data/" + String(DEVICE_ID) + "/readings";

    if (Firebase.RTDB.setJSON(&fbdo, path.c_str(), &json)) {
      Serial.println("Data sent to Firebase successfully");
    } else {
      Serial.println("Failed to send data: " + fbdo.errorReason());
    }
  }

  delay(2000);
}