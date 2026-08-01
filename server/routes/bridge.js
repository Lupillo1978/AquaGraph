const express = require('express');
const router = express.Router();
const SerialService = require('../utils/SerialService');

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

module.exports = router;
