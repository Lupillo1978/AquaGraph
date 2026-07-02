const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "..", "storage", "ponds.json");

class PondRepository {

    getAll() {

        if (!fs.existsSync(filePath)) {
            return [];
        }

        const data = fs.readFileSync(filePath, "utf8");

        return JSON.parse(data);

    }

    saveAll(ponds) {

        fs.writeFileSync(
            filePath,
            JSON.stringify(ponds, null, 4),
            "utf8"
        );

    }

}

module.exports = new PondRepository();