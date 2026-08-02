const test = require('node:test');
const assert = require('node:assert/strict');
const HeltecBridgeService = require('../services/HeltecBridgeService');

test('handleIncomingMessage stores ACK messages for the UI', () => {
  const ack = HeltecBridgeService.handleIncomingMessage({
    type: 'ACK',
    requestId: 'req-100',
    nodeId: 'NODE-01',
    status: 'OK',
    message: 'Program forwarded'
  });

  assert.equal(ack.type, 'ACK');
  assert.equal(ack.nodeId, 'NODE-01');
  assert.equal(HeltecBridgeService.getAcks().length, 1);
});
