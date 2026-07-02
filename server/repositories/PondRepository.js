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

}

module.exports = new PondRepository();