import PondService from "../services/PondService.js";

export default class PondEngine {

    constructor(infoPanel, eventBus) {

        this.infoPanel = infoPanel;

        this.eventBus = eventBus ;

        this.service = new PondService();

        this.currentGeometry = null ;

    }

    initialize() {

        const btnPonds = document.getElementById("btnPonds");

        if (btnPonds) {

            btnPonds.addEventListener("click", () => {

                this.infoPanel.showPonds();

                this.loadPonds();

            });

        }

        document.addEventListener("click", (event) => {

            if (event.target.id === "btnNewPond") {

                const modal = new bootstrap.Modal(

                    document.getElementById("newPondModal")

                );

                modal.show();

            }

        });

        this.eventBus.on(

             "pond:geometryCreated",

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

     const response = await this.service.getAll();

     console.log(response);

    }


}