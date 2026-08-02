#include <Arduino.h>
#include <LoRa.h>

String incoming = "";

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("[MASTER] Starting...");

  if (!LoRa.begin(915E6)) {
    Serial.println("[MASTER] LoRa init failed");
    while (1) {}
  }

  LoRa.setSyncWord(0x12);
  LoRa.setSpreadingFactor(7);
  LoRa.setSignalBandwidth(125E3);
  LoRa.setCodingRate4(5);
  Serial.println("[MASTER] LoRa ready");
}

void loop() {
  while (Serial.available()) {
    char c = Serial.read();
    if (c == '\n') {
      incoming.trim();
      if (incoming.length() > 0) {
        Serial.println("[MASTER] From PC: " + incoming);

        LoRa.beginPacket();
        LoRa.print(incoming);
        LoRa.endPacket();

        Serial.println("[MASTER] Forwarded to LoRa");
      }
      incoming = "";
    } else {
      incoming += c;
    }
  }

  int packetSize = LoRa.parsePacket();
  if (packetSize) {
    String msg = "";
    while (LoRa.available()) {
      msg += (char)LoRa.read();
    }

    Serial.println("[MASTER] From node: " + msg);
  }
}
