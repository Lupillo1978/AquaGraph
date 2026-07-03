export default class Sidebar{

    render(){

        document.getElementById("sidebar").innerHTML=`

        <div class="p-3">

            <h5>Menú</h5>

            <hr>

            <button class="btn btn-success w-100 mb-2">

                Dashboard

            </button>

            <button id="btnPonds" class="btn btn-outline-light w-100 mb-2">

                Estanques

            </button>

            <button class="btn btn-outline-light w-100 mb-2">

                Alimentadores

            </button>

            <button class="btn btn-outline-light w-100 mb-2">

                Programación

            </button>

            <button class="btn btn-outline-light w-100 mb-2">

                AquaGraph

            </button>

            <button class="btn btn-outline-light w-100">

                Configuración

            </button>

        </div>

        `;

    }

}