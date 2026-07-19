import EventTypes from "../../core/EventTypes.js";

export default class FeederEdition {

    constructor(controller, eventBus) {

        this.controller = controller;

        this.eventBus = eventBus;

        this.feeders = [];

    }

    setFeeders(feeders) {

        this.feeders = feeders;

    }

    async update(feeder) {

        const response = await this.controller.update(

            feeder.id,

            feeder

        );

        if (!response.success) {

            throw new Error(response.message);

        }

        const index = this.feeders.findIndex(

            item => item.id === response.data.id

        );

        if (index !== -1) {

            this.feeders[index] = response.data;

        }

        this.eventBus.emit(

            EventTypes.FEEDER_UPDATED,

            response.data

        );

        return response.data;

    }

}