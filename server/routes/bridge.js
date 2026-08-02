const express = require('express');
const router = express.Router();
const SerialService = require('../utils/SerialService');
const HeltecBridgeService = require('../services/HeltecBridgeService');
const { buildHeltecPayload, buildAckPayload } = require('../utils/HeltecProtocol');

router.get('/ports', async (req, res) => {
    try {
        const ports = await SerialService.listPorts();
        res.json({ success: true, ports });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.post('/connect', async (req, res) => {
    const { path, baudRate } = req.body;
    if (!path) return res.status(400).json({ success: false, error: 'path required' });
    console.log(`[Bridge] connect request received for ${path}`);
    try {
        await SerialService.start(path, baudRate || 115200);
        console.log(`[Bridge] connect completed for ${path}`);
        res.json({ success: true });
    } catch (err) {
        console.error(`[Bridge] connect failed for ${path}: ${err.message || err}`);
        res.status(500).json({ success: false, error: err.message });
    }
});

router.post('/disconnect', async (req, res) => {
    try {
        await SerialService.stop();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.get('/status', async (req, res) => {
    try {
        const status = SerialService.getStatus();
        res.json({ success: true, status });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.post('/send', async (req, res) => {
    const payload = req.body;
    console.log(`[Bridge] send request received: ${JSON.stringify(payload)}`);
    try {
        await SerialService.send(payload);
        console.log('[Bridge] send completed');
        res.json({ success: true });
    } catch (err) {
        console.error(`[Bridge] send failed: ${err.message || err}`);
        res.status(500).json({ success: false, error: err.message });
    }
});

router.post('/feed', async (req, res) => {
    const { nodeId, pondId, dietId, gramsPerSecond, durationSeconds, amountGrams, mode = 'manual' } = req.body;

    const payload = {
        type: 'FEED_NOW',
        nodeId: nodeId || 'A1-F01',
        pondId: pondId || 'POND-01',
        dietId: dietId || null,
        gramsPerSecond: Number(gramsPerSecond || 0),
        durationSeconds: Number(durationSeconds || 0),
        amountGrams: Number(amountGrams || 0),
        mode
    };

    try {
        await SerialService.send(payload);
        res.json({ success: true, payload });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.post('/diet', async (req, res) => {
    const { nodeId, pondId, diet } = req.body;

    const payload = {
        type: 'SET_DIET',
        nodeId: nodeId || 'A1-F01',
        pondId: pondId || 'POND-01',
        diet: diet || null
    };

    try {
        await SerialService.send(payload);
        res.json({ success: true, payload });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.post('/send-program', async (req, res) => {
    try {
        const result = await HeltecBridgeService.sendFeedingProgram(req.body);
        res.json({ success: true, data: result });
    } catch (err) {
        console.error('[Bridge] send-program failed:', err.message || err);
        const status = err.code === 'HELTEC_DISCONNECTED' ? 503 : 500;
        res.status(status).json({ success: false, error: err.message || 'Unable to send program' });
    }
});

router.get('/acks', (req, res) => {
    res.json({ success: true, data: HeltecBridgeService.getAcks() });
});

router.post('/ack', async (req, res) => {
    const { requestId, nodeId, status, message } = req.body;
    try {
        const result = await HeltecBridgeService.sendAckToMaster(requestId, nodeId, status, message);
        res.json({ success: true, data: result });
    } catch (err) {
        const status = err.code === 'HELTEC_DISCONNECTED' ? 503 : 500;
        res.status(status).json({ success: false, error: err.message || 'Unable to send ACK' });
    }
});

module.exports = router;
