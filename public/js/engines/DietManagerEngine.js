/*Su función principal es administrar el listado de dietas existentes 
y permitir al usuario crear una nueva dieta o consultar su gráfica.*/

import DietManagerView from "../views/DietManagerView.js";
import DietEngine from "./DietEngine.js";
import DietController from "../controllers/DietController.js";
import DietChartModal from "../components/DietChartModal.js";


export default class DietManagerEngine {

    constructor(workspaceManager) {
        this.workspaceManager = workspaceManager;

        this.view = new DietManagerView();
        this.controller = new DietController();
        this.dietChartModal = new DietChartModal();

        this.diets = [];

        this.dietEngine = new DietEngine(
            workspaceManager,
            this
        );
    }

    async show() {
        this.workspaceManager.showWorkspace();

        const response = await this.controller.getAll();

        console.log(
            "Dietas recibidas:",
            response
        );

        const diets = response.success
            ? response.data
            : [];

        this.diets = diets;

        this.workspaceManager.render(
            this.view.render(diets)
        );

        this.registerEvents();
    }

    registerEvents() {

        // =====================================================
        // Nueva dieta
        // =====================================================

        document
            .getElementById("btnNewDiet")
            .addEventListener("click", () => {
                this.dietEngine.showEditor();
            });


        // =====================================================
        // Selección de dieta
        // =====================================================

        document
            .querySelectorAll(".diet-row")
            .forEach((row) => {

                row.addEventListener("click", () => {

                    document
                        .querySelectorAll(".diet-row")
                        .forEach((currentRow) => {
                            currentRow.classList.remove(
                                "table-active"
                            );
                        });

                    row.classList.add("table-active");

                    console.log(
                        "Dieta seleccionada:",
                        row.dataset.id
                    );
                });
            });


        // =====================================================
        // Ver gráfico
        // =====================================================

        document
            .querySelectorAll(".diet-chart-btn")
            .forEach((button) => {
 
                button.addEventListener(
                    "click",
                    (event) => {
 
                        event.stopPropagation();
 
                        const id = button.dataset.id;
 
                        const diet = this.diets.find(
                            (item) => item.id === id
                        );
 
                        if (diet) {
                            this.dietChartModal.open(diet);
                        }
                    }
                );
            });

        document
            .querySelectorAll(".diet-delete-btn")
            .forEach((button) => {

                button.addEventListener(
                    "click",
                    async (event) => {

                        event.stopPropagation();

                        const id = button.dataset.id;

                        await this.deleteDiet(id);
                    }
                );
            });
    }

    async deleteDiet(dietId) {

        const diet = this.diets.find(
            (item) => item.id === dietId
        );

        const confirmed = confirm(
            diet
                ? `¿Desea eliminar la dieta "${diet.name}"?`
                : "¿Desea eliminar esta dieta?"
        );

        if (!confirmed) {
            return;
        }

        const response = await this.controller.delete(dietId);

        if (!response.success) {
            alert(response.message || "No fue posible eliminar la dieta.");
            return;
        }

        this.diets = this.diets.filter(
            (item) => item.id !== dietId
        );

        this.workspaceManager.render(
            this.view.render(this.diets)
        );

        this.registerEvents();
    }
}
