const fs = require("fs");
const path = require("path");

const filePath = path.join(
    __dirname,
    "..",
    "storage",
    "feeders.json"
);

class FeederRepository {

    static getAll() {

        if (!fs.existsSync(filePath)) {

            return [];

        }

        const data = fs.readFileSync(

            filePath,

            "utf8"

        );

        return JSON.parse(data);

    }

    static saveAll(feeders) {

        fs.writeFileSync(

            filePath,

            JSON.stringify(

                feeders,

                null,

                4

            )

        );

    }

}

module.exports = FeederRepository;