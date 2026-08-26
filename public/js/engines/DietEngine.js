/*DietEngine funciona como el coordinador entre la vista, las filas de la dieta, 
la gráfica, el controlador y el WorkspaceManager.
DietEngine controla la creación, edición, cálculo, visualización y envío de una dieta.
Es decir, es el componente que coordina todo lo que sucede cuando el usuario 
abre el editor de dietas.*/

import DietEditorView from "../views/DietEditorView.js";
import DietItemRow from "../views/DietItemRow.js";
import DietChart from "./DietChart.js";
import DietController from "../controllers/DietController.js";


export default class DietEngine {

    constructor(workspaceManager, manager = null) {
        this.workspaceManager = workspaceManager;
        this.manager = manager;

        this.view = new DietEditorView();
        this.chart = new DietChart();

        this.items = [];

        this.controller = new DietController();
    }

    showEditor() {
        this.workspaceManager.showWorkspace();

        this.workspaceManager.render(
            this.view.render()
        );

        this.chart.initialize();

        this.registerEvents();
    }

    registerEvents() {

        // =====================================================
        // Guardar dieta
        // =====================================================

        document
            .getElementById("btnSaveDiet")
            .addEventListener("click", async () => {

                const diet = this.buildDiet();

                console.log("Enviando dieta...", diet);

                try {
                    const response = await this.controller.create(
                        diet
                    );

                    console.log("Respuesta:", response);

                    if (response.success) {
                        if (this.manager) {
                            this.manager.show();
                        }
                    }

                } catch (error) {
                    console.error(error);
                }
            });


        // =====================================================
        // Agregar bloque
        // =====================================================

        document
            .getElementById("btnAddDietItem")
            .addEventListener("click", () => {
                this.addItem();
            });


        // =====================================================
        // Cancelar
        // =====================================================

        document
            .getElementById("btnCancelDiet")
            .addEventListener("click", () => {

                if (this.manager) {
                    this.manager.show();
                }
            });
    }

    addItem() {
        this.items.push({
            start: "09:00",
            end: "10:00",
            percentage: 0,
            interval: 10
        });

        this.renderItems();
        this.updateSummary();
    }

    renderItems() {
        const tbody = document.getElementById("dietItems");

        tbody.innerHTML = "";

        this.items.forEach((item, index) => {
            const row = new DietItemRow(
                item,
                index
            );

            tbody.innerHTML += row.render();
        });

        this.registerItemEvents();
    }

    registerItemEvents() {

        document
            .querySelectorAll("#dietItems tr")
            .forEach((row) => {

                const index = Number(
                    row.dataset.index
                );

                const item = this.items[index];


                // Hora de inicio
                row
                    .querySelector(".diet-start")
                    .addEventListener("change", (event) => {

                        item.start = event.target.value;

                        this.updateSummary();
                    });


                // Hora de finalización
                row
                    .querySelector(".diet-end")
                    .addEventListener("change", (event) => {

                        item.end = event.target.value;

                        this.updateSummary();
                    });


                // Porcentaje
                row
                    .querySelector(".diet-percentage")
                    .addEventListener("input", (event) => {

                        item.percentage = Number(
                            event.target.value
                        );

                        this.updateSummary();
                    });


                // Intervalo
                row
                    .querySelector(".diet-interval")
                    .addEventListener("input", (event) => {

                        item.interval = Number(
                            event.target.value
                        );

                        this.updateSummary();
                    });
            });
    }

    calculateShots(item) {
        const startMinutes = this.timeToMinutes(
            item.start
        );

        const endMinutes = this.timeToMinutes(
            item.end,
            true
        );

        const duration = endMinutes - startMinutes;

        if (
            duration <= 0 ||
            item.interval <= 0
        ) {
            return 0;
        }

        return Math.floor(
            duration / item.interval
        );
    }

    buildDailySchedule() {
        const schedule = [];

        this.items.forEach((item) => {

            const realShots = [];

            let current = this.timeToMinutes(
                item.start
            );

            // "00:00" como hora de fin representa
            // el final del día (24:00).
            const end = this.timeToMinutes(
                item.end,
                true
            );

            const interval = Number(
                item.interval
            );

            if (interval <= 0) {
                return;
            }

            while (current < end) {
                realShots.push(current);

                current += interval;
            }

            if (realShots.length === 0) {
                return;
            }

            // Distribuir el porcentaje entre los
            // disparos reales generados.
            const foodPerShot =
                Number(item.percentage) /
                realShots.length;

            realShots.forEach((minute) => {

                schedule.push({
                    minute,
                    percentage: foodPerShot,
                    interval
                });
            });
        });

        return schedule.sort(
            (a, b) => a.minute - b.minute
        );
    }

    timeToMinutes(time, isEnd = false) {
        const parts = time.split(":");

        let hours = Number(parts[0]);
        const minutes = Number(parts[1]);

        // "00:00" usado como fin representa
        // el final del día (24:00).
        if (
            isEnd &&
            hours === 0 &&
            minutes === 0
        ) {
            hours = 24;
        }

        return hours * 60 + minutes;
    }

    updateSummary() {
        let totalPercentage = 0;
        let totalShots = 0;

        const rows = document.querySelectorAll(
            "#dietItems tr"
        );

        this.items.forEach((item, index) => {

            const shots = this.calculateShots(item);

            totalPercentage += Number(
                item.percentage
            );

            totalShots += shots;

            const row = rows[index];

            if (!row) {
                return;
            }

            row
                .querySelector(".diet-shots")
                .textContent = shots;

            const status = row.querySelector(
                ".diet-status"
            );

            if (Number(item.percentage) > 0) {
                status.textContent = "🟢";
            } else {
                status.textContent = "⚪";
            }
        });


        // Porcentaje total
        document.getElementById(
            "dietPercentage"
        ).textContent = totalPercentage + " %";


        // Total de disparos
        const totalShotsLabel =
            document.getElementById("dietShots");

        if (totalShotsLabel) {
            totalShotsLabel.textContent = totalShots;
        }


        // Construir programación diaria
        const schedule =
            this.buildDailySchedule();

        console.log(
            "Schedule:",
            schedule
        );

        // Actualizar gráfica
        this.chart.update(schedule);
    }

    buildDiet() {
        return {
            name: document
                .getElementById("dietName")
                .value
                .trim(),

            description: document
                .getElementById("dietDescription")
                .value
                .trim(),

            blocks: this.items
        };
    }
}
