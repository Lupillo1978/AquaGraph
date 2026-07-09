const PondRepository = require("../repositories/PondRepository");
const Pond = require("../models/Pond");
const IdGenerator = require("../utils/IdGenerator");

class PondService {

    getAllPonds() {
        return PondRepository.getAll();
    }

    createPond(data) {

        if (!data.name || data.name.trim() === "") {

           throw new Error("El nombre del estanque es obligatorio.");

        }

        const ponds = PondRepository.getAll();

        const pond = new Pond({

    id: IdGenerator.generate("POND", ponds),

    name: data.name,

    description: data.description || "",

    enabled: true,

    geometry: data.geometry || {
        type: "Polygon",
        coordinates: []
    },

    metrics: {

        area: Number(data.metrics?.area ?? 0)

    },

    feeders: []

});

        ponds.push(pond);

        PondRepository.saveAll(ponds);

        return pond;

    }

}

module.exports = new PondService();