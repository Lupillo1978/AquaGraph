import PondView from "../views/PondView.js";
import FeederView from "../views/FeederView.js";

export default class InfoPanel {

    constructor() {
        this.container = null;
        this.pondView = new PondView();
        this.feederView = new FeederView();
    }

    render() {
        this.container = document.getElementById("infoPanel");
        this.showWelcome();
    }

    // ESTANQUES
    
    showCreatePondStep1() {
        this.container.innerHTML = `
            <div class="p-3">                
                <h5>Nuevo Estanque</h5>
                <hr>
            
                <div class="alert alert-info">
                    <strong>Paso 1 de 3</strong><br>
                    Dibuje el perímetro del estanque sobre el mapa.
                </div>

                <button
                    id="btnCancelCreatePond"
                    class="btn btn-secondary w-100">
                    Cancelar
                </button>
            </div>
        `;
    }

    // ALIMENTADORES

    showCreateFeederStep1(pond) {
        this.container.innerHTML = `
            <div class="p-3">
                <h5>Nuevo Alimentador</h5>
                <hr>

                <div class="alert alert-info">
                    <strong>Paso 1 de 2</strong><br>
                    Seleccione la ubicación del alimentador haciendo clic dentro del estanque
                    <strong>${pond.name}</strong>.
                </div>

                <button
                    id="btnCancelCreateFeeder"
                    class="btn btn-secondary w-100">
                    Cancelar
                </button>
            </div>
        `;
    }

    showCreateFeederForm(pond, feeder = null) {
        this.container.innerHTML = `
            <div class="p-3">
                <h5>Nuevo Alimentador</h5>
                <hr>

                <div class="alert alert-success">
                    <strong>Paso 2 de 2</strong><br>
                    Capture la información del alimentador para el estanque
                    <strong>${pond.name}</strong>.
                </div>

                <div class="mb-3">
                    <label class="form-label">
                        Nombre
                    </label>

                    <input
                         id="feederName"
                         class="form-control"
                         value="${feeder ? feeder.name : ""}"
                         placeholder="Ej. Alimentador Norte">
                </div>

                <div class="mb-3">
                    <label class="form-label">
                        Nodo LoRa
                    </label>

                    <input
                         id="feederNode"
                         class="form-control"
                         value="${feeder ? feeder.nodeId : ""}"
                         placeholder="Ej. 101">
                </div>

                <div class="mb-3">
                    <label class="form-label">
                        Radio de lanzamiento (m)
                    </label>

                    <input
                        id="feederRadius"
                        type="number"
                        class="form-control"
                        value="${feeder ? feeder.settings.radius : 25}">
                </div>

                <div class="mb-3">
                    <label class="form-label">
                        Orientación (°)
                    </label>

                    <input
                        id="feederOrientation"
                        type="number"
                        class="form-control"
                        value="${feeder ? feeder.settings.orientation : 0}">
                </div>

                <div class="d-grid gap-2">
                    <button
                        id="btnSaveFeeder"
                        class="btn btn-success">
                        ${feeder ? "Actualizar Alimentador" : "Guardar Alimentador"}
                    </button>

                    <button
                        id="btnCancelCreateFeeder"
                        class="btn btn-secondary">
                        Cancelar
                    </button>
                </div>
            </div>
        `;
    }

    // PANTALLAS GENERALES

    showWelcome() {
        this.container.innerHTML = `
            <div class="p-3">
                <h5>AD&M AquaControl</h5>
                <hr>
                <p>Seleccione un módulo desde el menú.</p>
            </div>
        `;
    }

    showPond(pond = null) {
        console.log("InfoPanel recibió:", pond);
        this.container.innerHTML = this.pondView.render(pond);
    }

    showFeeder(feeder) {
      console.log("InfoPanel recibió alimentador:",feeder);
      this.container.innerHTML =  this.feederView.render(feeder);
    }
}