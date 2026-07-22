import DietEditorView from "../views/DietEditorView.js";

import DietItemRow from "../views/DietItemRow.js";

import DietChart from "./DietChart.js";

export default class DietEngine {

    constructor(workspaceManager, manager = null) {

       this.workspaceManager = workspaceManager;

       this.manager = manager;

       this.view = new DietEditorView();

       this.chart = new DietChart();

       this.items = [];

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

        document

    .getElementById(

        "btnSaveDiet"

    )

    .addEventListener(

        "click",

        () => {

            const diet = this.buildDiet();

            console.log(

                "DIETA",

                diet

            );

        }

    );

        document

            .getElementById(

                "btnAddDietItem"

            )

            .addEventListener(

                "click",

                () => this.addItem()

            );

      const btnCancel = document.getElementById("btnCancelDiet");

console.log("Botón Cancelar:", btnCancel);

btnCancel.addEventListener("click", () => {

    console.log("CLICK en Cancelar");

    console.log("Manager:", this.manager);

    if (this.manager) {

        console.log("Abriendo administrador...");

        this.manager.show();

    } else {

        console.log("Manager es NULL");

    }

});
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
    
updateSummary() {

    let totalPercentage = 0;

    let totalShots = 0;

    this.items.forEach(item => {

        totalPercentage += Number(item.percentage);

        totalShots += this.calculateShots(item);

    });

    document.getElementById(

        "dietPercentage"

    ).textContent =

        totalPercentage + " %";

    const shots = document.getElementById(

        "dietShots"

    );

    if (shots) {

        shots.textContent = totalShots;

    }

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