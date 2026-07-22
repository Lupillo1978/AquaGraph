import DietManagerView from "../views/DietManagerView.js";

import DietEngine from "./DietEngine.js";

export default class DietManagerEngine {

    constructor(workspaceManager) {

        this.workspaceManager = workspaceManager;

        this.view = new DietManagerView();

        this.dietEngine = new DietEngine(

          workspaceManager,

          this

        );

    }

    show() {

        this.workspaceManager.showWorkspace();

        this.workspaceManager.render(

            this.view.render()

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

    }

}