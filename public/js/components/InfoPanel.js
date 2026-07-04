import PondView from "../views/PondView.js";

export default class InfoPanel {

    constructor(){

        this.container = null;

        this.pondView = new PondView();

    }

    render(){

        this.container = document.getElementById("infoPanel");

        this.showWelcome();

    }

    showWelcome(){

        this.container.innerHTML = `

            <div class="p-3">

                <h5>AD&M AquaControl</h5>

                <hr>

                <p>

                    Seleccione un módulo desde el menú.

                </p>

            </div>

        `;

    }

    showPond(pond = null){

        this.container.innerHTML = this.pondView.render(pond);

    }

}