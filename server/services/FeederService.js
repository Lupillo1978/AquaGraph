const FeederRepository = require("../repositories/FeederRepository");
const Feeder = require("../models/Feeder");
const IdGenerator = require("../utils/IdGenerator");

class FeederService {

    getAll() {

        return FeederRepository.getAll();

    }

    create(data) {

        const feeders = FeederRepository.getAll();

        const feeder = new Feeder({

            id: IdGenerator.generate(

                "FEEDER",

                feeders

            ),

            code: data.code ?? "",

            name: data.name ?? "",

            pondId: data.pondId ?? "",

            nodeId: data.nodeId ?? "",

            position: data.position,

            settings: data.settings

        });

        feeders.push(feeder);

        FeederRepository.saveAll(feeders);

        return feeder;

    }

}

module.exports = FeederService;