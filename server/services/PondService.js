const PondRepository = require("../repositories/PondRepository");

class PondService {

    getAllPonds() {

        return PondRepository.getAll();

    }

}

module.exports = new PondService();