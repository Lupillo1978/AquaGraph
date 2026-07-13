export default class FeederView {

    render(feeder) {

        return `

            <div class="p-3">

                <h4 class="mb-1">

                    ${feeder.name}

                </h4>

                <span class="badge bg-primary">

                    Alimentador

                </span>

                <hr>

                <div class="mb-3">

                    <strong>Nodo LoRa</strong><br>

                    ${feeder.nodeId}

                </div>

                <div class="mb-3">

                    <strong>Estanque</strong><br>

                    ${feeder.pondId}

                </div>

                <div class="mb-3">

                    <strong>Posición</strong><br>

                    ${feeder.position.lat.toFixed(6)}<br>
                    ${feeder.position.lng.toFixed(6)}

                </div>

                <hr>

                <button
                    class="btn btn-warning w-100 mb-2">

                    Editar

                </button>

                <button
                    class="btn btn-danger w-100 mb-2">

                    Eliminar

                </button>

                <button
                    class="btn btn-success w-100">

                    Programación Timer

                </button>

            </div>

        `;

    }

}