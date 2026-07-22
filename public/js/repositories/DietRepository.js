export default class DietRepository {

    constructor() {

        this.endpoint = "/api/diets";

    }

    async getAll() {

        const response = await fetch(

            this.endpoint

        );

        return await response.json();

    }

    async getById(id) {

        const response = await fetch(

            `${this.endpoint}/${id}`

        );

        return await response.json();

    }

    async create(diet) {

        const response = await fetch(

            this.endpoint,

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify(

                    diet

                )

            }

        );

        return await response.json();

    }

    async update(id, diet) {

        const response = await fetch(

            `${this.endpoint}/${id}`,

            {

                method: "PUT",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify(

                    diet

                )

            }

        );

        return await response.json();

    }

    async delete(id) {

        const response = await fetch(

            `${this.endpoint}/${id}`,

            {

                method: "DELETE"

            }

        );

        return await response.json();

    }

}