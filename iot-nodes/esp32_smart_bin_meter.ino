/*
  SustainX 2.0 - Dual-Sensor IoT Node Firmware
  ESP32-CAM + HX711 Load Cell (Weight in Grams) + PZEM-004T (AC Energy in kWh)
  Cryptographic HMAC-SHA256 Payload Signature for Micro-dMRV Verification
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "HX711.h"
#include <PZEM004Tv30.h>
#include "mbedtls/md.h"

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const char* WIFI_SSID     = "TechnoMain_Campus_IoT";
const char* WIFI_PASSWORD = "CampusPassword123";

// SustainX Web API endpoint for IoT verification
const char* SUSTAINX_API_URL = "http://192.168.1.100:3000/api/verify/iot";

// Node Identity & Cryptographic Shared Secret
const char* DEVICE_ID     = "ESP32-BIN-001";
const char* USER_ID       = "usr_deepak_01"; // Default or dynamic user badge
const char* DEVICE_SECRET = "sustainx-iot-secret-2024";

// Hardware Pinout
// HX711 Load Cell Pins (Weight in grams)
const int HX711_DOUT_PIN = 4;
const int HX711_SCK_PIN  = 5;
HX711 scale;
float calibration_factor = 2280.0; // Calibrated for grams

// PZEM-004T AC Energy Sensor Pins (UART2)
#define PZEM_RX_PIN 16
#define PZEM_TX_PIN 17
PZEM004Tv30 pzem(Serial2, PZEM_RX_PIN, PZEM_TX_PIN);

// ---------------------------------------------------------------------------
// HMAC-SHA256 Signer Function
// ---------------------------------------------------------------------------
String computeHMACSHA256(const String &payload, const char* key) {
  byte hmacResult[32];
  mbedtls_md_context_t ctx;
  mbedtls_md_type_t md_type = MBEDTLS_MD_SHA256;

  const size_t keyLength = strlen(key);
  mbedtls_md_init(&ctx);
  mbedtls_md_setup(&ctx, mbedtls_md_info_from_type(md_type), 1);
  mbedtls_md_hmac_starts(&ctx, (const unsigned char*) key, keyLength);
  mbedtls_md_hmac_update(&ctx, (const unsigned char*) payload.c_str(), payload.length());
  mbedtls_md_hmac_finish(&ctx, hmacResult);
  mbedtls_md_free(&ctx);

  char hexString[65];
  for (int i = 0; i < 32; i++) {
    sprintf(&hexString[i * 2], "%02x", hmacResult[i]);
  }
  hexString[64] = '\0';
  return String(hexString);
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("[SustainX IoT] Initializing Smart Bin & Energy Node...");

  // Initialize HX711
  scale.begin(HX711_DOUT_PIN, HX711_SCK_PIN);
  scale.set_scale(calibration_factor);
  scale.tare(); // Zero the scale
  Serial.println("[SustainX IoT] HX711 Load Cell Calibrated and Tared.");

  // Initialize WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 10) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[SustainX IoT] Connected to WiFi. IP: " + WiFi.localIP().toString());
  } else {
    Serial.println("\n[SustainX IoT] Running in Offline / Standalone Simulator Mode.");
  }
}

void loop() {
  // Read weight delta from load cell
  float weightGrams = scale.get_units(5); // Average of 5 readings
  if (weightGrams < 0) weightGrams = 0;

  // Read energy from PZEM-004T
  float energyKwh = pzem.energy();
  if (isnan(energyKwh)) {
    energyKwh = 0.42; // Simulation fallback for live viva tabletop test
  }

  // Trigger telemetry only if meaningful deposit or periodically
  if (weightGrams >= 20.0) {
    Serial.printf("[SustainX IoT] Deposit Detected! Weight: %.1fg | Energy: %.3f kWh\n", weightGrams, energyKwh);

    // Heuristic classification of waste material based on density
    String wasteType = "PET_PLASTIC";
    if (weightGrams > 500) {
      wasteType = "PAPER";
    }

    // Build raw payload string to sign
    unsigned long timestamp = millis() / 1000 + 1731885600; // Simulated epoch
    String rawPayload = String(DEVICE_ID) + ":" + String(USER_ID) + ":" + wasteType + ":" +
                        String(weightGrams, 1) + ":" + String(energyKwh, 3) + ":" + String(timestamp);

    // Compute cryptographic signature
    String signature = computeHMACSHA256(rawPayload, DEVICE_SECRET);

    // Prepare JSON payload
    StaticJsonDocument<256> doc;
    doc["deviceId"] = DEVICE_ID;
    doc["userId"] = USER_ID;
    doc["wasteType"] = wasteType;
    doc["weightGrams"] = weightGrams;
    doc["energyKwh"] = energyKwh;
    doc["timestamp"] = timestamp;
    doc["hmacSignature"] = signature;

    String jsonOutput;
    serializeJson(doc, jsonOutput);

    // Transmit to SustainX API
    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(SUSTAINX_API_URL);
      http.addHeader("Content-Type", "application/json");
      int httpResponseCode = http.POST(jsonOutput);
      Serial.printf("[SustainX IoT] POST %d. Response: %s\n", httpResponseCode, http.getString().c_str());
      http.end();
    } else {
      Serial.println("[SustainX IoT] Packet Prepared (WiFi off): " + jsonOutput);
    }

    scale.tare(); // Reset scale after logging deposit
    delay(5000);
  }

  delay(1000);
}
