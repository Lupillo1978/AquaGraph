import fs from "fs";
import path from "path";

const filePath = path.resolve(
    "server/storage/feeders.json"
);

export default class FeederRepository {

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