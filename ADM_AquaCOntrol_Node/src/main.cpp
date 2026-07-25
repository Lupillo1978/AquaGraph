#include <Arduino.h>
#include "Config.h"

void setup()
{
    Serial.begin(SERIAL_BAUDRATE);

    Serial.println();
    Serial.println("--------------------------------");
    Serial.println(FIRMWARE_NAME);
    Serial.print("Firmware: ");
    Serial.println(FIRMWARE_VERSION);
    Serial.println("--------------------------------");
}

void loop()
{

}