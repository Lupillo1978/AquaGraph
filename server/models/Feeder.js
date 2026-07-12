class Feeder {

    constructor(data = {}) {

        this.id = data.id ?? null;

        this.code = data.code ?? "";

        this.name = data.name ?? "";

        this.pondId = data.pondId ?? "";

        this.nodeId = data.nodeId ?? "";

        this.position = data.position ?? {

            lat: 0,

            lng: 0

        };

        this.settings = data.settings ?? {

            radius: 25,

            orientation: 0

        };

        this.status = data.status ?? {

            online: false,

            battery: null,

            rssi: null,

            lastSeen: null

        };

        this.createdAt = data.createdAt ?? new Date().toISOString();

        this.updatedAt = data.updatedAt ?? new Date().toISOString();

    }

}

module.exports = Feeder;