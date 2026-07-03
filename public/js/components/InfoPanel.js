export default class InfoPanel {

    render() {

        this.showHome();

    }

    showHome() {

        document.getElementById("infoPanel").innerHTML = `

            <div class="p-3">

                <h5>Información</h5>

                <hr>

                Seleccione un estanque o alimentador.

            </div>

        `;

    }

    showPonds(){

     document.getElementById("infoPanel").innerHTML=`

        <div class="p-3">

            <h5>Gestión de Estanques</h5>

            <hr>

            <button
                id="btnNewPond"
                class="btn btn-success w-100 mb-3">

                + Nuevo Estanque

            </button>

            <div class="card bg-dark text-white border-secondary">

                <div class="card-header">

                    Estanques

                </div>

                <div
                    id="pondList"
                    class="card-body">

                    <div class="text-center text-secondary">

                        No existen estanques registrados.

                    </div>

                </div>

                <div class="card-footer">

                    Total:
                    <span id="pondCount">

                        0

                    </span>

                </div>

            </div>

        </div>

      `;

    }

}