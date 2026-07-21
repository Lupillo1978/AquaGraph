export default class Diet {

    constructor(data = {}) {

        this.id = data.id ?? "";

        this.name = data.name ?? "";

        this.description = data.description ?? "";

        this.items = data.items ?? [];

    }

}