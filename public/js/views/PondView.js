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

${
    pond.feeders && pond.feeders.length > 0

    ?

    `

        <div class="list-group mb-3">

            ${pond.feeders.map(feeder => `

                <button
                    class="list-group-item list-group-item-action feeder-item"
                    data-feeder-id="${feeder.id}">

                    <div class="d-flex justify-content-between">

                        <strong>

                            ⚙ ${feeder.name}

                        </strong>

                        <small>

                            Nodo ${feeder.nodeId}

                        </small>

                    </div>

                </button>

            `).join("")}

        </div>

    `

    :

    `

        <div class="text-secondary mb-3">

            No existen alimentadores registrados.

        </div>

    `

}

                <button
                   id="btnAddFeeder"
                   class="btn btn-primary w-100">

                   + Agregar Alimentador

              </button>


            <hr class="mt-4">

<h6>

    Operaciones

</h6>

<div class="list-group">

    <button

        id="btnOpenFeeding"

        class="list-group-item list-group-item-action">

        🍤 Alimentación

    </button>

    <button

        class="list-group-item list-group-item-action"

        disabled>

        📡 Sensores

    </button>

    <button

        class="list-group-item list-group-item-action"

        disabled>

        ⏰ Programación

    </button>

    <button

        class="list-group-item list-group-item-action"

        disabled>

        📊 Estadísticas

    </button>

</div>

        </div>



            `;

    }

}