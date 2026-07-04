
import Pond from "../models/Pond.js";
export default class PondService {

    async getAll() {

    const response = await fetch("/api/ponds");

    const json = await response.json();

    if (!json.success) {

        return json;

    }

    json.data = json.data.map(

        pond => new Pond(pond)

    );

    return json;

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