const PondService = require("../services/PondService");

class PondController {

    getAll(req, res) {

        const ponds = PondService.getAllPonds();

        res.json({
            success: true,
            data: ponds
        });

    }

    create(req, res) {

        try {

            const pond = PondService.createPond(req.body);

            res.status(201).json({

                success: true,

                message: "Estanque creado correctamente.",

                data: pond

            });

        } catch (error) {

            res.status(400).json({

                success: false,

                message: error.message

            });

        }

    }

}

module.exports = new PondController();