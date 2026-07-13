import EventTypes from "../../core/EventTypes.js";

export default class FeederSelection {

    constructor(infoPanel, eventBus) {

        this.infoPanel = infoPanel;

        this.eventBus = eventBus;

        this.selectedPond = null;

    }

    initialize() {

        this.registerEvents();

    }

    registerEvents() {

        this.eventBus.on(

            EventTypes.POND_SELECTED,

            (pond) => {

                this.selectedPond = pond;

            }

        );

        this.eventBus.on(

            EventTypes.FEEDER_SELECTED,

            (feeder) => {

                this.infoPanel.showFeeder(

                    feeder

                );

            }

        );

    }

}