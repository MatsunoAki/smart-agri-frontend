#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"
#include "time.h"

// WiFi credentials
const char* WIFI_SSID = "Xiaomi 13T";
const char* WIFI_PASSWORD = "12345678";

// Firebase Credentials
#define API_KEY "AIzaSyCiCadn4yWKCEeWGCMgMFRXf8Ka8kgGT4s"
#define DATABASE_URL "https://smart-agri-irrigation-default-rtdb.asia-southeast1.firebasedatabase.app/"
#define USER_EMAIL "user1.user@gmail.com"
#define USER_PASSWORD "Johnlex"
#define DEVICE_ID "ESP32_FARM_ABC123"

// Pin Definitions
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

// LCD Setup (I2C Address 0x27)
LiquidCrystal_I2C lcd(0x27, 16, 2);

// Global variables
unsigned long sendDataPrevMillis = 0;
const unsigned long SEND_INTERVAL = 2000;  // Send data every 2 seconds
bool signupOK = false;

void setup() {
  Serial.begin(115200);

  // Initialize LCD
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("System Starting...");
  delay(1000);

  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, HIGH);

  // Connect to WiFi
  Serial.print("Connecting to Wi-Fi");
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Connecting WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int retry = 0;
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    lcd.setCursor(0, 1);
    lcd.print("Retry: " + String(retry++));
    delay(500);
    if (retry > 20) {  // Timeout after ~10 seconds
      Serial.println("\nWiFi Connection Failed!");
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("WiFi Failed!");
      lcd.setCursor(0, 1);
      lcd.print("Check Router");
      delay(3000);
      ESP.restart();
    }
  }
  Serial.println("\nWiFi Connected!");
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("WiFi Connected");

  // Configure time from NTP Server
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    Serial.println("Failed to obtain time");
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Time Sync Failed");
    lcd.setCursor(0, 1);
    lcd.print("Restarting...");
    delay(3000);
    ESP.restart();
  }
  Serial.println("Time sync OK");
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Time Synced!");

  // Initialize Firebase
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
  signupOK = true;
}

void loop() {
  float temperature = 31.5;  // Hardcoded temperature
  float humidity = 54.0;     // Hardcoded humidity

  // Get local time
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    Serial.println("Failed to obtain time");
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Time Sync Error");
    delay(2000);
    return;
  }

  // Format timestamp as HH-MM
  char formattedTime[6];
  strftime(formattedTime, sizeof(formattedTime), "%H-%M", &timeinfo);

  // Read soil moisture
  int rawSoilMoisture = analogRead(POT_PIN);
  int soilMoisture = map(rawSoilMoisture, 2040, 4059, 100, 0);
  soilMoisture = constrain(soilMoisture, 0, 100);

  // Determine pump status
  bool pumpStatus = (soilMoisture < 40);
  digitalWrite(RELAY_PIN, pumpStatus ? LOW : HIGH);

  // Print sensor data
  Serial.println("\n------ SENSOR DATA ------");
  Serial.printf("Temperature: %.1f°C\n", temperature);
  Serial.printf("Humidity: %.1f%%\n", humidity);
  Serial.printf("Soil Moisture: %d%%\n", soilMoisture);
  Serial.printf("Pump Status: %s\n", pumpStatus ? "ON" : "OFF");
  Serial.printf("Timestamp: %s\n", formattedTime);
  Serial.println("--------------------------\n");

  // Display on LCD
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.printf("T:%.1fC H:%.1f%%", temperature, humidity);
  lcd.setCursor(0, 1);
  lcd.printf("SM:%d%% Pump:%s", soilMoisture, pumpStatus ? "ON" : "OFF");

  // Send data to Firebase every 2 seconds
  if (Firebase.ready() && signupOK && (millis() - sendDataPrevMillis >= SEND_INTERVAL)) {
    sendDataPrevMillis = millis();

    FirebaseJson json;
    json.set("moisture", soilMoisture);
    json.set("temperature", temperature);
    json.set("humidity", humidity);
    json.set("pumpStatus", pumpStatus);
    json.set("timestamp", formattedTime);

    String path = "/sensor_data/" + String(DEVICE_ID) + "/readings";

    if (Firebase.RTDB.setJSON(&fbdo, path.c_str(), &json)) {
      Serial.println("Data sent to Firebase successfully");
    } else {
      Serial.println("Failed to send data");
      Serial.println("Error: " + fbdo.errorReason());
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Firebase Error");
      lcd.setCursor(0, 1);
      lcd.print("Retrying...");
    }
  }

  delay(1000);
}
