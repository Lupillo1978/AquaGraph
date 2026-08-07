/**
 * ============================================================
 *  HELTEC_PROTOCOL - Construcción de payloads para la red LoRa
 * ============================================================
 *  Este módulo construye los mensajes JSON que se envían al Heltec
 *  (nodo maestro) por el puerto serial y que este reenvía por LoRa
 *  a los nodos esclavos.
 *
 *  PROBLEMA RESUELTO:
 *  El SX1276 LoRa tiene un FIFO de 256 bytes y un payload máximo de
 *  ~222 bytes (SF7/BW125/CR4/5). Un FEEDING_PROGRAM con todos los
 *  nodos pesa >1200 bytes, por lo que se truncaba: el esclavo recibía
 *  "nodeId" y "currentTime", pero NO el arreglo "schedule", por lo que
 *  aceptaba (ACK) sin cargar horarios.
 *
 *  SOLUCIÓN:
 *  Se envía UN NODO POR PAQUETE con un formato JSON compacto:
 *    { "t":"FP", "n":"101", "e":1785904460, "rs":[[20,0,12,41],[21,0,12,41]] }
 *  - t : tipo (FP = Feeding Program)
 *  - n : nodeId
 *  - e : epoch en ms (currentTime) para sincronizar el reloj del esclavo
 *  - rs: bloques [HH, MM, shots, seconds]
 *
 *  Cada paquete cabe en un único frame LoRa sin truncamiento.
 *
 *  Se mantienen las funciones originales (buildHeltecEnvelope,
 *  buildHeltecPayload) para compatibilidad/tests.
 * ============================================================
 */

/**
 * Construye el payload compacto de programa de alimentación para UN nodo.
 *
 * @param {Object} nodeEntry  Entrada del nodo: { nodeId, schedule:[{start,interval,shots,seconds}] }
 * @param {string} requestId  Identificador de la solicitud.
 * @param {string} currentIso Marca ISO 8601 para sincronizar el reloj del esclavo.
 * @param {number} tzOffsetHours Offset de zona horaria local (ej: -6 para México centro).
 * @return {string} JSON compacto.
 */
function buildCompactNodeProgram(nodeEntry, requestId, currentIso, tzOffsetHours) {
  const epochMs = Date.parse(currentIso || new Date().toISOString());

  // Cada bloque se envía como [HH, MM, shots, seconds, interval]
  // interval es el tiempo en MINUTOS que debe esperarse entre disparos.
  // El esclavo lo usa para espaciar el ciclo de disparos de ese bloque.
const blocks = (nodeEntry.schedule || []).map(b => [
    parseHour(b.start),
    parseMinute(b.start),
    b.shots || 0,
    // Se redondea a entero para reducir el tamaño del payload y que cada
    // nodo quepa en UN SOLO frame LoRa (evita fragmentación y colisiones).
    Math.round(b.seconds || 0),
    b.interval || 0
  ]);

  return {
    t: 'FP',
    n: nodeEntry.nodeId,
    r: requestId,
    // Se envía el epoch en UTC puro (sin sumar el offset). El esclavo aplica
    // su propia constante TIMEZONE_OFFSET_HOURS para obtener la hora local.
    e: epochMs,
    z: tzOffsetHours || 0,
    rs: blocks
  };
}

/**
 * Una entrada de programa puede tener schedule con start "HH:MM".
 * Se extrae la hora.
 */
function parseHour(start) {
  if (!start) return 0;
  const idx = start.indexOf(':');
  return idx > 0 ? parseInt(start.substring(0, idx), 10) : 0;
}

function parseMinute(start) {
  if (!start) return 0;
  const idx = start.indexOf(':');
  return idx > 0 ? parseInt(start.substring(idx + 1), 10) : 0;
}

/**
 * Construye el payload JSON (string) compacto para UN nodo.
 */
function buildCompactNodePayload(nodeEntry, requestId, currentIso, tzOffsetHours) {
  return JSON.stringify(buildCompactNodeProgram(nodeEntry, requestId, currentIso, tzOffsetHours));
}

/**
 * Construye un array de payloads compactos, uno por cada nodo del
 * programa. El maestro los envía uno por uno (cada uno cabe en un
 * único frame LoRa).
 *
 * @param {Object} program Programa de alimentación con executionProgram.
 * @return {string[]} Array de JSON compactos.
 */
function buildFeedingProgramEnvelope(program) {
  const requestId = program.requestId || `req-${Date.now()}`;
  const currentIso = program.currentTime || new Date().toISOString();
  const tz = program.timezoneOffsetHours;

  const nodes = (program.executionProgram || []).map(nodeEntry =>
    JSON.stringify(buildCompactNodeProgram(nodeEntry, requestId, currentIso, tz))
  );

  return nodes;
}

/**
 * Construye el payload (objeto) JSON compacto de ACK.
 */
function buildCompactAckPayload(requestId, nodeId, status, message = '') {
  return buildAckPayload(requestId, nodeId, status, message);
}

/**
 * Construye el ACK envelope (objeto). Se mantiene para compatibilidad.
 */
function buildCompactAckEnvelope(requestId, nodeId, status, message = '') {
  return buildAckEnvelope(requestId, nodeId, status, message);
}

// ---------------------------------------------------------------------
// FUNCIONES ORIGINALES (compatibilidad / tests)
// ---------------------------------------------------------------------

function buildHeltecEnvelope(program) {
  return {
    type: 'FEEDING_PROGRAM',
    pondId: program.pondId,
    dietId: program.dietId,
    dailyFoodKg: program.dailyFoodKg,
    gramsPerSecond: program.gramsPerSecond,
    generatedAt: new Date().toISOString(),
    currentTime: new Date().toISOString(),
    requestId: program.requestId || `req-${Date.now()}`,
    nodes: (program.executionProgram || []).map(item => ({
      nodeId: item.nodeId,
      schedule: (item.schedule || []).map(block => ({
        start: block.start,
        interval: block.interval,
        shots: block.shots,
        seconds: block.seconds
      }))
    }))
  };
}

function buildHeltecPayload(program) {
  return JSON.stringify(buildHeltecEnvelope(program));
}

//
// FUNCIONES DE ACK (envelope y payload)
//

function buildAckEnvelope(requestId, nodeId, status, message = '') {
  return {
    type: 'ACK',
    requestId,
    nodeId,
    status,
    message,
    timestamp: new Date().toISOString()
  };
}

function buildAckPayload(requestId, nodeId, status, message = '') {
  return JSON.stringify(buildAckEnvelope(requestId, nodeId, status, message));
}

module.exports = {
  buildHeltecEnvelope,
  buildHeltecPayload,
  buildCompactNodeProgram,
  buildCompactNodePayload,
  buildFeedingProgramEnvelope,
  buildCompactAckPayload,
  buildCompactAckEnvelope,
  buildAckEnvelope,
  buildAckPayload
};
