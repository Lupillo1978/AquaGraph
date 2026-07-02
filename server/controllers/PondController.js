const PondService = require("../services/PondService");

class PondController {

    getAll(req, res) {

        const ponds = PondService.getAllPonds();

        res.json({
            success: true,
            data: ponds
        });

    }

}

module.exports = new PondController();