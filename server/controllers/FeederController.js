console.log("FeederController cargado");

const FeederService = require("../services/FeederService");




class FeederController {

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

update(req, res) {

    try {

        const feeder = this.service.update(

            req.params.id,

            req.body

        );

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


    async delete(id) {

    const response = await fetch(

        `/api/feeders/${id}`,

        {

            method: "DELETE"

        }

    );

    return await response.json();

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

module.exports = FeederController;