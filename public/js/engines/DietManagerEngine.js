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

            this.view.render(

                diets

            )

        );

        this.registerEvents();

    }

    registerEvents() {

        document

            .getElementById(

                "btnNewDiet"

            )

            .addEventListener(

                "click",

                () => {

                    this.dietEngine.showEditor();

                }

            );



        document

            .querySelectorAll(

                ".diet-row"

            )

            .forEach(row => {

                row.addEventListener(

                    "click",

                    () => {

                        document

                            .querySelectorAll(

                                ".diet-row"

                            )

                            .forEach(r =>

                                r.classList.remove(

                                    "table-active"

                                )

                            );

                        row.classList.add(

                            "table-active"

                        );

                        console.log(

                            "Dieta seleccionada:",

                            row.dataset.id

                        );

                    }

                );

            });

        // Botones "Ver Gráfico"
        document

            .querySelectorAll(

                ".diet-chart-btn"

            )

            .forEach(btn => {

                btn.addEventListener(

                    "click",

                    (e) => {

                        e.stopPropagation();

                        const id = btn.dataset.id;

                        const diet = this.diets.find(

                            d => d.id === id

                        );

                        if (diet) {

                            this.dietChartModal.open(diet);

                        }

                    }

                );

            });

    }

}
