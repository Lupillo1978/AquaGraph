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

          <div class="p-3">

        <h5>${pond.name}</h5>

        <hr>

        <div class="mb-3">

            <strong>Superficie</strong><br>

            ${pond.metrics?.area?.toFixed(2) ?? "0.00"} ha

        </div>

        <div class="mb-3">

            <strong>Descripción</strong><br>

            ${pond.description || "Sin descripción"}

        </div>

    </div>

         
        `;

    }

}