console.log("DietController cargado");

const DietService = require("../services/DietService");

class DietController {

    constructor() {

        this.service = new DietService();

    }

    getAll(req, res) {

        try {

            const diets = this.service.getAll();

            res.json({

                success: true,

                data: diets

            });

        }

        catch(error){

            res.status(500).json({

                success:false,

                message:error.message

            });

        }

    }

    create(req,res){

        try{

            const diet = this.service.create(

                req.body

            );

            res.json({

                success:true,

                data:diet

            });

        }

        catch(error){

            res.status(400).json({

                success:false,

                message:error.message

            });

        }

    }

}

module.exports = DietController;