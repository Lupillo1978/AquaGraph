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

    showCreatePondStep1() {

       document.getElementById("infoPanel").innerHTML = `

           <div class="p-3">

               <h5>Nuevo Estanque</h5>

               <hr>

               <div class="alert alert-info">

                   <strong>Paso 1 de 3</strong><br>

                   Dibuje el perímetro del estanque sobre el mapa.

               </div>

               <button
                   id="btnCancelCreatePond"
                   class="btn btn-secondary w-100">

                   Cancelar

               </button>

           </div>

       `;

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