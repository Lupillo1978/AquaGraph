import EventTypes from "../core/EventTypes.js";
import PondController from "../controllers/PondController.js";
import GeometryService from "../services/GeometryService.js";

export default class PondEngine {

    constructor(infoPanel, eventBus) {

        this.infoPanel = infoPanel;
        this.eventBus = eventBus;
        this.controller = new PondController();
        this.geometryService = new GeometryService();
        this.currentGeometry = null;
        this.selectedPond = null;
    }

    initialize() {

        this.registerMenuEvents();

        this.registerCreateEvents();

        this.registerGeometryEvents();

        this.loadPonds();

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

                case "btnOpenFeeding":

                    if (!this.selectedPond) {

                     return;

                    }

                  this.infoPanel.showFeedingPanel(

                    this.selectedPond

                   );

                break;

            }

        });

    }

    registerGeometryEvents() {

    this.eventBus.on(

        EventTypes.POND_GEOMETRY_CREATED,

        (geometry) => {

            this.currentGeometry = geometry;

            const area = this.geometryService.calculateArea(geometry);

            console.log("Superficie:", area.toFixed(2), "ha");

            this.openPondForm();

            this.fillGeometryData(area);

        }

    );

    this.eventBus.on(

    EventTypes.POND_SELECTED,

    (pond) => {

        this.selectedPond = pond;
        this.infoPanel.showPond(pond);

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

    fillGeometryData(area) {

       document.getElementById("pondArea").value = area.toFixed(2);

    }

    async savePond() {

        const pond = {

             name: document.getElementById("pondName").value.trim(),

    description: document.getElementById("pondDescription").value.trim(),

    geometry: this.currentGeometry,

    metrics: {

        area: Number(
            document.getElementById("pondArea").value
        )

    }


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

       // Mostrar el estanque permanente en el mapa
       this.eventBus.emit(

            EventTypes.MAP_ADD_POND,

            response.data

        );

       // Limpiar el dibujo temporal
       this.eventBus.emit(

           EventTypes.MAP_CLEAR_TEMPORARY

        );

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

         response.data.forEach(pond => {

        this.eventBus.emit(

            EventTypes.MAP_ADD_POND,

            pond

          );

        });

}

}