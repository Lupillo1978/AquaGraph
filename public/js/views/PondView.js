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

                        + Nuevo Estanque

                    </button>

                </div>

                <hr>

                <p class="text-secondary">

                    Seleccione un estanque en el mapa o cree uno nuevo.

                </p>

            </div>

        `;

    }

    return `

        <div class="p-3">

            <h4 class="mb-1">${pond.name}</h4>

            <span class="badge bg-success">Activo</span>

            <hr>

            <div class="mb-3">

                <strong>Superficie</strong><br>

                ${pond.metrics.area.toFixed(2)} ha

            </div>

            <div class="mb-4">

                <strong>Descripción</strong><br>

                ${pond.description || "Sin descripción"}

            </div>

            <hr>

            <h5>Alimentadores</h5>

            <div class="text-secondary mb-3">

                No existen alimentadores registrados.

            </div>

            <button
                id="btnAddFeeder"
                class="btn btn-primary w-100">

                + Agregar Alimentador

            </button>

            <hr class="mt-4">

            <h6 class="text-secondary">

                Próximamente

            </h6>

            <ul class="list-group">

                <li class="list-group-item">

                    📡 Sensores

                </li>

                <li class="list-group-item">

                    ⏰ Programación

                </li>

                <li class="list-group-item">

                    📊 Estadísticas

                </li>

            </ul>

        </div>



            `;

    }

}