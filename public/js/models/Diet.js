export default class Diet {

    constructor(data = {}) {

        this.id = data.id || crypto.randomUUID();

        this.name = data.name || "";

        this.description = data.description || "";

        this.blocks = data.blocks || [];

        this.active = data.active ?? true;

        this.createdAt = data.createdAt || new Date().toISOString();

        this.updatedAt = data.updatedAt || new Date().toISOString();

    }

}