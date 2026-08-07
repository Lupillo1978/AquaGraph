/**
 * ============================================================
 *  MASTER_HELTEC - Nodo Maestro (Puente PC <-> Red LoRa)
 * ============================================================
 *  Este firmware corre en una tarjeta Heltec (ESP32 con radio
 *  LoRa integrada). Su función es actuar como PUENTE entre:
 *    - La PC / servidor (conectado por puerto serial/USB)
 *    - La red de nodos esclavos (comunicación inalámbrica LoRa)
 *
 *  Flujo de trabajo:
 *    1. Recibe comandos JSON desde la PC por el puerto serial.
 *    2. Reenvía esos comandos por radio LoRa a los nodos esclavos.
 *    3. Escucha la red LoRa y captura las respuestas (ACK)
 *       que envían los nodos, mostrándolas por serial a la PC.
 * 
 *
 *  IMPORTANTE:
 *    - El JSON de cada respuesta recibida se imprime en UNA LÍNEA APARTE
 *      (en crudo) para que el servidor (SerialService) pueda hacerle
 *      JSON.parse y procesar el ACK correctamente.
 * ============================================================
 */

#include <Arduino.h>   // Funciones básicas del framework Arduino/ESP32
#include <SPI.h>       // Comunicación SPI para el módulo SX1276
#include <LoRa.h>      // Librería para comunicación por radio LoRa

// ------------------------------------------------------------------
// PINOUT HELTEC WIFI LoRa 32 (V2) - radio SX1276 integrada
// La librería LoRa usa por defecto VSPI (SCK=18, MISO=19, MOSI=23,
// SS=5), pero en la Heltec la radio está en otra asignación de pines.
// Es OBLIGATORIO configurar SPI y los pines antes de LoRa.begin().
// Si tu tarjeta es Heltec V3 (SX1262), este cableado NO aplica.
// ------------------------------------------------------------------
const int LORA_SCK  = 5;   // GPIO5  -> SCK
const int LORA_MISO = 19;  // GPIO19 -> MISO
const int LORA_MOSI = 27;  // GPIO27 -> MOSI
const int LORA_SS   = 18;  // GPIO18 -> NSS/CS
const int LORA_RST  = 14;  // GPIO14 -> RST
const int LORA_DIO0 = 26;  // GPIO26 -> DIO0

// Buffer global para acumular los caracteres que llegan por el puerto serial
// hasta que se reciba un salto de línea ('\n').
String incoming = "";

/**
 * Función auxiliar para extraer el valor de una clave en un mensaje JSON.
 * Solo funciona con valores de tipo string (entre comillas dobles).
 * Ejemplo: extractJsonValue("{\"nodeId\":\"A1\"}", "nodeId") -> "A1"
 *
 * @param msg Mensaje JSON en formato String.
 * @param key  Clave cuyo valor se desea obtener.
 * @return     El valor como String, o cadena vacía si no se encuentra.
 */
String extractJsonValue(String msg, String key) {
  // Construye el patrón de búsqueda: "clave":"
  String search = "\"" + key + "\":\"";
  int start = msg.indexOf(search);          // Busca la clave en el mensaje
  if (start < 0) return "";                 // Si no existe, devuelve vacío

  start += search.length();                 // Se posiciona después de la clave y las comillas
  int end = msg.indexOf('"', start);        // Busca la comilla de cierre del valor
  if (end < 0) return "";                   // Si no hay cierre, devuelve vacío

  return msg.substring(start, end);         // Extrae y devuelve el valor
}

/**
 * Configuración inicial del nodo maestro.
 * Se ejecuta una sola vez al encender o reiniciar la tarjeta.
 */
void setup() {
  // Inicia la comunicación serial con la PC a 115200 baudios
  Serial.begin(115200);
delay(1000);  // Pequeña espera para estabilizar la tarjeta

  Serial.println("[MASTER] Starting...");

  // >>> CLAVE: Configurar SPI y pines del SX1276 ANTES de LoRa.begin() <<<
  // Sin esto, la librería usa VSPI por defecto (SS=5) y el chip no se detecta.
  SPI.begin(LORA_SCK, LORA_MISO, LORA_MOSI, LORA_SS);
  LoRa.setPins(LORA_SS, LORA_RST, LORA_DIO0);

// Inicializa el módulo LoRa en la frecuencia de 915 MHz (banda para América)
  if (!LoRa.begin(915E6)) {
    Serial.println("[MASTER] LoRa init failed");
    Serial.println("[MASTER] Verifica cableado SPI y pines (SCK, MISO, MOSI, NSS, RST, DIO0).");
    while (1) {}  // Si falla, se detiene el programa en un bucle infinito
  }

  // Configuración de parámetros de radio (deben coincidir con los esclavos)
  LoRa.setSyncWord(0x12);            // Palabra de sincronización común a la red
  LoRa.setSpreadingFactor(7);        // Factor de dispersión (velocidad/alcance)
  LoRa.setSignalBandwidth(125E3);    // Ancho de banda de la señal (125 kHz)
  LoRa.setCodingRate4(5);            // Tasa de codificación de error (4/5)
  Serial.println("[MASTER] LoRa ready");
}

//
// LÍMITE APROXIMADO DE PAYLOAD PARA UN FRAME LoRa (SF7/BW125/CR4/5).
// El SX1276 tiene un FIFO de 256 bytes; el payload útil máximo es ~222.
// Si el mensaje supera este límite, se divide en fragmentos numerados.
//
#define LORA_MAX_PAYLOAD 222

/**
 * Envía un mensaje (payload) por radio LoRa a todos los nodos esclavos.
 * Al ser una red tipo broadcast, todos los esclavos reciben el mensaje,
 * pero cada uno decide si es para él según el contenido del mismo.
 *
 * Si el payload excede el límite de un frame LoRa, se divide en fragmentos
 * con el esquema: "CH:<total>:<idx>:<data>" y se envían en secuencia con
 * un pequeño retardo entre ellos. El esclavo los reensambla.
 *
 * @param payload Cadena de texto (JSON) a transmitir por LoRa.
 */
void forwardToNodes(String payload) {
  if (payload.length() <= LORA_MAX_PAYLOAD) {
    LoRa.beginPacket();
    LoRa.print(payload);
    LoRa.endPacket();
    return;
  }

  // ---- Segmentación / chunking ----
  int total = (payload.length() + LORA_MAX_PAYLOAD - 1) / LORA_MAX_PAYLOAD;
  for (int i = 0; i < total; i++) {
    String chunk = payload.substring(i * LORA_MAX_PAYLOAD,
                                     (i + 1) * LORA_MAX_PAYLOAD);
    String frame = "CH:" + String(total) + ":" + String(i) + ":" + chunk;

    LoRa.beginPacket();
    LoRa.print(frame);
    LoRa.endPacket();

    Serial.println("[MASTER] Fragmento " + String(i + 1) + "/" + String(total) +
                   " enviado (" + String(frame.length()) + " bytes)");
    delay(150);  // Espacio entre fragmentos para evitar colisiones
  }
}

/**
 * Bucle principal. Se ejecuta continuamente y atiende dos frentes:
 *   1. La entrada serial proveniente de la PC (comandos salientes).
 *   2. La entrada LoRa proveniente de los nodos (respuestas/ACK).
 */
void loop() {
  // ---- PARTE 1: Leer comandos enviados desde la PC ----
  while (Serial.available()) {
    char c = Serial.read();
    if (c == '\n') {                      // El comando termina con un salto de línea
      incoming.trim();                    // Elimina espacios o caracteres sobrantes
      if (incoming.length() > 0) {        // Solo procesa si el mensaje no está vacío
        Serial.println("[MASTER] From PC: " + incoming);

// Extrae el tipo de mensaje para registrarlo en consola
        // (por ejemplo: PING, FEED_NOW, SET_DIET, FEEDING_PROGRAM,
        //  o "FP" en el formato compacto con clave "t").
        String msgType = "";
        if (incoming.indexOf("\"type\":\"") >= 0) {
          int start = incoming.indexOf("\"type\":\"") + 8;  // Avanza tras "type":"
          int end = incoming.indexOf('"', start);           // Busca la comilla de cierre
          if (end > start) {
            msgType = incoming.substring(start, end);
          }
        } else if (incoming.indexOf("\"t\":\"") >= 0) {
          // Formato compacto: usa la clave "t" (ej: "FP").
          int start = incoming.indexOf("\"t\":\"") + 5;     // Avanza tras "t":"
          int end = incoming.indexOf('"', start);           // Busca la comilla de cierre
          if (end > start) {
            msgType = incoming.substring(start, end);
          }
        }

        Serial.println("[MASTER] Forwarding type: " + msgType);
        forwardToNodes(incoming);         // Reenvía el mensaje por LoRa a los nodos
      }
      incoming = "";                      // Reinicia el buffer para el siguiente comando
    } else {
      incoming += c;                      // Acumula caracteres hasta el salto de línea
    }
  }

  // ---- PARTE 2: Escuchar respuestas (ACK) de los nodos esclavos ----
  int packetSize = LoRa.parsePacket();    // Verifica si llegó un paquete LoRa
  if (packetSize) {
    String msg = "";
    while (LoRa.available()) {
      msg += (char)LoRa.read();           // Lee todos los bytes del paquete recibido
    }

    msg.trim();

    // >>> CRUCIAL: Imprime el JSON EN CRUDO en una línea aparte <<<
    // El servidor (SerialService.js) separa líneas por '\n' e intenta
    // JSON.parse en cada una. Si solo imprimiéramos el mensaje con el
    // prefijo "[MASTER] From node: ", el servidor no podría parsearlo.
    Serial.println(msg);

    // Mensaje legible para depuración en la consola serial
    Serial.println("[MASTER] From node: " + msg);

    // Extrae el ID del nodo y el estado del ACK para mostrarlos de forma legible
    String nodeId = extractJsonValue(msg, "nodeId");
    String status = extractJsonValue(msg, "status");
    if (nodeId.length() > 0 || status.length() > 0) {
      Serial.println("[MASTER] ACK received from " + nodeId + " -> " + status);
    }
  }
}

