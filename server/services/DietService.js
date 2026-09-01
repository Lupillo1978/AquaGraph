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

        const index = diets.findIndex(

            item => item.id === id

        );

        if (index === -1) {

            throw new Error(

                "Dieta no encontrada."

            );

        }

        diets.splice(index, 1);

        DietRepository.saveAll(diets);

    }
 
}

module.exports = DietService;