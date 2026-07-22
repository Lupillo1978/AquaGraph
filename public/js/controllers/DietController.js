import DietService from "../services/DietService.js";

export default class DietController {

    constructor() {

        this.service = new DietService();

    }

    async getAll() {

        return await this.service.getAll();

    }

    async getById(id) {

        return await this.service.getById(id);

    }

    async create(diet) {

        return await this.service.create(diet);

    }

    async update(id, diet) {

        return await this.service.update(

            id,

            diet

        );

    }

    async delete(id) {

        return await this.service.delete(id);

    }

}