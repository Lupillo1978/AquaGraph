const test = require('node:test');
const assert = require('node:assert/strict');
const { buildHeltecEnvelope, buildFeedingProgramEnvelope, buildCompactNodeProgram, buildAckEnvelope } = require('../utils/HeltecProtocol');

test('buildHeltecEnvelope wraps a feeding program for the Heltec', () => {
  const program = {
    pondId: 'POND-001',
    dietId: 'DIET-001',
    dailyFoodKg: 5,
    gramsPerSecond: 2.5,
    executionProgram: [
      {
        nodeId: 'NODE-01',
        schedule: [
          { start: '06:00', interval: 30, shots: 4, seconds: 5 }
        ]
      }
    ]
  };

  const envelope = buildHeltecEnvelope(program);

  assert.equal(envelope.type, 'FEEDING_PROGRAM');
  assert.equal(envelope.nodes[0].nodeId, 'NODE-01');
  assert.equal(envelope.nodes[0].schedule[0].shots, 4);
  assert.equal(envelope.pondId, 'POND-001');
  assert.ok(envelope.currentTime);
});

test('buildFeedingProgramEnvelope creates one compact payload per node', () => {
  const program = {
    pondId: 'POND-001',
    dietId: 'DIET-001',
    dailyFoodKg: 5,
    gramsPerSecond: 2.5,
    executionProgram: [
      {
        nodeId: '101',
        schedule: [
          { start: '20:00', interval: 5, shots: 12, seconds: 41.67 },
          { start: '21:00', interval: 5, shots: 12, seconds: 35.71 }
        ]
      },
      {
        nodeId: '102',
        schedule: [
          { start: '22:00', interval: 5, shots: 12, seconds: 35.71 }
        ]
      }
    ]
  };

  const payloads = buildFeedingProgramEnvelope(program);

  // Debe generar un payload por nodo.
  assert.equal(payloads.length, 2);

  const p0 = JSON.parse(payloads[0]);
  assert.equal(p0.t, 'FP');
  assert.equal(p0.n, '101');
  assert.ok(p0.e > 0);
  assert.equal(p0.rs.length, 2);
assert.deepEqual(Array.from(p0.rs[0]).slice(0, 3), [20, 0, 12]);
  assert.equal(p0.rs[0][3], 42); // seconds redondeado a entero
  assert.equal(p0.rs[0][4], 5); // interval (minutos) entre disparos

  // Cada payload debe caber en un frame LoRa (~222 bytes).
  payloads.forEach(p => assert.ok(Buffer.byteLength(p) <= 222, `payload too large: ${Buffer.byteLength(p)}`));

  const p1 = JSON.parse(payloads[1]);
  assert.equal(p1.n, '102');
  assert.equal(p1.rs.length, 1);
});

test('buildCompactNodeProgram produces a compact node object', () => {
  const node = {
    nodeId: '101',
    schedule: [
      { start: '20:00', interval: 5, shots: 12, seconds: 41.67 }
    ]
  };
  const obj = buildCompactNodeProgram(node, 'req-1', '2026-08-05T04:34:20.915Z', -6);

  assert.equal(obj.t, 'FP');
  assert.equal(obj.n, '101');
  assert.equal(obj.r, 'req-1');
  assert.equal(obj.z, -6);
  assert.equal(obj.rs.length, 1);
  assert.deepEqual(Array.from(obj.rs[0]).slice(0, 3), [20, 0, 12]);
});

test('buildAckEnvelope creates a confirmation payload', () => {
  const ack = buildAckEnvelope('req-123', 'NODE-01', 'SENT', 'Program forwarded');

  assert.equal(ack.type, 'ACK');
  assert.equal(ack.nodeId, 'NODE-01');
  assert.equal(ack.status, 'SENT');
});
