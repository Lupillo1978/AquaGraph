import FeederRepository from "../repositories/FeederRepository.js";

export default class FeederService {

    getAll() {

        return FeederRepository.getAll();

    }

    create(feeder) {

        const feeders = FeederRepository.getAll();

        feeders.push(feeder);

        FeederRepository.saveAll(feeders);

        return feeder;

    }

}