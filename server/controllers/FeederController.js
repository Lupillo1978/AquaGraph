import FeederService from "../services/FeederService.js";

export default class FeederController {

    constructor() {

        this.service = new FeederService();

    }

    create(req, res) {

        try {

            const feeder = this.service.create(req.body);

            res.json({

                success: true,

                data: feeder

            });

        } catch (error) {

            res.status(400).json({

                success: false,

                message: error.message

            });

        }

    }

    getAll(req, res) {

        try {

            const feeders = this.service.getAll();

            res.json({

                success: true,

                data: feeders

            });

        } catch (error) {

            res.status(500).json({

                success: false,

                message: error.message

            });

        }

    }

}