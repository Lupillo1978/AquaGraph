export default class DietController {

    async getAll() {

        const response = await fetch(

            "/api/diets"

        );

        return await response.json();

    }

    async create(diet) {

        const response = await fetch(

            "/api/diets",

            {

                method: "POST",

                headers: {

                    "Content-Type":"application/json"

                },

                body: JSON.stringify(diet)

            }

        );

        return await response.json();

    }

}