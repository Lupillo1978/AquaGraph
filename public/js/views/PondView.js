export default class PondView {

    render(pond = null) {

        if (!pond) {

            return `

                <div class="p-3">

                    <h5>Estanques</h5>

                    <hr>

                    <p>No hay ningún estanque seleccionado.</p>

                </div>

            `;

        }

        return `

            <div class="p-3">

                <h5>${pond.name}</h5>

                <hr>

                <div class="mb-2">

                    <strong>Código</strong><br>

                    ${pond.code}

                </div>

                <div class="mb-2">

                    <strong>Área</strong><br>

                    ${pond.area} Ha

                </div>

                <div class="mb-2">

                    <strong>Estado</strong><br>

                    ${pond.status}

                </div>

                <hr>

                <button class="btn btn-success w-100 mb-2">

                    Alimentadores

                </button>

                <button class="btn btn-primary w-100 mb-2">

                    Programación

                </button>

                <button class="btn btn-warning w-100">

                    AquaGraph

                </button>

            </div>

        `;

    }

}