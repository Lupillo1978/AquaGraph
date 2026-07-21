import DietEditorView from "../views/DietEditorView.js";

import DietItemRow from "../views/DietItemRow.js";

export default class DietEngine {

    constructor(infoPanel) {

        this.infoPanel = infoPanel;

        this.view = new DietEditorView();

        this.items = [];

    }

    showEditor() {

        this.infoPanel.container.innerHTML =

            this.view.render();

        this.registerEvents();

    }

    registerEvents() {

        document

            .getElementById(

                "btnAddDietItem"

            )

            .addEventListener(

                "click",

                () => this.addItem()

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
    

}