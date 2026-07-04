export default class PondView {

    render(pond = null) {

        if (!pond) {

            return `

                <div class="p-3">

                    <div class="d-flex justify-content-between align-items-center mb-3">

                        <h5 class="mb-0">Estanques</h5>

                        <button
                            id="btnNewPond"
                            class="btn btn-success btn-sm">

                            + Nuevo

                        </button>

                    </div>

                    <hr>

                    <p class="text-secondary">

                        No hay ningún estanque seleccionado.

                    </p>

                </div>

            `;

        }

        return `

            <!-- La vista del estanque seleccionado la dejaremos igual por ahora -->

        `;

    }

}