import EventTypes from "../core/EventTypes.js";
import FeederController from "../controllers/FeederController.js";

export default class FeederEngine {

    constructor(infoPanel, eventBus) {

        this.infoPanel = infoPanel;

        this.eventBus = eventBus;

        this.controller = new FeederController();

        this.selectedPond = null;

        this.currentPosition = null;

    }

    

        async initialize() {

              this.registerEvents();

              await this.loadFeeders();

            }
       




    async loadFeeders() {

    const response = await this.controller.getAll();

    if (!response.success) {

        return;

    }

    console.log(

        "Alimentadores cargados:",

        response.data

    );

    response.data.forEach(feeder => {

        this.eventBus.emit(

            EventTypes.FEEDER_CREATED,

            feeder

        );

    });

}

    registerEvents() {

        // Estanque seleccionado
        this.eventBus.on(

            EventTypes.POND_SELECTED,

            (pond) => {

                this.selectedPond = pond;

            }

        );

        // Posición seleccionada en el mapa
        this.eventBus.on(

    EventTypes.FEEDER_POSITION_SELECTED,

    ({ pond, latlng }) => {

        this.selectedPond = pond;

        this.currentPosition = {

            lat: latlng.lat,

            lng: latlng.lng

        };

        this.infoPanel.showCreateFeederForm(

            pond

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

        // Botón Guardar Alimentador
        document.addEventListener("click", async (event) => {

            if (event.target.id !== "btnSaveFeeder") {

                return;

            }

            await this.saveFeeder();

        });

        // Botón Cancelar
        document.addEventListener("click", (event) => {

            if (event.target.id !== "btnCancelCreateFeeder") {

                return;

            }

            this.cancelCreateFeeder();

        });

    }

    startCreateFeeder() {

        if (!this.selectedPond) {

            alert("Seleccione primero un estanque.");

            return;

        }

        console.log("Iniciando creación de alimentador...");

        this.currentPosition = null;

        this.infoPanel.showCreateFeederStep1(

            this.selectedPond

        );

        this.eventBus.emit(

            EventTypes.MAP_PLACE_FEEDER,

            this.selectedPond

        );

    }

    async saveFeeder() {

        if (!this.currentPosition) {

            alert(

                "Seleccione la ubicación del alimentador sobre el mapa."

            );

            return;

        }

        const feederName = document
            .getElementById("feederName")
            .value
            .trim();

        if (feederName === "") {

            alert(

                "Capture el nombre del alimentador."

            );

            return;

        }

        const feeder = {

            pondId: this.selectedPond.id,

            name: feederName,

            nodeId: document
                .getElementById("feederNode")
                .value
                .trim(),

            position: this.currentPosition,

            settings: {

                radius: Number(

                    document.getElementById("feederRadius").value

                ),

                orientation: Number(

                    document.getElementById("feederOrientation").value

                )

            }

        };

        try {

            const response = await this.controller.create(

                feeder

            );

            console.log(

                "Respuesta servidor:",

                response

            );

            if (!response.success) {

                alert(

                    "No fue posible guardar el alimentador."

                );

                return;

            }

            this.eventBus.emit(

                EventTypes.FEEDER_CREATED,

                response.data

            );

            this.reset();

            this.infoPanel.showPond(

                this.selectedPond

            );

        }
        catch (error) {

            console.error(error);

            alert(

                "Error al comunicarse con el servidor."

            );

        }

    }

    cancelCreateFeeder() {

        this.reset();

        if (this.selectedPond) {

            this.infoPanel.showPond(

                this.selectedPond

            );

        }
        else {

            this.infoPanel.showWelcome();

        }

    }

    reset() {

        this.currentPosition = null;

    }

}