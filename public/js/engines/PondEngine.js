import EventTypes from "../core/EventTypes.js";
import PondController from "../controllers/PondController.js";

export default class PondEngine {

    constructor(infoPanel, eventBus) {

        this.infoPanel = infoPanel;
        this.eventBus = eventBus;
        this.controller = new PondController();

        this.currentGeometry = null;

    }

    initialize() {

        this.registerMenuEvents();

        this.registerCreateEvents();

        this.registerGeometryEvents();

    }

    registerMenuEvents() {

        const btnPonds = document.getElementById("btnPonds");

        if (!btnPonds) return;

        btnPonds.addEventListener("click", () => {

            this.infoPanel.showPond();

            this.loadPonds();

        });

    }

    registerCreateEvents() {

        document.addEventListener("click", async (event) => {

            switch (event.target.id) {

                case "btnNewPond":

                    this.startCreateWorkflow();

                    break;

                case "savePond":

                    await this.savePond();

                    break;

            }

        });

    }

    registerGeometryEvents() {

        this.eventBus.on(

            EventTypes.POND_GEOMETRY_CREATED,

            (geometry) => {

                this.currentGeometry = geometry;

                console.log(
                    "Geometría recibida en PondEngine",
                    geometry
                );

                // El formulario se abrirá automáticamente
                // después de terminar el dibujo.
                this.openPondForm();

            }

        );

    }

    startCreateWorkflow() {

        this.currentGeometry = null;

        this.infoPanel.showCreatePondStep1();

        this.eventBus.emit(

            EventTypes.MAP_DRAW_POLYGON

        );

    }

    openPondForm() {

        const modal = new bootstrap.Modal(

            document.getElementById("newPondModal")

        );

        modal.show();

    }

    async savePond() {

        const pond = {

            name: document.getElementById("pondName").value.trim(),

            area: Number(
                document.getElementById("pondArea").value
            ),

            description: document.getElementById("pondDescription").value.trim(),

            geometry: this.currentGeometry

        };

        if (!pond.name) {

            alert("Debe capturar el nombre del estanque.");

            return;

        }

        if (!pond.geometry) {

            alert("Debe dibujar el estanque.");

            return;

        }

        const response = await this.controller.create(pond);

        if (!response.success) {

            alert(response.message);

            return;

        }

        console.log("✅ Estanque creado", response.data);

        this.clearForm();

        await this.loadPonds();

    }

    clearForm() {

        const modalElement = document.getElementById("newPondModal");

        const modal = bootstrap.Modal.getInstance(modalElement);

        if (modal) {

            modal.hide();

        }

        document.getElementById("pondName").value = "";

        document.getElementById("pondArea").value = "";

        document.getElementById("pondDescription").value = "";

        this.currentGeometry = null;

    }

    async loadPonds() {

        const response = await this.controller.getAll();

        if (!response.success) {

            return;

        }

        console.log("Estanques cargados");

        console.table(response.data);

    }

}