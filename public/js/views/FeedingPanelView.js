export default class FeedingPanelView {

    render(pond) {

        return `

<div class="p-3">

    <h5>

        Alimentación del Estanque

    </h5>

    <hr>

    <div class="card mb-3 shadow-sm">

        <div class="card-body">

            <strong>Estanque</strong>

            <br>

            ${pond.name}

            <hr>

            <strong>Alimentadores asignados</strong>

            <br>

            ${pond.feeders ? pond.feeders.length : 0}

        </div>

    </div>

    <div class="mb-3">

        <label class="form-label">

            Kg de alimento por día

        </label>

        <input

            id="dailyFood"

            type="number"

            class="form-control"

            placeholder="Ej. 120">

    </div>

<div class="mb-3">

        <label class="form-label">

            Dieta

        </label>

        <div class="d-flex gap-2">

            <select

                id="dietSelect"

                class="form-select">

                <option>

                    Seleccionar dieta...

                </option>

            </select>

            <button

                id="btnViewDietChart"

                type="button"

                class="btn btn-info btn-sm flex-shrink-0"

                title="Ver gráfico de la dieta seleccionada">

                📊

            </button>

        </div>

    </div>

    <div class="mb-3">

        <label class="form-label">

            Gramos por segundo

        </label>

        <input

            id="gramsPerSecond"

            type="number"

            step="0.1"

            class="form-control"

            placeholder="Ej. 22.5">

    </div>

    <div class="d-grid">

        <button

            id="btnSendRation"

            class="btn btn-success">

            Enviar Ración

        </button>

    </div>

    <hr>

<div class="card shadow-sm mb-3">

        <div class="card-body">

            <div class="d-flex justify-content-between align-items-center mb-2">

                <strong>Estado del Heltec</strong>

                <span id="bridgeStatusBadge" class="badge bg-secondary">Desconocido</span>

            </div>

<div id="bridgeStatus" class="small bridge-status-text">

                Verificando conexión...

            </div>

            <hr>

            <label class="form-label small mb-1 bridge-status-text">Puerto serial</label>

            <div class="input-group input-group-sm mb-2">

                <select id="bridgePortSelect" class="form-select">

                    <option value="">Cargando puertos...</option>

                </select>

                <button id="btnRefreshPorts" class="btn btn-outline-secondary" type="button" title="Actualizar puertos">

                    ⟳

                </button>

            </div>

            <div class="d-grid gap-2">

                <button id="btnConnectBridge" class="btn btn-primary btn-sm">

                    Conectar

                </button>

                <button id="btnDisconnectBridge" class="btn btn-outline-danger btn-sm">

                    Desconectar

                </button>

            </div>

        </div>

    </div>

    <div class="card shadow-sm">

        <div class="card-body">

            <strong>Estado de envío</strong>

<div id="feedingStatus" class="mt-2 small feeding-status-text">

                Esperando envío...

            </div>

            <hr>

            <div class="small feeding-status-text">Últimos ACKs</div>
            <ul id="ackList" class="mt-2 mb-0 ps-3 small feeding-status-text"></ul>

        </div>

    </div>

</div>

`;

    }

}