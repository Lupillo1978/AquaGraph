export default class PondEngine {

    constructor(infoPanel) {

        this.infoPanel = infoPanel;

    }

    initialize() {

        const btnPonds = document.getElementById("btnPonds");

        if (btnPonds) {

            btnPonds.addEventListener("click", () => {

                this.infoPanel.showPonds();

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

}