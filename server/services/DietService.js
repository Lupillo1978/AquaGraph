const DietRepository = require("../repositories/DietRepository");

const Diet = require("../models/Diet");

const IdGenerator = require("../utils/IdGenerator");

class DietService {

    getAll() {

        return DietRepository.getAll();

    }

    create(data) {

        const diets = DietRepository.getAll();

        const diet = new Diet({

            id: IdGenerator.generate(

                "DIET",

                diets

            ),

            name: data.name,

            description: data.description,

            blocks: data.blocks

        });

        diets.push(diet);

        DietRepository.saveAll(diets);

        return diet;

    }

    delete(id) {

        const diets = DietRepository.getAll();
        const dietIndex = diets.findIndex(diet => diet.id === id);

        if (dietIndex === -1) {

            const error = new Error("Dieta no encontrada");
            error.statusCode = 404;
            throw error;

        }

        const [deletedDiet] = diets.splice(dietIndex, 1);

        DietRepository.saveAll(diets);

        return deletedDiet;

    }

}

module.exports = DietService;