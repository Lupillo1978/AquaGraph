
import EventTypes from "../core/EventTypes.js";
import PondController from "../controllers/PondController.js";

export default class PondEngine {

    constructor(infoPanel, eventBus) {

        this.infoPanel = infoPanel;

        this.eventBus = eventBus ;

        this.controller = new PondController();

        this.currentGeometry = null ;

    }

    initialize() {

        const btnPonds = document.getElementById("btnPonds");

        if (btnPonds) {

            btnPonds.addEventListener("click", () => {

                this.infoPanel.showPond();

                this.loadPonds();

            });

        }

        document.addEventListener("click", (event) => {

            if (event.target.id === "btnNewPond") {

                const modal = new bootstrap.Modal(

                    document.getElementById("newPondModal")

                );

                //modal.show();

                this.infoPanel.showCreatePondStep1();

                this.eventBus.emit(

                  EventTypes.MAP_DRAW_POLYGON

                );

            }

        });

        this.eventBus.on(

             EventTypes.POND_GEOMETRY_CREATED,

         (geometry) => {

             this.currentGeometry = geometry;

                console.log(

                 "Geometría recibida en PondEngine",

                  geometry

                );

            }

        );

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