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

            items: data.items

        });

        diets.push(diet);

        DietRepository.saveAll(diets);

        return diet;

    }

}

module.exports = DietService;