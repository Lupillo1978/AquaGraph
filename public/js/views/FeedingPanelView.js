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

        <select

            id="dietSelect"

            class="form-select">

            <option>

                Seleccionar dieta...

            </option>

        </select>

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

            <div id="bridgeStatus" class="text-muted small">

                Verificando conexión...

            </div>

        </div>

    </div>

    <div class="card shadow-sm">

        <div class="card-body">

            <strong>Estado de envío</strong>

            <div id="feedingStatus" class="mt-2 text-muted small">

                Esperando envío...

            </div>

            <hr>

            <div class="small text-muted">Últimos ACKs</div>
            <ul id="ackList" class="mt-2 mb-0 ps-3 small text-muted"></ul>

        </div>

    </div>

</div>

`;

    }

}