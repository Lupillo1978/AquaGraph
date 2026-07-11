import EventTypes from "../core/EventTypes.js";

export default class FeederEngine {

    constructor(infoPanel, eventBus) {

        this.infoPanel = infoPanel;
        this.eventBus = eventBus;

        this.selectedPond = null;

        this.selectedPosition = null;

    }

    initialize() {

        this.registerEvents();

    }

    registerEvents() {

        // Guardar el estanque actualmente seleccionado
        this.eventBus.on(

            EventTypes.POND_SELECTED,

            (pond) => {

                this.selectedPond = pond;

            }

        );


        this.eventBus.on(

    EventTypes.FEEDER_POSITION_SELECTED,

    (data) => {

        this.selectedPosition = data.latlng;

        console.log(

            "Posición del alimentador:",

            this.selectedPosition

        );

        this.infoPanel.showCreateFeederForm(

            this.selectedPond

        );

    }

);

        // Botón Agregar Alimentador
        document.addEventListener("click", (event) => {

            if (event.target.id !== "btnAddFeeder") {

                return;

            }

            this.startCreateFeeder();

        });

        // Botón Cancelar
        document.addEventListener("click", (event) => {

            if (event.target.id !== "btnCancelCreateFeeder") {

                return;

            }

            if (this.selectedPond) {

                this.infoPanel.showPond(this.selectedPond);

            } else {

                this.infoPanel.showWelcome();

            }

        });

    }

    startCreateFeeder() {

        if (!this.selectedPond) {

            alert("Seleccione primero un estanque.");

            return;

        }

        console.log("Iniciando creación de alimentador...");

        // Cambiar el panel
        this.infoPanel.showCreateFeederStep1(

            this.selectedPond

        );

        // Avisar al mapa
        this.eventBus.emit(

            EventTypes.MAP_PLACE_FEEDER,

            this.selectedPond

        );

    }

}