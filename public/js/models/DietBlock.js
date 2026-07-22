export default class DietBlock {

    constructor(data = {}) {

        this.id = data.id || crypto.randomUUID();

        this.order = data.order || 1;

        this.start = data.start || "09:00";

        this.end = data.end || "10:00";

        this.percentage = data.percentage || 0;

        this.interval = data.interval || 10;

        this.enabled = data.enabled ?? true;

    }

}