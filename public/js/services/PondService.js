export default class PondService {

    async getAll() {

        const response = await fetch("/api/ponds");

        return await response.json();

    }

    async create(pond) {

        const response = await fetch("/api/ponds", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify(pond)

        });

        return await response.json();

    }

}