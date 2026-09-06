const AcousticService = require("../services/AcousticService");

class AcousticController {

    ponds(req, res) {
        res.json({ success: true, data: AcousticService.getPonds() });
    }

    status(req, res) {
        res.json({ success: true, data: AcousticService.getStatus(req.params.pondId) });
    }

    config(req, res) {
        try {
            res.json({ success: true, data: AcousticService.configure(req.params.pondId, req.body) });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    getConfig(req, res) {
        res.json({ success: true, data: AcousticService.getConfig(req.params.pondId) });
    }

    simulate(req, res) {
        try {
            res.json({ success: true, data: AcousticService.simulate(req.body.pondId, req.body) });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    history(req, res) {
        res.json({ success: true, data: AcousticService.getHistory(req.params.pondId, req.query.date) });
    }

    seedHistory(req, res) {
        try {
            res.json({ success: true, data: AcousticService.seedHistory(req.params.pondId, 97, req.body?.date) });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

}

module.exports = AcousticController;
