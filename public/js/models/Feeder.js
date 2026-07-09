export default class Feeder {

    constructor(data = {}) {

        this.id = data.id ?? null;

        this.pondId = data.pondId ?? null;

        this.name = data.name ?? "";

        this.loraId = data.loraId ?? "";

        this.position = data.position ?? null;

        this.mode = data.mode ?? "timer";

        this.enabled = data.enabled ?? true;

        this.status = data.status ?? "offline";

        this.battery = data.battery ?? 100;

        this.schedules = data.schedules ?? [];

    }

}