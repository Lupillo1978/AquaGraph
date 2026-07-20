export default class FeederController {

    async getAll() {

        const response = await fetch("/api/feeders");

        return await response.json();

    }

    async create(feeder) {

        const response = await fetch(

            "/api/feeders",

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify(feeder)

            }

        );

        return await response.json();

    }

    async update(id, feeder) {

    const response = await fetch(

        `/api/feeders/${id}`,

        {

            method: "PUT",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify(feeder)

        }

    );

    return await response.json();

}

async delete(id) {

    const response = await fetch(

        `/api/feeders/${id}`,

        {

            method: "DELETE"

        }

    );

    return await response.json();

}

}