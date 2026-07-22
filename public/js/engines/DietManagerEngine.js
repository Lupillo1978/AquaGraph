import DietManagerView from "../views/DietManagerView.js";

import DietEditorEngine from "./DietEditorEngine.js";

export default class DietManagerEngine {

    constructor(workspaceManager) {

        this.workspaceManager = workspaceManager;

        this.view = new DietManagerView();

         this.editor = new DietEditorEngine(workspaceManager);

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

                this.editor.show();

            }

        );

    }

}