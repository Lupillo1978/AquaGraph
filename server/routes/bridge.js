const express = require('express');
const router = express.Router();
const SerialService = require('../utils/SerialService');
const HeltecBridgeService = require('../services/HeltecBridgeService');

const ackEvents = [];

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

router.post('/send-program', async (req, res) => {
    try {
        const result = await HeltecBridgeService.sendFeedingProgram(req.body);
        res.json(result);
    } catch (err) {
        console.error(`[Bridge] send-program failed: ${err.message || err}`);
        res.status(500).json({ success: false, error: err.message });
    }
});

router.post('/ack', (req, res) => {
    const event = req.body;
    ackEvents.push(event);
    console.log(`[Bridge] ack received: ${JSON.stringify(event)}`);
    res.json({ success: true });
});

router.get('/acks', (req, res) => {
    res.json({ success: true, data: ackEvents });
});

module.exports = router;
