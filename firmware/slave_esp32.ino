#include <Arduino.h>
#include <LoRa.h>

const char* NODE_ID = "A1-F01";

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("[SLAVE] Starting...");

  if (!LoRa.begin(915E6)) {
    Serial.println("[SLAVE] LoRa init failed");
    while (1) {}
  }

  LoRa.setSyncWord(0x12);
  LoRa.setSpreadingFactor(7);
  LoRa.setSignalBandwidth(125E3);
  LoRa.setCodingRate4(5);
  Serial.println("[SLAVE] LoRa ready");
}

void sendAck() {
  String response = "{\"type\":\"ACK\",\"nodeId\":\"" + String(NODE_ID) + "\",\"status\":\"OK\"}\n";
  LoRa.beginPacket();
  LoRa.print(response);
  LoRa.endPacket();
  Serial.println("[SLAVE] ACK sent");
}

void loop() {
  int packetSize = LoRa.parsePacket();
  if (packetSize) {
    String msg = "";
    while (LoRa.available()) {
      msg += (char)LoRa.read();
    }

    Serial.println("[SLAVE] Received: " + msg);

    if (msg.indexOf("\"type\":\"PING\"") >= 0) {
      sendAck();
    }

    if (msg.indexOf("\"type\":\"FEED_NOW\"") >= 0) {
      Serial.println("[SLAVE] Feeding command received");
      sendAck();
    }

    if (msg.indexOf("\"type\":\"SET_DIET\"") >= 0) {
      Serial.println("[SLAVE] Diet command received");
      sendAck();
    }
  }
}
