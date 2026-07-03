export default class Pond {

    constructor() {

        this.id = null;

        this.code = "";

        this.name = "";

        this.description = "";

        this.area = 0;

        this.color = "#00A651";

        this.status = "ACTIVE";

        this.geometry = null;

        this.feeders = [];

        this.schedules = [];

        this.sensors = [];

        this.production = {};

        this.createdAt = null;

        this.updatedAt = null;

    }

}