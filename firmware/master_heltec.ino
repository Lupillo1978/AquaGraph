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
 *  IMPORTANTE:
 *    - El JSON de cada respuesta recibida se imprime en UNA LÍNEA APARTE
 *      (en crudo) para que el servidor (SerialService) pueda hacerle
 *      JSON.parse y procesar el ACK correctamente.
 * ============================================================
 */

#include <Arduino.h>   // Funciones básicas del framework Arduino/ESP32
#include <LoRa.h>      // Librería para comunicación por radio LoRa

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

  // Inicializa el módulo LoRa en la frecuencia de 915 MHz (banda para América)
  if (!LoRa.begin(915E6)) {
    Serial.println("[MASTER] LoRa init failed");
    while (1) {}  // Si falla, se detiene el programa en un bucle infinito
  }

  // Configuración de parámetros de radio (deben coincidir con los esclavos)
  LoRa.setSyncWord(0x12);            // Palabra de sincronización común a la red
  LoRa.setSpreadingFactor(7);        // Factor de dispersión (velocidad/alcance)
  LoRa.setSignalBandwidth(125E3);    // Ancho de banda de la señal (125 kHz)
  LoRa.setCodingRate4(5);            // Tasa de codificación de error (4/5)
  Serial.println("[MASTER] LoRa ready");
}

/**
 * Envía un mensaje (payload) por radio LoRa a todos los nodos esclavos.
 * Al ser una red tipo broadcast, todos los esclavos reciben el mensaje,
 * pero cada uno decide si es para él según el contenido del mismo.
 *
 * @param payload Cadena de texto (JSON) a transmitir por LoRa.
 */
void forwardToNodes(String payload) {
  LoRa.beginPacket();   // Inicia un paquete de transmisión
  LoRa.print(payload);  // Escribe el contenido del mensaje en el paquete
  LoRa.endPacket();     // Finaliza y envía el paquete por la radio
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
        // (por ejemplo: PING, FEED_NOW, SET_DIET, FEEDING_PROGRAM)
        String msgType = "";
        if (incoming.indexOf("\"type\":\"") >= 0) {
          int start = incoming.indexOf("\"type\":\"") + 8;  // Avanza tras "type":"
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

