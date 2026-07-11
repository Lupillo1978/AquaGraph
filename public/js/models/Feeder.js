export default class Feeder {

    constructor(data = {}) {

        this.id = data.id ?? null;

        this.code = data.code ?? "";

        this.name = data.name ?? "";

        this.pondId = data.pondId ?? "";

        this.nodeId = data.nodeId ?? "";

        this.latitude = data.latitude ?? 0;

        this.longitude = data.longitude ?? 0;

        this.orientation = data.orientation ?? 0;

        this.throwRadius = data.throwRadius ?? 25;

        this.status = data.status ?? "NEW";

        this.battery = data.battery ?? null;

        this.rssi = data.rssi ?? null;

        this.schedules = data.schedules ?? [];

        this.createdAt = data.createdAt ?? new Date().toISOString();

        this.updatedAt = data.updatedAt ?? new Date().toISOString();

    }

}