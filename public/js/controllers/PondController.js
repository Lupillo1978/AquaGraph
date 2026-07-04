import PondService from "../services/PondService.js";

export default class PondController {

    constructor() {

        this.service = new PondService();

    }

    async create(pond) {

        return await this.service.create(pond);

    }

    async getAll() {

        return await this.service.getAll();

    }

}