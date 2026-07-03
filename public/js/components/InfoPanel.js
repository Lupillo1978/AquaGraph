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

    showPonds() {

        document.getElementById("infoPanel").innerHTML = `

            <div class="p-3">

                <h5>Gestión de Estanques</h5>

                <hr>

                <button
                    class="btn btn-success w-100 mb-3">

                    + Nuevo Estanque

                </button>

                <div id="pondList">

                    No hay estanques registrados.

                </div>

            </div>

        `;

    }

}