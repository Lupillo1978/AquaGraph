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

    // ==========================
    // Guardar Dieta
    // ==========================

    document

        .getElementById(

            "btnSaveDiet"

        )

        .addEventListener(

            "click",

            async () => {

                const diet = this.buildDiet();

                console.log(

                    "Enviando dieta...",

                    diet

                );

                try {

                    const response = await this.controller.create(

                        diet

                    );

                    console.log(

                        "Respuesta:",

                        response

                    );

                    if (response.success) {

                        this.manager.show();

                    }

                }

                catch (error) {

                    console.error(error);

                }

            }

        );



    // ==========================
    // Agregar Bloque
    // ==========================

    document

        .getElementById(

            "btnAddDietItem"

        )

        .addEventListener(

            "click",

            () => this.addItem()

        );



    // ==========================
    // Cancelar
    // ==========================

    document

        .getElementById(

            "btnCancelDiet"

        )

        .addEventListener(

            "click",

            () => {

                if (this.manager) {

                    this.manager.show();

                }

            }

        );

}

    addItem() {

        this.items.push({

            start:"09:00",

            end:"10:00",

            percentage:0,

            interval:10

        });

        this.renderItems();

        this.updateSummary();

    }


    renderItems() {

    const tbody = document.getElementById(

        "dietItems"

    );

    tbody.innerHTML = "";

    this.items.forEach(

        (item,index)=>{

            const row = new DietItemRow(

                item,

                index

            );

            tbody.innerHTML += row.render();

        }

    );

    this.registerItemEvents();

}

registerItemEvents() {

    document

        .querySelectorAll(

            "#dietItems tr"

        )

        .forEach(

            row => {

                const index = Number(

                    row.dataset.index

                );

                const item = this.items[index];

                row

                    .querySelector(".diet-start")

                    .addEventListener(

                        "change",

                        e => {

                            item.start = e.target.value;

                            this.updateSummary();

                        }

                    );

                row

                    .querySelector(".diet-end")

                    .addEventListener(

                        "change",

                        e => {

                            item.end = e.target.value;

                            this.updateSummary();

                        }

                    );

                row

                    .querySelector(".diet-percentage")

                    .addEventListener(

                        "input",

                        e => {

                            item.percentage = Number(

                                e.target.value

                            );

                            this.updateSummary();

                        }

                    );

                row

                    .querySelector(".diet-interval")

                    .addEventListener(

                        "input",

                        e => {

                            item.interval = Number(

                                e.target.value

                            );

                            this.updateSummary();

                        }

                    );

            }

        );

}

calculateShots(item) {

    const start = item.start.split(":");

    const end = item.end.split(":");

    const startMinutes =

        Number(start[0]) * 60 +

        Number(start[1]);

    const endMinutes =

        Number(end[0]) * 60 +

        Number(end[1]);

    const duration =

        endMinutes -

        startMinutes;

    if (

        duration <= 0 ||

        item.interval <= 0

    ) {

        return 0;

    }

    return Math.floor(

        duration /

        item.interval

    );

}

buildDailySchedule() {

    const schedule = [];

    this.items.forEach(item => {

        const shots = this.calculateShots(item);

        if (shots <= 0) {

            return;

        }

        const foodPerShot =

            Number(item.percentage) / shots;

        let current = this.timeToMinutes(item.start);

        const end = this.timeToMinutes(item.end);

        while (current < end) {

            schedule.push({

                minute: current,

                percentage: foodPerShot

            });

            current += Number(item.interval);

        }

    });

    return schedule.sort(

        (a, b) => a.minute - b.minute

    );

}

timeToMinutes(time) {

    const parts = time.split(":");

    return Number(parts[0]) * 60 +

           Number(parts[1]);

}

updateSummary() {

    let totalPercentage = 0;

    let totalShots = 0;

    const rows = document.querySelectorAll(

        "#dietItems tr"

    );

    this.items.forEach((item, index) => {

        const shots = this.calculateShots(item);

        totalPercentage += Number(item.percentage);

        totalShots += shots;

        const row = rows[index];

        if (!row) return;

        row.querySelector(".diet-shots").textContent = shots;

        const status = row.querySelector(".diet-status");

        if (Number(item.percentage) > 0) {

            status.textContent = "🟢";

        } else {

            status.textContent = "⚪";

        }

    });

    document.getElementById(

        "dietPercentage"

    ).textContent = totalPercentage + " %";

    const totalShotsLabel = document.getElementById(

        "dietShots"

    );

    if (totalShotsLabel) {

        totalShotsLabel.textContent = totalShots;

    }

   const schedule = this.buildDailySchedule();

console.log("Schedule:", schedule);

this.chart.update(schedule);
}

buildDiet() {

    return {

        name: document

            .getElementById(

                "dietName"

            ).value.trim(),

        description: document

            .getElementById(

                "dietDescription"

            ).value.trim(),

        blocks: this.items

    };

}

}