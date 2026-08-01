const test = require('node:test');
const assert = require('node:assert/strict');
const { buildHeltecEnvelope, buildAckEnvelope } = require('../utils/HeltecProtocol');

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

test('buildAckEnvelope creates a confirmation payload', () => {
  const ack = buildAckEnvelope('req-123', 'NODE-01', 'SENT', 'Program forwarded');

  assert.equal(ack.type, 'ACK');
  assert.equal(ack.nodeId, 'NODE-01');
  assert.equal(ack.status, 'SENT');
});
