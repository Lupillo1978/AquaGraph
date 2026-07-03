import PondService from "../services/PondService.js";

export default class PondEngine {

    constructor(infoPanel) {

        this.infoPanel = infoPanel;

        this.service = new PondService();

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

    }

    async loadPonds() {

     const response = await this.service.getAll();

     console.log(response);

    }


}