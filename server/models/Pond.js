class Pond {
    constructor(data = {}) {

        this.id = data.id || null;
        this.name = data.name || "";
        this.color = data.color || "#2196F3";

        this.geometry = data.geometry || {
            type: "Polygon",
            coordinates: []
        };

        this.metrics = data.metrics || {
            area: 0,
            perimeter: 0
        };

        this.feeders = data.feeders || [];

        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
    }
}

module.exports = Pond;