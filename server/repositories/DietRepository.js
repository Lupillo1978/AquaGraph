const fs = require("fs");

const path = require("path");

class DietRepository {

    constructor() {

        this.file = path.join(

            __dirname,

            "../storage/diets.json"

        );

    }

    getAll() {

        if (!fs.existsSync(this.file)) {

            return [];

        }

        const json = fs.readFileSync(

            this.file,

            "utf8"

        );

        return JSON.parse(json);

    }

    saveAll(diets) {

        fs.writeFileSync(

            this.file,

            JSON.stringify(

                diets,

                null,

                4

            )

        );

    }

}

module.exports = new DietRepository();