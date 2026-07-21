export default class DietItem {

    constructor(data = {}) {

        this.start = data.start ?? "";

        this.end = data.end ?? "";

        this.percentage = data.percentage ?? 0;

        this.interval = data.interval ?? 0;

    }

}