/**
 * ============================================================
 *  SLAVE_ESP32 - Nodo Esclavo (Comedero / Dispositivo de campo)
 * ============================================================
 *  Este firmware corre en una tarjeta ESP32 con radio LoRa.
 *  Actúa como NODO ESCLAVO dentro de la red AquaGraph.
 *
 *  Su función es:
 *    - Escuchar los comandos que envía el nodo maestro por LoRa.
 *    - Responder a cada comando con un mensaje de confirmación
 *      (ACK) para que el sistema sepa que fue recibido.
 *    - EJECUTAR la alimentación real accionando el motor/relé
 *      del comedero conectado al GPIO 2.
 *
 *  Comandos soportados:
 *    - PING           : Verifica que el nodo está vivo.
 *    - FEED_NOW       : Dispara la alimentación de forma inmediata.
 *    - SET_DIET       : Configura una nueva dieta.
 *    - FEEDING_PROGRAM: Recibe un programa de alimentación y lo
 *                       ejecuta (disparos + intervalos) en el GPIO 2.
 * ============================================================
 */

#include <Arduino.h>   // Funciones básicas del framework Arduino/ESP32
#include <LoRa.h>      // Librería para comunicación por radio LoRa

// ------------------------------------------------------------------
// Identificador único de este nodo dentro de la red.
// Formato: A1 (estanque) - F01 (comedero número 1).
// IMPORTANTE: debe coincidir con el campo "nodeId" del alimentador
// registrado en el sistema (server/storage/feeders.json) y con el
// nodeId que la interfaz usa al construir el programa.
// ------------------------------------------------------------------
const char* NODE_ID = "A1-F01";

// ------------------------------------------------------------------
// PIN DEL MOTOR / RELÉ DEL COMEDERO
// El trabajo físico de alimentación se realiza mediante el GPIO 2.
//  - HIGH: motor encendido (dosificando alimento)
//  - LOW : motor apagado
// ------------------------------------------------------------------
const int FEEDER_PIN = 2;

// ------------------------------------------------------------------
// Variables para el control NO BLOQUEANTE del motor.
// Se usa un pequeño autómata con millis() para no detener el bucle
// principal (así el nodo sigue escuchando LoRa mientras alimenta).
// ------------------------------------------------------------------
bool feedingActive = false;        // true mientras hay un ciclo de alimentación en curso
bool motorOn = false;              // true si el motor está encendido en este momento
unsigned long motorUntilMs = 0;    // instante (millis) en que debe apagarse el motor
unsigned long intervalUntilMs = 0; // instante (millis) en que termina la espera entre disparos
int shotsRemaining = 0;            // número de disparos que faltan por ejecutar
long shotDurationMs = 0;           // duración de cada disparo en milisegundos
long shotIntervalMs = 0;           // intervalo entre disparos en milisegundos

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
 * Función auxiliar que extrae el tipo de comando del mensaje JSON.
 * Busca específicamente la clave "type" y devuelve su valor.
 * Ejemplo: extractJsonType("{\"type\":\"PING\"}") -> "PING"
 *
 * @param msg Mensaje JSON en formato String.
 * @return    El tipo de mensaje como String, o cadena vacía si no existe.
 */
String extractJsonType(String msg) {
  int start = msg.indexOf("\"type\":\"");   // Busca la clave "type":
  if (start < 0) return "";                 // Si no existe, devuelve vacío

  start += 8;                               // Avanza tras el patrón "type":"
  int end = msg.indexOf('"', start);        // Busca la comilla de cierre del valor
  if (end < 0) return "";                   // Si no hay cierre, devuelve vacío

  return msg.substring(start, end);         // Extrae y devuelve el tipo
}

/**
 * Función auxiliar para extraer un valor NUMÉRICO (entero o decimal)
 * de una clave JSON. A diferencia de extractJsonValue(), no espera
 * comillas alrededor del valor.
 * Ejemplo: extractJsonFloat("{\"durationSeconds\":10}", "durationSeconds") -> 10.0
 *
 * @param msg Mensaje JSON en formato String.
 * @param key  Clave numérica cuyo valor se desea obtener.
 * @return     El valor como float, o 0 si no se encuentra.
 */
float extractJsonFloat(String msg, String key) {
  // Patrón de búsqueda para números: "clave": (sin comillas)
  String search = "\"" + key + "\":";
  int start = msg.indexOf(search);
  if (start < 0) return 0;                  // Si no existe, devuelve 0

  start += search.length();                 // Se posiciona después de "clave":
  int end = start;
  // Avanza mientras el carácter sea dígito, punto decimal o signo negativo
  while (end < (int)msg.length() && (isdigit(msg[end]) || msg[end] == '.' || msg[end] == '-')) {
    end++;
  }
  String numStr = msg.substring(start, end); // Extrae la cadena numérica
  return numStr.toFloat();                   // Convierte a número
}

/**
 * Configuración inicial del nodo esclavo.
 * Se ejecuta una sola vez al encender o reiniciar la tarjeta.
 */
void setup() {
  // Inicia la comunicación serial para depuración a 115200 baudios
  Serial.begin(115200);
  delay(1000);  // Pequeña espera para estabilizar la tarjeta

  Serial.println("[SLAVE] Starting...");

  // Configura el GPIO 2 como salida para controlar el motor/relé
  // y lo deja APAGADO (LOW) al iniciar.
  pinMode(FEEDER_PIN, OUTPUT);
  digitalWrite(FEEDER_PIN, LOW);

  // Inicializa el módulo LoRa en la frecuencia de 915 MHz (banda para América)
  if (!LoRa.begin(915E6)) {
    Serial.println("[SLAVE] LoRa init failed");
    while (1) {}  // Si falla, se detiene el programa en un bucle infinito
  }

  // Configuración de parámetros de radio (deben coincidir con el maestro)
  LoRa.setSyncWord(0x12);            // Palabra de sincronización común a la red
  LoRa.setSpreadingFactor(7);        // Factor de dispersión (velocidad/alcance)
  LoRa.setSignalBandwidth(125E3);    // Ancho de banda de la señal (125 kHz)
  LoRa.setCodingRate4(5);            // Tasa de codificación de error (4/5)
  Serial.println("[SLAVE] LoRa ready");
}

/**
 * Envía un mensaje de confirmación (ACK) al nodo maestro.
 * El ACK incluye el ID de la petición original, el ID de este nodo,
 * el estado "OK" y un mensaje descriptivo.
 *
 * @param requestId   Identificador de la petición que se está confirmando.
 * @param messageText Texto descriptivo del resultado (ej: "Ping accepted").
 */
void sendAck(String requestId, String messageText) {
  // Construye el mensaje JSON de respuesta
  String response = "{\"type\":\"ACK\",\"requestId\":\"" + requestId + "\",\"nodeId\":\"" + String(NODE_ID) + "\",\"status\":\"OK\",\"message\":\"" + messageText + "\"}";

  // Envía la respuesta por radio LoRa
  LoRa.beginPacket();
  LoRa.print(response);
  LoRa.endPacket();

  // Registra el ACK enviado en el serial para depuración
  Serial.println("[SLAVE] ACK sent: " + response);
}

/**
 * Inicia un ciclo de alimentación NO BLOQUEANTE.
 * El motor se encenderá/apagará automáticamente desde updateFeeding().
 *
 * @param shots      Número de disparos (activaciones del motor).
 * @param durationMs Duración de cada disparo en milisegundos.
 * @param intervalMs Espera entre disparos en milisegundos (0 = sin espera).
 */
void startFeeding(int shots, long durationMs, long intervalMs) {
  if (shots <= 0 || durationMs <= 0) {
    Serial.println("[SLAVE] Parámetros inválidos para alimentar.");
    return;
  }

  // Guarda los parámetros del ciclo
  shotsRemaining = shots;
  shotDurationMs = durationMs;
  shotIntervalMs = intervalMs;
  feedingActive = true;
  motorOn = false;          // El primer disparo se iniciará en updateFeeding()
  intervalUntilMs = 0;      // No esperar antes del primer disparo

  Serial.println("[SLAVE] Iniciando alimentación: " + String(shots) +
                 " disparo(s) de " + String(durationMs) + " ms, intervalo " +
                 String(intervalMs) + " ms");
}

/**
 * Autómata NO BLOQUEANTE que controla el motor del comedero (GPIO 2).
 * Debe llamarse en cada iteración de loop().
 *  - Enciende el motor durante shotDurationMs.
 *  - Espera shotIntervalMs entre disparos.
 *  - Repite hasta completar shotsRemaining.
 */
void updateFeeding() {
  if (!feedingActive) return;   // Si no hay ciclo activo, no hace nada

  unsigned long now = millis();

  if (motorOn) {
    // El motor está encendido: verificar si ya debe apagarse
    if (now >= motorUntilMs) {
      motorOn = false;
      digitalWrite(FEEDER_PIN, LOW);          // Apaga el motor
      Serial.println("[SLAVE] Motor OFF");
      shotsRemaining--;                        // Un disparo menos

      if (shotsRemaining > 0) {
        // Programa la espera del intervalo entre disparos
        intervalUntilMs = shotIntervalMs > 0 ? now + shotIntervalMs : now;
      } else {
        feedingActive = false;                 // Ciclo terminado
        Serial.println("[SLAVE] Ciclo de alimentación completado");
      }
    }
  } else {
    // Motor apagado: decidir si corresponde iniciar un nuevo disparo
    if (shotsRemaining > 0 && now >= intervalUntilMs) {
      motorOn = true;
      digitalWrite(FEEDER_PIN, HIGH);          // Enciende el motor
      Serial.println("[SLAVE] Motor ON durante " + String(shotDurationMs) + " ms");
      motorUntilMs = now + shotDurationMs;     // Programa el apagado
    }
  }
}

/**
 * Ejecuta el horario de alimentación recibido en un FEEDING_PROGRAM.
 * Busca el bloque del horario correspondiente a ESTE nodo (NODE_ID)
 * y lo ejecuta en el GPIO 2.
 *
 * Estructura esperada del mensaje:
 * { "type":"FEEDING_PROGRAM", "nodes":[ { "nodeId":"A1-F01",
 *     "schedule":[ { "start":"06:00","interval":30,"shots":4,"seconds":5 } ] } ] }
 *
 * @param msg Mensaje JSON completo recibido por LoRa.
 */
void parseAndRunProgram(String msg) {
  // 1) Verifica que el programa incluya este nodo
  String target = "\"nodeId\":\"" + String(NODE_ID) + "\"";
  int nodePos = msg.indexOf(target);
  if (nodePos < 0) {
    Serial.println("[SLAVE] El programa no es para este nodo (" + String(NODE_ID) + ")");
    return;
  }

  // 2) Localiza el arreglo "schedule" de este nodo
  int schedPos = msg.indexOf("\"schedule\":[", nodePos);
  if (schedPos < 0) {
    Serial.println("[SLAVE] No se encontró 'schedule' en el programa");
    return;
  }
  int schedEnd = msg.indexOf(']', schedPos);   // Fin del arreglo de horarios
  if (schedEnd < 0) return;

  // 3) Extrae el contenido del arreglo de horarios de este nodo
  String scheduleArray = msg.substring(schedPos, schedEnd + 1);

  // 4) Toma el primer bloque del horario
  //    (En un sistema productivo con reloj en tiempo real se validaría
  //    además el campo "start" para saber cuándo debe comenzar el bloque.)
  int blockStart = scheduleArray.indexOf('{');
  if (blockStart < 0) return;
  int blockEnd = scheduleArray.indexOf('}', blockStart);
  if (blockEnd < 0) return;
  String block = scheduleArray.substring(blockStart, blockEnd + 1);

  // 5) Extrae los valores del bloque
  int shots = (int)extractJsonFloat(block, "shots");
  int seconds = (int)extractJsonFloat(block, "seconds");
  int interval = (int)extractJsonFloat(block, "interval"); // en minutos

  Serial.println("[SLAVE] Bloque de horario: shots=" + String(shots) +
                 " seconds=" + String(seconds) + " interval(min)=" + String(interval));

  // 6) Ejecuta el bloque en el motor (pin 2)
  //    seconds -> milisegundos ; interval (min) -> milisegundos
  startFeeding(shots, seconds * 1000L, interval * 60L * 1000L);
}

/**
 * Bucle principal. Escucha continuamente la red LoRa en busca de
 * paquetes enviados por el nodo maestro, responde según el tipo de
 * comando recibido y mantiene el autómata de alimentación activo.
 */
void loop() {
  // Mantiene el control no bloqueante del motor (GPIO 2)
  updateFeeding();

  int packetSize = LoRa.parsePacket();   // Verifica si llegó un paquete LoRa
  if (packetSize) {
    String msg = "";
    while (LoRa.available()) {
      msg += (char)LoRa.read();          // Lee todos los bytes del paquete recibido
    }

    msg.trim();
    Serial.println("[SLAVE] Received: " + msg);

    // Extrae el tipo de comando y el ID de la petición del mensaje
    String type = extractJsonType(msg);
    String requestId = extractJsonValue(msg, "requestId");

    // Identifica a qué nodo va dirigido el mensaje (si trae el campo)
    String msgNodeId = extractJsonValue(msg, "nodeId");
    bool isForMe = (msgNodeId.length() == 0) || (msgNodeId == String(NODE_ID));

    // Comando PING: comprueba que el nodo sigue activo en la red
    if (type == "PING") {
      Serial.println("[SLAVE] Ping received");
      sendAck(requestId, "Ping accepted");
    }

    // Comando FEED_NOW: orden de alimentar inmediatamente
    if (type == "FEED_NOW" && isForMe) {
      Serial.println("[SLAVE] Feeding command received");

      // Calcula la duración del encendido del motor
      int durationSeconds = (int)extractJsonFloat(msg, "durationSeconds");
      if (durationSeconds <= 0) {
        // Si no se envió durationSeconds, se calcula con la cantidad de
        // gramos y la velocidad de dosificación: tiempo = gramos / (g/s)
        float amountGrams = extractJsonFloat(msg, "amountGrams");
        float gramsPerSecond = extractJsonFloat(msg, "gramsPerSecond");
        if (gramsPerSecond > 0) {
          durationSeconds = (int)(amountGrams / gramsPerSecond);
        }
      }

      // Confirma la recepción y ejecuta un único disparo con esa duración
      sendAck(requestId, "Feeding command accepted");
      startFeeding(1, durationSeconds * 1000L, 0);
    }

    // Comando SET_DIET: configuración de una nueva dieta
    if (type == "SET_DIET") {
      Serial.println("[SLAVE] Diet command received");
      sendAck(requestId, "Diet accepted");
    }

    // Comando FEEDING_PROGRAM: recepción de un programa de alimentación
    if (type == "FEEDING_PROGRAM") {
      Serial.println("[SLAVE] Feeding program received");
      // Si el programa incluye este nodo, confirmar y ejecutar el horario
      if (msg.indexOf("\"nodeId\":\"" + String(NODE_ID) + "\"") >= 0) {
        sendAck(requestId, "Program accepted");
        parseAndRunProgram(msg);
      } else {
        Serial.println("[SLAVE] Programa ignorado (no es para este nodo)");
      }
    }
  }
}

