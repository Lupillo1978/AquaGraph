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
 *    - CUMPLIR FIELMENTE la tabla de alimentación (bloques con
 *      horario de inicio) recibida en el FEEDING_PROGRAM.
 *    - Sincronizar su reloj con la hora actual que envía el
 *      Heltec (campo "currentTime") al hacer clic en "Enviar ración".
 *
 *
 *  Comandos soportados:
 *    - PING           : Verifica que el nodo está vivo.
 *    - FEED_NOW       : Dispara la alimentación de forma inmediata.
 *    - SET_DIET       : Configura una nueva dieta.
 *    - FEEDING_PROGRAM: Recibe un programa de alimentación, sincroniza
 *                       la hora con "currentTime" y programa cada bloque
 *                       del horario para ejecutarse en su hora exacta.
 * ============================================================
 */

#include <Arduino.h>   // Funciones básicas del framework Arduino/ESP32
#include <SPI.h>       // Comunicación SPI para el módulo SX1276
#include <LoRa.h>      // Librería para comunicación por radio LoRa
#include <Preferences.h> // Almacenamiento no volátil (NVS) para persistir la rutina

// ------------------------------------------------------------------
// PINOUT ESP32 DEVKIT V1 + módulo SX1276 (breakout LoRa)
// ------------------------------------------------------------------
const int LORA_SCK  = 18;  // GPIO18 -> SCK
const int LORA_MISO = 19;  // GPIO19 -> MISO
const int LORA_MOSI = 23;  // GPIO23 -> MOSI
const int LORA_SS   = 5;   // GPIO5  -> NSS/CS
const int LORA_RST  = 14;  // GPIO14 -> RST
const int LORA_DIO0 = 26;  // GPIO26 -> DIO0

// ------------------------------------------------------------------
// Identificador único de este nodo dentro de la red.
// DEBE coincidir con el campo "nodeId" del alimentador registrado en
// el sistema (server/storage/feeders.json) y con el nodeId que la
// interfaz usa al construir el programa. Ejemplo: "101", "102", etc.
// ------------------------------------------------------------------
const char* NODE_ID = "101";

// ------------------------------------------------------------------
// PIN DEL MOTOR / RELÉ DEL COMEDERO
// El trabajo físico de alimentación se realiza mediante el GPIO 2.
//  - HIGH: motor encendido (dosificando alimento)
//  - LOW : motor apagado
// ------------------------------------------------------------------
const int FEEDER_PIN = 2;

// ------------------------------------------------------------------
// TIRO DE PRUEBA AL ENCENDER
// Cada vez que el esclavo se enciende (después de estar apagado), se
// ejecuta un tiro de prueba de 5 segundos encendiendo el pin 2. Esto
// permite verificar que el alimentador funciona correctamente.
// ------------------------------------------------------------------
const long TEST_SHOT_DURATION_MS = 5000L;   // 5 segundos

// ------------------------------------------------------------------
// ZONA HORARIA del estanque (offset respecto a UTC en horas).
// El campo "currentTime" que envía el Heltec viene en UTC (formato
// ISO con 'Z'). Los horarios de la dieta ("20:00", "21:00", ...) son
// hora LOCAL. Ajusta este valor según la zona del estanque.
// Ejemplos: México (centro) = -6, Verano(México) = -5, España = +1, etc.
// ------------------------------------------------------------------
const long TIMEZONE_OFFSET_HOURS = -7;   // UTC-7 (Sinaloa, México). Ajusta según tu zona.
const long TIMEZONE_OFFSET_MS =
    TIMEZONE_OFFSET_HOURS * 3600L * 1000L;

// ------------------------------------------------------------------
// Variables para el control NO BLOQUEANTE del motor.
// ------------------------------------------------------------------
bool feedingActive = false;        // true mientras hay un ciclo de alimentación en curso
bool motorOn = false;              // true si el motor está encendido en este momento
unsigned long motorStartMs = 0;    // millis() cuando inició el disparo actual (para medir el intervalo desde el INICIO)
unsigned long motorUntilMs = 0;    // instante (millis) en que debe apagarse el motor
unsigned long intervalUntilMs = 0; // instante (millis) en que termina la espera entre disparos
int shotsRemaining = 0;            // número de disparos que faltan por ejecutar
long shotDurationMs = 0;           // duración de cada disparo en milisegundos
long shotIntervalMs = 0;           // intervalo entre disparos en milisegundos

// Objeto para almacenamiento no volátil (NVS). Persiste la rutina de alimentación
// para que el esclavo continúe trabajando tras pérdida de comunicación o corte de energía.
Preferences prefs;

// ------------------------------------------------------------------
// Reloj virtual sincronizado con "currentTime" que envía el Heltec.
// La ESP32 no tiene RTC, así que guardamos la base del epoch recibido
// y sumamos el tiempo transcurrido con millis().
// ------------------------------------------------------------------
unsigned long long epochBaseMs = 0;  // epoch (ms) recibido del Heltec
unsigned long millisBaseMs = 0;      // millis() en el momento de sincronizar

// ------------------------------------------------------------------
// Estructura para almacenar la tabla de alimentación (bloques).
// Cada bloque tiene su hora de inicio (HH:MM) y se dispara una vez
// por día a esa hora exacta.
// ------------------------------------------------------------------
#define MAX_SCHEDULE_BLOCKS 8
struct ScheduleBlock {
  bool active;          // true si el bloque está cargado
  int startHour;        // hora de inicio de la ventana (0-23)
  int startMin;         // minuto de inicio (0-59)
  int endHour;          // hora de fin de la ventana (0-23)
  int endMin;           // minuto de fin (0-59)
  int shots;            // número de disparos dentro de la ventana
  long durationMs;      // duración de cada disparo (ms)
  long intervalMs;      // intervalo entre disparos (ms)
  int totalShots;       // disparos TOTALES del bloque (para saber cuándo termina)
  int shotsDone;        // disparos ya ejecutados hoy
  long lastShotMinute;  // minuto (del día) del último disparo ejecutado
};
ScheduleBlock schedule[MAX_SCHEDULE_BLOCKS];
int scheduleCount = 0;          // número de bloques cargados
long lastProcessedDay = -1;     // día (epoch) del último procesamiento

//
// Reensamblado de mensajes fragmentados (formato "CH:<total>:<idx>:<data>").
// Usado como respaldo por si el maestro envía un payload > 1 frame LoRa.
//
#define MAX_FRAGMENTS 8
String fragParts[MAX_FRAGMENTS];
int fragTotal = -1;
String fragMsg = "";   // mensaje ya reensamblado pendiente de procesar

/**
 * Función auxiliar para extraer el valor de una clave en un mensaje JSON.
 * Solo funciona con valores de tipo string (entre comillas dobles).
 */
String extractJsonValue(String msg, String key) {
  String search = "\"" + key + "\":\"";
  int start = msg.indexOf(search);
  if (start < 0) return "";
  start += search.length();
  int end = msg.indexOf('"', start);
  if (end < 0) return "";
  return msg.substring(start, end);
}

/**
 * Función auxiliar que extrae el tipo de comando del mensaje JSON.
 */
String extractJsonType(String msg) {
  int start = msg.indexOf("\"type\":\"");
  if (start < 0) return "";
  start += 8;
  int end = msg.indexOf('"', start);
  if (end < 0) return "";
  return msg.substring(start, end);
}

/**
 * Función auxiliar para extraer un valor NUMÉRICO (entero o decimal)
 * de una clave JSON. A diferencia de extractJsonValue(), no espera
 * comillas alrededor del valor.
 */
float extractJsonFloat(String msg, String key) {
  String search = "\"" + key + "\":";
  int start = msg.indexOf(search);
  if (start < 0) return 0;
  start += search.length();
  int end = start;
  while (end < (int)msg.length() && (isdigit(msg[end]) || msg[end] == '.' || msg[end] == '-')) {
    end++;
  }
  String numStr = msg.substring(start, end);
  return numStr.toFloat();
}

/**
 * Extrae un valor NUMÉRICO ENTERO de 64 bits de una clave JSON.
 * A diferencia de extractJsonFloat(), no pierde precisión con los
 * epoch de 13 dígitos (milisegundos). Devuelve 0 si no se encuentra.
 */
unsigned long long extractJsonLongLong(String msg, String key) {
  String search = "\"" + key + "\":";
  int start = msg.indexOf(search);
  if (start < 0) return 0;
  start += search.length();
  int end = start;
  while (end < (int)msg.length() && isdigit(msg[end])) {
    end++;
  }
  String numStr = msg.substring(start, end);
  if (numStr.length() == 0) return 0;
  char buf[64];
  numStr.toCharArray(buf, sizeof(buf));
  return strtoull(buf, NULL, 10);
}

/**
 * Convierte una fecha a "días desde 1970-01-01" (algoritmo civil).
 * @param y Año (ej: 2026)
 * @param m Mes (1-12)
 * @param d Día (1-31)
 * @return  Número de días desde la época Unix.
 */
long daysFromCivil(long y, long m, long d) {
  y -= m <= 2;
  long era = (y >= 0 ? y : y - 399) / 400;
  unsigned long yoe = (unsigned long)(y - era * 400);
  unsigned long doy = (153L * (m + (m > 2 ? -3L : 9L)) + 2L) / 5L + d - 1;
  unsigned long doe = yoe * 365L + yoe / 4L - yoe / 100L + doy;
  return era * 146097L + (long)doe - 719468L;
}

/**
 * Convierte una marca de tiempo ISO 8601 (ej: "2026-08-05T03:51:10.825Z")
 * a epoch Unix en milisegundos (UTC).
 *
 * @param iso Cadena ISO 8601.
 * @return    Epoch en milisegundos (UTC), o 0 si no se puede parsear.
 */
unsigned long long parseIsoTimeToEpochMs(String iso) {
  if (iso.length() < 19) return 0;
  int y = iso.substring(0, 4).toInt();
  int m = iso.substring(5, 7).toInt();
  int d = iso.substring(8, 10).toInt();
  int hh = iso.substring(11, 13).toInt();
  int mm = iso.substring(14, 16).toInt();
  int ss = iso.substring(17, 19).toInt();

  long days = daysFromCivil(y, m, d);
  unsigned long long epoch =
      ((unsigned long long)days * 86400ULL +
       (unsigned long)hh * 3600ULL +
       (unsigned long)mm * 60ULL +
       (unsigned long)ss) * 1000ULL;
  return epoch;
}

/**
 * Obtiene el epoch actual (ms, UTC) sumando el tiempo transcurrido
 * desde la sincronización (millis()).
 */
unsigned long long currentEpochMs() {
  return epochBaseMs + (millis() - millisBaseMs);
}

/**
 * Obtiene el epoch local (ms) sumando el offset de zona horaria.
 */
unsigned long long currentLocalEpochMs() {
  return currentEpochMs() + TIMEZONE_OFFSET_MS;
}

/**
 * Obtiene la hora local actual (HH:MM:SS) a partir del reloj sincronizado.
 *
 * @param hour Salida: hora (0-23)
 * @param min  Salida: minuto (0-59)
 * @param sec  Salida: segundo (0-59)
 */
void getLocalClock(int &hour, int &min, int &sec) {
  unsigned long long secs = currentLocalEpochMs() / 1000ULL;
  hour = (int)((secs / 3600ULL) % 24ULL);
  min  = (int)((secs / 60ULL) % 60ULL);
  sec  = (int)(secs % 60ULL);
}

/**
 * Obtiene el número de día local (días desde la época Unix) usando la
 * hora local. Se usa para detectar el cambio de día y restablecer los
 * disparos pendientes de los bloques.
 */
long getLocalDay() {
  return (long)(currentLocalEpochMs() / 86400000ULL);
}

/**
 * Sincroniza el reloj virtual del nodo con la hora que envía el Heltec.
 *
 * @param isoTime Marca ISO 8601 ("currentTime") recibida en el programa.
 */
void syncClock(String isoTime) {
  unsigned long long parsed = parseIsoTimeToEpochMs(isoTime);
  if (parsed == 0) {
    Serial.println("[SLAVE] currentTime inválido, no se pudo sincronizar el reloj.");
    return;
  }
  epochBaseMs = parsed;
  millisBaseMs = millis();

  int hh, mm, ss;
  getLocalClock(hh, mm, ss);
  char hhBuff[3], mmBuff[3], ssBuff[3];
  sprintf(hhBuff, "%02d", hh);
  sprintf(mmBuff, "%02d", mm);
  sprintf(ssBuff, "%02d", ss);
Serial.println("[SLAVE] Reloj sincronizado. Hora local: " +
                 String(hhBuff) + ":" + String(mmBuff) + ":" + String(ssBuff) +
                 " (UTC" + String(TIMEZONE_OFFSET_HOURS) + ")");
  saveClock();  // Persiste la base del reloj en NVS
}

// ------------------------------------------------------------------
// PERSISTENCIA DE LA RUTINA EN NVS (Preferences)
// ------------------------------------------------------------------
// El esclavo guarda la tabla de alimentación y la base del reloj en
// memoria no volátil. Así, aunque se pierda la comunicación con el
// maestro o haya un corte de energía, al volver a encender el nodo
// continúa trabajando con la misma rutina hasta recibir una nueva.
// ------------------------------------------------------------------

/**
 * Guarda la rutina de alimentación actual en el NVS.
 */
void saveSchedule() {
  prefs.begin("feeding", false);
  prefs.putInt("count", scheduleCount);
  prefs.putLong("lastDay", lastProcessedDay);
for (int i = 0; i < MAX_SCHEDULE_BLOCKS; i++) {
    String base = "b" + String(i) + "_";
    prefs.putBool((base + "active").c_str(), schedule[i].active);
    prefs.putInt((base + "sh").c_str(), schedule[i].startHour);
    prefs.putInt((base + "sm").c_str(), schedule[i].startMin);
    prefs.putInt((base + "eh").c_str(), schedule[i].endHour);
    prefs.putInt((base + "em").c_str(), schedule[i].endMin);
    prefs.putInt((base + "tshots").c_str(), schedule[i].totalShots);
    prefs.putInt((base + "sdone").c_str(), schedule[i].shotsDone);
    prefs.putLong((base + "lshot").c_str(), schedule[i].lastShotMinute);
    prefs.putLong((base + "dur").c_str(), schedule[i].durationMs);
    prefs.putLong((base + "int").c_str(), schedule[i].intervalMs);
    prefs.putInt((base + "shots").c_str(), schedule[i].shots);
  }
  prefs.end();
  Serial.println("[SLAVE] Rutina de alimentación guardada en NVS.");
}

/**
 * Carga la rutina de alimentación guardada en el NVS (si existe).
 * @return true si se cargó una rutina previa, false si no había.
 */
bool loadSchedule() {
  prefs.begin("feeding", true);
  int count = prefs.getInt("count", -1);
  if (count > 0 && count <= MAX_SCHEDULE_BLOCKS) {
    scheduleCount = count;
    lastProcessedDay = prefs.getLong("lastDay", -1);
    for (int i = 0; i < MAX_SCHEDULE_BLOCKS; i++) {
      String base = "b" + String(i) + "_";
      schedule[i].active = prefs.getBool((base + "active").c_str(), false);
      schedule[i].startHour = prefs.getInt((base + "sh").c_str(), 0);
      schedule[i].startMin = prefs.getInt((base + "sm").c_str(), 0);
      schedule[i].endHour = prefs.getInt((base + "eh").c_str(), 0);
      schedule[i].endMin = prefs.getInt((base + "em").c_str(), 0);
      schedule[i].totalShots = prefs.getInt((base + "tshots").c_str(), 0);
      schedule[i].shotsDone = prefs.getInt((base + "sdone").c_str(), 0);
      schedule[i].lastShotMinute = prefs.getLong((base + "lshot").c_str(), -1);
      schedule[i].durationMs = prefs.getLong((base + "dur").c_str(), 0);
      schedule[i].intervalMs = prefs.getLong((base + "int").c_str(), 0);
      schedule[i].shots = prefs.getInt((base + "shots").c_str(), 0);
    }
    prefs.end();
    Serial.println("[SLAVE] Rutina de alimentación restaurada desde NVS: " +
                   String(scheduleCount) + " bloque(s).");
    return true;
  }
  prefs.end();
  return false;
}

/**
 * Guarda la base del reloj (epoch) en el NVS para que el reloj virtual
 * sobreviva a un reinicio lo mejor posible.
 */
void saveClock() {
  prefs.begin("clock", false);
  prefs.putULong64("epochBase", epochBaseMs);
  prefs.end();
}

/**
 * Carga la base del reloj guardada en el NVS.
 */
void loadClock() {
  prefs.begin("clock", true);
  unsigned long long saved = prefs.getULong64("epochBase", 0);
  prefs.end();
  if (saved > 0) {
    epochBaseMs = saved;
    millisBaseMs = millis();
    Serial.println("[SLAVE] Reloj restaurado desde NVS.");
  }
}

/**
 * Configuración inicial del nodo esclavo.
 */
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("[SLAVE] Starting...");

// Configura el GPIO 2 como salida y lo deja APAGADO (LOW).
  pinMode(FEEDER_PIN, OUTPUT);
  digitalWrite(FEEDER_PIN, LOW);

  // Restaura la rutina de alimentación y el reloj desde NVS (si existen),
  // para que el esclavo continúe trabajando tras un corte de energía.
  loadClock();
  if (!loadSchedule()) {
    // Si no hay rutina guardada, inicializa la tabla vacía.
    for (int i = 0; i < MAX_SCHEDULE_BLOCKS; i++) {
      schedule[i].active = false;
      schedule[i].shotsDone = 0;
      schedule[i].lastShotMinute = -1;
    }
    scheduleCount = 0;
  }

  // >>> CLAVE: Configurar SPI y pines del SX1276 ANTES de LoRa.begin() <<<
  SPI.begin(LORA_SCK, LORA_MISO, LORA_MOSI, LORA_SS);
  LoRa.setPins(LORA_SS, LORA_RST, LORA_DIO0);

  if (!LoRa.begin(915E6)) {
    Serial.println("[SLAVE] LoRa init failed");
    Serial.println("[SLAVE] Verifica cableado SPI y pines (SCK, MISO, MOSI, NSS, RST, DIO0).");
    while (1) {}
  }

  LoRa.setSyncWord(0x12);
  LoRa.setSpreadingFactor(7);
  LoRa.setSignalBandwidth(125E3);
  LoRa.setCodingRate4(5);
  Serial.println("[SLAVE] LoRa ready");

  // >>> TIRO DE PRUEBA AL ENCENDER <<<
  // Arranca un ciclo de alimentación de 5 segundos como prueba de que el
  // alimentador funciona. Se ejecuta UNA vez en cada arranque (power-on)
  // y no requiere horarios ni orden de la red. El autómata updateFeeding()
  // en el loop() enciende el pin 2, mantiene los 5 segundos y lo apaga.
  Serial.println("[SLAVE] Tiro de prueba al encender: Motor ON por " +
                 String(TEST_SHOT_DURATION_MS) + " ms");
  startFeeding(1, TEST_SHOT_DURATION_MS, 0);
}

/**
 * Envía un mensaje de confirmación (ACK) al nodo maestro.
 */
void sendAck(String requestId, String messageText) {
  String response = "{\"type\":\"ACK\",\"requestId\":\"" + requestId +
                    "\",\"nodeId\":\"" + String(NODE_ID) +
                    "\",\"status\":\"OK\",\"message\":\"" + messageText + "\"}";

  LoRa.beginPacket();
  LoRa.print(response);
  LoRa.endPacket();

  Serial.println("[SLAVE] ACK sent: " + response);
}

/**
 * Inicia un ciclo de alimentación NO BLOQUEANTE.
 */
void startFeeding(int shots, long durationMs, long intervalMs) {
  if (shots <= 0 || durationMs <= 0) {
    Serial.println("[SLAVE] Parámetros inválidos para alimentar.");
    return;
  }

  shotsRemaining = shots;
  shotDurationMs = durationMs;
  shotIntervalMs = intervalMs;
  feedingActive = true;
  motorOn = false;
  intervalUntilMs = 0;

  Serial.println("[SLAVE] Iniciando alimentación: " + String(shots) +
                 " disparo(s) de " + String(durationMs) + " ms, intervalo " +
                 String(intervalMs) + " ms");
}

/**
 * Autómata NO BLOQUEANTE que controla el motor del comedero (GPIO 2).
 *
 * El INTERVALO se mide desde el INICIO de cada disparo. Es decir, si un
 * disparo arranca a las 15:00:00 con duración X e intervalo de 10 min,
 * el siguiente disparo arranca exactamente a las 15:10:00, y el siguiente
 * a las 15:20:00, y así sucesivamente. La duración del pin2 (trabajo del
 * motor) queda "dentro" del intervalo.
 */
void updateFeeding() {
  if (!feedingActive) return;

  unsigned long now = millis();

  if (motorOn) {
    if (now >= motorUntilMs) {
      motorOn = false;
      digitalWrite(FEEDER_PIN, LOW);
      Serial.println("[SLAVE] Motor OFF");
      shotsRemaining--;

      if (shotsRemaining > 0) {
        // El siguiente disparo se programa a partir del INICIO del disparo
        // actual (motorStartMs) + shotIntervalMs. Así queda dentro del
        // intervalo completo (p.ej. 15:10, 15:20, ...).
        if (shotIntervalMs > 0) {
          intervalUntilMs = motorStartMs + shotIntervalMs;
        } else {
          intervalUntilMs = now; // sin intervalo: disparos seguidos
        }
      } else {
        feedingActive = false;
        Serial.println("[SLAVE] Ciclo de alimentación completado");
      }
    }
  } else {
    if (shotsRemaining > 0 && now >= intervalUntilMs) {
      motorOn = true;
      motorStartMs = now; // registrar el inicio del disparo
      digitalWrite(FEEDER_PIN, HIGH);
      Serial.println("[SLAVE] Motor ON durante " + String(shotDurationMs) + " ms");
      motorUntilMs = now + shotDurationMs;
    }
  }
}

/**
 * Procesa un programa de alimentación en formato compacto:
 *   { "t":"FP", "n":"101", "e":1785904460, "z":-6, "rs":[[20,0,12,41,10],[21,0,12,41,10]] }
 *
 *  - t: tipo (FP = Feeding Program)
 *  - n: nodeId
 *  - e: epoch ms (currentTime) para sincronizar el reloj
 *  - z: offset de zona horaria en horas (opcional)
 *  - rs: bloques [HH, MM, shots, seconds, interval]
 *        interval: minutos de espera entre disparos (opcional, 0 = sin espera)
 *
 * @param msg Mensaje JSON compacto recibido por LoRa.
 */
void parseCompactProgram(String msg) {
// 1) Sincroniza el reloj con el epoch "e".
  //    Se usa extractJsonLongLong() (64 bits) para no perder precisión con
  //    epoch de 13 dígitos (ms). Un float de 32 bits desviaría el reloj.
  unsigned long long epoch = extractJsonLongLong(msg, "e");
  if (epoch > 0) {
    epochBaseMs = epoch;
    millisBaseMs = millis();
    int hh, mm, ss;
    getLocalClock(hh, mm, ss);
    char hhBuff[3], mmBuff[3], ssBuff[3];
    sprintf(hhBuff, "%02d", hh);
    sprintf(mmBuff, "%02d", mm);
    sprintf(ssBuff, "%02d", ss);
    Serial.println("[SLAVE] Reloj sincronizado (compacto). Hora local: " +
                   String(hhBuff) + ":" + String(mmBuff) + ":" + String(ssBuff));
  } else {
    Serial.println("[SLAVE] Sin 'e' en el programa compacto; no se sincronizó el reloj.");
  }

  // 2) Verifica que el programa incluya este nodo.
  String n = extractJsonValue(msg, "n");
  if (n != String(NODE_ID)) {
    Serial.println("[SLAVE] El programa no es para este nodo (" + String(NODE_ID) + ")");
    return;
  }

// 3) Localiza el arreglo "rs" de bloques.
  //    El patrón "\"rs\":[" ocupa 6 caracteres: " r s " : [
  //    indexOf devuelve la posición de la primera comilla (")
  //    Por lo tanto schedPos + 6 apunta al PRIMER "[" del primer bloque
  //    [9,0,12,3,10], saltando el "[" de apertura de "rs".
  int schedPos = msg.indexOf("\"rs\":[");
  if (schedPos < 0) {
    Serial.println("[SLAVE] No se encontró 'rs' en el programa compacto");
    return;
  }
  // El arreglo real termina en el último ']' del mensaje.
  int schedEnd = msg.lastIndexOf(']');
  if (schedEnd < 0) return;

  // substring(schedPos+6, schedEnd) => "[9,0,12,3,10],[11,0,12,4,10],..."
  // (sin el "[" de apertura de rs y sin el "]" final del mensaje)
  String scheduleArray = msg.substring(schedPos + 6, schedEnd);
  scheduleArray.trim();

  // 4) Limpia la tabla de horarios anterior.
  for (int i = 0; i < MAX_SCHEDULE_BLOCKS; i++) {
    schedule[i].active = false;
    schedule[i].shots = 0;
    schedule[i].durationMs = 0;
    schedule[i].intervalMs = 0;
  }
  scheduleCount = 0;

  // 5) Recorre TODOS los bloques [HH,MM,shots,seconds,interval].
  int pos = 0;
  while (scheduleCount < MAX_SCHEDULE_BLOCKS) {
    int blockStart = scheduleArray.indexOf('[', pos);
    if (blockStart < 0) break;
    int blockEnd = scheduleArray.indexOf(']', blockStart);
    if (blockEnd < 0) break;
    String block = scheduleArray.substring(blockStart + 1, blockEnd);
    block.trim();

    // Extrae los 5 valores separados por coma:
    // [HH, MM, shots, seconds, interval(min)]
    int v[5] = {0, 0, 0, 0, 0};
    int vidx = 0;
    int i = 0;
    while (i < (int)block.length() && vidx < 5) {
      while (i < (int)block.length() && (block[i] == ' ' || block[i] == ',')) i++;
      int start = i;
      while (i < (int)block.length() && block[i] != ',') i++;
      String token = block.substring(start, i);
      token.trim();
      v[vidx++] = (int)token.toFloat(); // soporta decimales (seconds)
      if (i < (int)block.length()) i++;
    }

    int startHour = v[0];
    int startMin = v[1];
    int shots = v[2];
    int seconds = v[3];    // puede traer decimales; toFloat lo redondea
    int intervalMin = v[4]; // intervalo en minutos (0 = sin espera)

    // 6) Guarda el bloque en la tabla y calcula la ventana [start, end].
    //    La ventana empieza en "start" y, con interval entre disparos, cubre
    //    "shots" disparos. Fin = start + (shots * interval) en minutos.
    schedule[scheduleCount].active = true;
    schedule[scheduleCount].startHour = startHour;
    schedule[scheduleCount].startMin = startMin;
    schedule[scheduleCount].totalShots = shots;
    schedule[scheduleCount].shotsDone = 0;
    schedule[scheduleCount].lastShotMinute = -1;
    schedule[scheduleCount].durationMs = (long)seconds * 1000L;
    schedule[scheduleCount].intervalMs = (long)intervalMin * 60L * 1000L;
    schedule[scheduleCount].shots = 1;  // 1 disparo por instante programado

    // Calcula hora de fin: start + (totalShots * interval) minutos.
    long startTotalMin = (long)startHour * 60L + startMin;
    long endTotalMin = startTotalMin + ((long)shots * (intervalMin > 0 ? intervalMin : 1));
    schedule[scheduleCount].endHour = (int)((endTotalMin / 60L) % 24L);
    schedule[scheduleCount].endMin = (int)(endTotalMin % 60L);
    scheduleCount++;

    char buff1[10], buff2[10];
    sprintf(buff1, "%02d:%02d", startHour, startMin);
    sprintf(buff2, "%02d:%02d", schedule[scheduleCount - 1].endHour,
            schedule[scheduleCount - 1].endMin);
    Serial.println("[SLAVE] Bloque cargado (compacto): start=" + String(buff1) +
                   " end=" + String(buff2) +
                   " shots=" + String(shots) +
                   " seconds=" + String(seconds) +
                   " interval(min)=" + String(intervalMin));

    pos = blockEnd + 1;
  }

Serial.println("[SLAVE] Tabla de alimentación cargada: " + String(scheduleCount) + " bloque(s).");
  lastProcessedDay = -1;  // Fuerza a restablecer los disparos en la próxima iteración
  saveClock();   // Guarda la base del reloj sincronizada en NVS
  saveSchedule(); // Guarda la nueva rutina en NVS para sobrevivir a cortes de energía
}

/**
 * Procesa un programa de alimentación (FEEDING_PROGRAM) LEGACY:
 * Mantiene compatibilidad con el formato anterior por si acaso.
 *
 * @param msg Mensaje JSON completo recibido por LoRa.
 */
void parseAndRunProgram(String msg) {
  String type = extractJsonType(msg);

  // Formato compacto.
  if (type == "FP") {
    parseCompactProgram(msg);
    return;
  }

  // Formato legacy.
  // 1) Sincroniza el reloj con la hora que envió el Heltec.
  String ct = extractJsonValue(msg, "currentTime");
  if (ct.length() > 0) {
    syncClock(ct);
  } else {
    Serial.println("[SLAVE] Sin 'currentTime' en el programa; no se sincronizó el reloj.");
  }

  // 2) Verifica que el programa incluya este nodo.
  String target = "\"nodeId\":\"" + String(NODE_ID) + "\"";
  int nodePos = msg.indexOf(target);
  if (nodePos < 0) {
    Serial.println("[SLAVE] El programa no es para este nodo (" + String(NODE_ID) + ")");
    return;
  }

  // 3) Localiza el arreglo "schedule" de este nodo.
  int schedPos = msg.indexOf("\"schedule\":[", nodePos);
  if (schedPos < 0) {
    Serial.println("[SLAVE] No se encontró 'schedule' en el programa");
    return;
  }
  int schedEnd = msg.indexOf(']', schedPos);
  if (schedEnd < 0) return;

  String scheduleArray = msg.substring(schedPos, schedEnd + 1);

  // 4) Limpia la tabla de horarios anterior.
  for (int i = 0; i < MAX_SCHEDULE_BLOCKS; i++) {
    schedule[i].active = false;
    schedule[i].shots = 0;
    schedule[i].durationMs = 0;
    schedule[i].intervalMs = 0;
  }
  scheduleCount = 0;

  // 5) Recorre TODOS los bloques del arreglo de horarios.
  int pos = 0;
  while (scheduleCount < MAX_SCHEDULE_BLOCKS) {
    int blockStart = scheduleArray.indexOf('{', pos);
    if (blockStart < 0) break;
    int blockEnd = scheduleArray.indexOf('}', blockStart);
    if (blockEnd < 0) break;
    String block = scheduleArray.substring(blockStart, blockEnd + 1);

    // 6) Extrae los valores del bloque.
    int shots = (int)extractJsonFloat(block, "shots");
    int seconds = (int)extractJsonFloat(block, "seconds");
    int interval = (int)extractJsonFloat(block, "interval"); // en minutos
    String startTime = extractJsonValue(block, "start");

    // 7) Parsea la hora de inicio "HH:MM".
    int startHour = 0, startMin = 0;
    int colon = startTime.indexOf(':');
    if (colon > 0) {
      startHour = startTime.substring(0, colon).toInt();
      startMin = startTime.substring(colon + 1).toInt();
    }

    // 8) Guarda el bloque en la tabla y calcula la ventana [start, end].
    schedule[scheduleCount].active = true;
    schedule[scheduleCount].startHour = startHour;
    schedule[scheduleCount].startMin = startMin;
    schedule[scheduleCount].totalShots = shots;
    schedule[scheduleCount].shotsDone = 0;
    schedule[scheduleCount].lastShotMinute = -1;
    schedule[scheduleCount].durationMs = (long)seconds * 1000L;
    schedule[scheduleCount].intervalMs = (long)interval * 60L * 1000L;
    schedule[scheduleCount].shots = 1;  // 1 disparo por instante programado

    long startTotalMin = (long)startHour * 60L + startMin;
    long endTotalMin = startTotalMin + ((long)shots * (interval > 0 ? interval : 1));
    schedule[scheduleCount].endHour = (int)((endTotalMin / 60L) % 24L);
    schedule[scheduleCount].endMin = (int)(endTotalMin % 60L);
    scheduleCount++;

    char buff[10];
    sprintf(buff, "%02d:%02d", startHour, startMin);
    Serial.println("[SLAVE] Bloque cargado: start=" + String(buff) +
                   " shots=" + String(shots) +
                   " seconds=" + String(seconds) +
                   " interval(min)=" + String(interval));

    pos = blockEnd + 1;
  }

  Serial.println("[SLAVE] Tabla de alimentación cargada: " + String(scheduleCount) + " bloque(s).");
  lastProcessedDay = -1;  // Fuerza a restablecer los disparos en la próxima iteración
  saveClock();
  saveSchedule();
}

/**
 * Verifica la tabla de alimentación y ejecuta UN disparo en cada instante
 * programado dentro de la ventana del bloque [start, end].
 *
 * Cada bloque define una VENTANA de horas (ej. 09:00 → fin calculado) en la
 * que el alimentador trabaja en intervalos regulares (p.ej. cada 5 minutos):
 * 09:00, 09:05, 09:10, ... hasta completar totalShots. En cada instante que
 * corresponde, se enciende el motor durante durationMs.
 *
 * Se llama en cada loop().
 */
void updateSchedule() {
  if (scheduleCount == 0) return;

  // Detecta el cambio de día para restablecer los contadores de disparos.
  long day = getLocalDay();
  if (day != lastProcessedDay) {
    lastProcessedDay = day;
    for (int i = 0; i < scheduleCount; i++) {
      schedule[i].shotsDone = 0;
      schedule[i].lastShotMinute = -1;
    }
  }

  int hour, min, sec;
  getLocalClock(hour, min, sec);
  long currentMinuteOfDay = (long)hour * 60L + min;

  for (int i = 0; i < scheduleCount; i++) {
    ScheduleBlock &b = schedule[i];
    if (!b.active) continue;
    if (b.durationMs <= 0) continue;
    if (b.totalShots <= 0) continue;
    if (b.intervalMs <= 0) continue;  // sin intervalo, no se puede programar en ventana

    long startMinuteOfDay = (long)b.startHour * 60L + b.startMin;
    int intervalMin = (int)(b.intervalMs / 60000L);

    // Si ya se completaron todos los disparos del día, terminó.
    if (b.shotsDone >= b.totalShots) continue;

    // Calcula el índice del disparo correspondiente al minuto actual.
    long elapsed = currentMinuteOfDay - startMinuteOfDay;
    if (elapsed < 0) continue;  // el bloque aún no ha empezado

    // Solo dispara exactamente en los instantes múltiplos del intervalo.
    long shotIndex = elapsed / intervalMin;
    if (elapsed % intervalMin != 0) continue;    // no es un instante de disparo
    if (shotIndex >= b.totalShots) continue;      // fuera de la ventana

    // Evita disparar dos veces el mismo instante.
    if (shotIndex == b.lastShotMinute) continue;

    Serial.println("[SLAVE] Disparo programado #" + String(shotIndex + 1) +
                   "/" + String(b.totalShots) + " dentro de la ventana");
    startFeeding(1, b.durationMs, 0);  // 1 disparo por instante
    b.lastShotMinute = shotIndex;
    b.shotsDone++;
    saveSchedule(); // Persiste el progreso en NVS
  }
}

/**
 * Bucle principal.
 */
void loop() {
  // Mantiene el control no bloqueante del motor (GPIO 2).
  updateFeeding();

  // Verifica y ejecuta los bloques de la tabla de alimentación.
  updateSchedule();

  // Si hay un mensaje ya reensamblado, procésalo.
  if (fragMsg.length() > 0) {
    String toProcess = fragMsg;
    fragMsg = "";
    Serial.println("[SLAVE] Procesando mensaje reensamblado: " + toProcess);
    handleCommand(toProcess);
  }

  int packetSize = LoRa.parsePacket();
  if (packetSize) {
    String msg = "";
    while (LoRa.available()) {
      msg += (char)LoRa.read();
    }

msg.trim();
    Serial.println("[SLAVE] Received: " + msg);

    // ---- Reensamblado de fragmentos (formato "CH:<total>:<idx>:<data>") ----
    if (msg.startsWith("CH:")) {
      int c1 = msg.indexOf(':', 3);
      int c2 = msg.indexOf(':', c1 + 1);
      if (c1 > 0 && c2 > 0) {
        int total = msg.substring(3, c1).toInt();
        int idx = msg.substring(c1 + 1, c2).toInt();
        String data = msg.substring(c2 + 1);

        if (total > 0 && total <= MAX_FRAGMENTS && idx >= 0 && idx < total) {
          if (fragTotal != total) {
            for (int i = 0; i < MAX_FRAGMENTS; i++) fragParts[i] = "";
            fragTotal = total;
          }
          fragParts[idx] = data;

          int received = 0;
          for (int i = 0; i < total; i++) if (fragParts[i].length() > 0) received++;
          if (received == total) {
            fragMsg = "";
            for (int i = 0; i < total; i++) fragMsg += fragParts[i];
            fragTotal = -1;
            Serial.println("[SLAVE] Fragmentos reensamblados: " + fragMsg);
          }
        }
      }
return;  // los fragmentos no se procesan directamente
    }

    handleCommand(msg);
  }
}

/**
 * Despacha un comando recibido (mensaje completo, ya sea directo o
 * reensamblado). Soporta los formatos legacy y compacto.
 *
 * @param msg Mensaje JSON completo.
 */
void handleCommand(String msg) {
  String type = extractJsonType(msg);

  // Formato compacto usa "t":"FP" en lugar de "type":"FEEDING_PROGRAM".
  if (type.length() == 0 && msg.indexOf("\"t\":\"") >= 0) {
    type = extractJsonValue(msg, "t");
  }

  // Formato compacto usa "r"; legacy usa "requestId".
  String requestId = extractJsonValue(msg, "r");
  if (requestId.length() == 0) requestId = extractJsonValue(msg, "requestId");
  String msgNodeId = extractJsonValue(msg, "n");
  if (msgNodeId.length() == 0) msgNodeId = extractJsonValue(msg, "nodeId");
  bool isForMe = (msgNodeId.length() == 0) || (msgNodeId == String(NODE_ID));

  // Comando PING.
  if (type == "PING") {
    Serial.println("[SLAVE] Ping received");
    sendAck(requestId, "Ping accepted");
  }

  // Comando FEED_NOW: orden de alimentar inmediatamente.
  if (type == "FEED_NOW" && isForMe) {
    Serial.println("[SLAVE] Feeding command received");

    int durationSeconds = (int)extractJsonFloat(msg, "durationSeconds");
    if (durationSeconds <= 0) {
      float amountGrams = extractJsonFloat(msg, "amountGrams");
      float gramsPerSecond = extractJsonFloat(msg, "gramsPerSecond");
      if (gramsPerSecond > 0) {
        durationSeconds = (int)(amountGrams / gramsPerSecond);
      }
    }

    sendAck(requestId, "Feeding command accepted");
    startFeeding(1, durationSeconds * 1000L, 0);
  }

  // Comando SET_DIET.
  if (type == "SET_DIET") {
    Serial.println("[SLAVE] Diet command received");
    sendAck(requestId, "Diet accepted");
  }

  // Comando FEEDING_PROGRAM (legacy).
  if (type == "FEEDING_PROGRAM") {
    Serial.println("[SLAVE] Feeding program received");
    if (msg.indexOf("\"nodeId\":\"" + String(NODE_ID) + "\"") >= 0) {
      sendAck(requestId, "Program accepted");
      parseAndRunProgram(msg);
    } else {
      Serial.println("[SLAVE] Programa ignorado (no es para este nodo)");
    }
  }

  // Comando FEEDING_PROGRAM (formato compacto "t":"FP").
  if (type == "FP" && isForMe) {
    Serial.println("[SLAVE] Feeding program (compacto) received");
    sendAck(requestId, "Program accepted");
    parseCompactProgram(msg);
  }
}
