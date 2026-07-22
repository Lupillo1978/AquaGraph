import DietRepository from "../repositories/DietRepository.js";

export default class DietService {

    constructor() {

        this.repository = new DietRepository();

    }

    async getAll() {

        return await this.repository.getAll();

    }

    async getById(id) {

        return await this.repository.getById(id);

    }

    async create(diet) {

        return await this.repository.create(diet);

    }

    async update(id, diet) {

        return await this.repository.update(

            id,

            diet

        );

    }

    async delete(id) {

        return await this.repository.delete(id);

    }

}