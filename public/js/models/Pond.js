export default class Pond {

    constructor(data = {}) {

        this.id = data.id ?? null;

        this.code = data.code ?? "";

        this.name = data.name ?? "";

        this.area = data.area ?? 0;

        this.status = data.status ?? "Activo";

        this.feeders = data.feeders ?? [];

        this.geometry = data.geometry ?? null;

    }

}