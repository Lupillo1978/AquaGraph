import EventTypes from "../core/EventTypes.js";
import FeederController from "../controllers/FeederController.js";
import FeederSelection from "../modules/feeders/FeederSelection.js";

export default class FeederEngine {

    constructor(infoPanel, eventBus) {

        this.infoPanel = infoPanel;

        this.eventBus = eventBus;

        this.controller = new FeederController();

        this.feeders = [];

        this.selection = new FeederSelection(

        this.infoPanel,

        this.eventBus

        );

        this.selectedPond = null;

        this.currentPosition = null;

        this.editingFeeder = null;

    }

    
    async initialize() {

              this.selection.initialize();

              this.registerEvents();

              await this.loadFeeders();

            }
       




    async loadFeeders() {

    const response = await this.controller.getAll();

    if (!response.success) {

        return;

    }

    this.feeders = response.data;

    console.log(

        "Alimentadores cargados:",

        this.feeders

    );

    this.feeders.forEach(feeder => {

        this.eventBus.emit(

            EventTypes.FEEDER_CREATED,

            feeder

        );

    });

}

    registerEvents() {

        // Estanque seleccionado
this.eventBus.on(

    EventTypes.POND_SELECTED,

    (pond) => {

        this.selectedPond = pond;

        // Obtener únicamente los alimentadores
        // pertenecientes a este estanque.
        pond.feeders = this.feeders.filter(

            feeder => feeder.pondId === pond.id

        );

        console.log(

            "Alimentadores del estanque:",

            pond.feeders

        );

        // Actualizar nuevamente el panel
        this.infoPanel.showPond(pond);

    }

   

);



        // Posición seleccionada en el mapa
        this.eventBus.on(

    EventTypes.FEEDER_POSITION_SELECTED,

    ({ pond, latlng }) => {

        this.selectedPond = pond;

        this.currentPosition = {

            lat: latlng.lat,

            lng: latlng.lng

        };

        this.infoPanel.showCreateFeederForm(

            pond

        );

    }

);

        // Botón Agregar Alimentador
        document.addEventListener("click", (event) => {

            if (event.target.id !== "btnAddFeeder") {

                return;

            }

            this.startCreateFeeder();

        });

        // Botón Guardar Alimentador
        document.addEventListener("click", async (event) => {

            if (event.target.id !== "btnSaveFeeder") {

                return;

            }

            await this.saveFeeder();

        });

        // ==================================================
        // Botón Eliminar Alimentador
        // ==================================================

        document.addEventListener("click", async (event) => {

              if (event.target.id !== "btnDeleteFeeder") {

               return;

              }

            const feederId = event.target.dataset.feederId;

              await this.deleteFeeder(feederId);

        });

        // ==================================================
        // Selección de alimentador desde la lista
        // ==================================================

        document.addEventListener("click", (event) => {

           const feederItem = event.target.closest(".feeder-item");

               if (!feederItem) {

                return;

             }

           const feederId = feederItem.dataset.feederId;

           const feeder = this.feeders.find(

              item => item.id === feederId

            );

           if (!feeder) {

              return;

            }

    console.log(

        "Alimentador seleccionado:",

        feeder

    );

    this.eventBus.emit(

        EventTypes.FEEDER_SELECTED,

        feeder

    );

});


// ==================================================
// Editar alimentador
// ==================================================

document.addEventListener("click", (event) => {

    if (event.target.id !== "btnEditFeeder") {

        return;

    }

    const feederId = event.target.dataset.feederId;

    const feeder = this.feeders.find(

        item => item.id === feederId

    );

    if (!feeder) {

        return;

    }

    this.openEditFeeder(

        feeder

    );

});


        // Botón Cancelar
        document.addEventListener("click", (event) => {

            if (event.target.id !== "btnCancelCreateFeeder") {

                return;

            }

            this.cancelCreateFeeder();

        });

    }

    startCreateFeeder() {

        if (!this.selectedPond) {

            alert("Seleccione primero un estanque.");

            return;

        }

        console.log("Iniciando creación de alimentador...");

        this.currentPosition = null;

        this.infoPanel.showCreateFeederStep1(

            this.selectedPond

        );

        this.eventBus.emit(

            EventTypes.MAP_PLACE_FEEDER,

            this.selectedPond

        );

    }

    async saveFeeder() {

        if (!this.currentPosition) {

            alert(

                "Seleccione la ubicación del alimentador sobre el mapa."

            );

            return;

        }

        const feederName = document
            .getElementById("feederName")
            .value
            .trim();

        if (feederName === "") {

            alert(

                "Capture el nombre del alimentador."

            );

            return;

        }

        if (this.editingFeeder) {

    return await this.updateFeeder();

}

        const feeder = {

            pondId: this.selectedPond.id,

            name: feederName,

            nodeId: document
                .getElementById("feederNode")
                .value
                .trim(),

            position: this.currentPosition,

            settings: {

                radius: Number(

                    document.getElementById("feederRadius").value

                ),

                orientation: Number(

                    document.getElementById("feederOrientation").value

                )

            }

        };

        try {

            const response = await this.controller.create(

                feeder

            );

            console.log(

                "Respuesta servidor:",

                response

            );

            if (!response.success) {

                alert(

                    "No fue posible guardar el alimentador."

                );

                return;

            }

            this.eventBus.emit(

                EventTypes.FEEDER_CREATED,

                response.data

            );

            this.reset();

            this.infoPanel.showPond(

                this.selectedPond

            );

        }
        catch (error) {

            console.error(error);

            alert(

                "Error al comunicarse con el servidor."

            );

        }

    }


    async updateFeeder() {

    const feeder = {

        ...this.editingFeeder,

        name: document.getElementById(

            "feederName"

        ).value.trim(),

        nodeId: document.getElementById(

            "feederNode"

        ).value.trim(),

        settings: {

            radius: Number(

                document.getElementById(

                    "feederRadius"

                ).value

            ),

            orientation: Number(

                document.getElementById(

                    "feederOrientation"

                ).value

            )

        }

    };

    console.log(

        "Enviando actualización:",

        feeder

    );

   const response = await this.controller.update(

    feeder.id,

    feeder

);

if (!response.success) {

    alert(response.message);

    return;

}

// Actualizar el arreglo local

const index = this.feeders.findIndex(

    item => item.id === response.data.id

);

if (index !== -1) {

    this.feeders[index] = response.data;

}

console.log(

    "✅ Alimentador actualizado:",

    response.data

);

this.eventBus.emit(

    EventTypes.FEEDER_UPDATED,

    response.data

);

}


    openEditFeeder(feeder) {


    this.selectedPond = {

        id: feeder.pondId,

        name: feeder.pondId

    };

    this.currentPosition = feeder.position;

    this.editingFeeder = feeder;

    this.infoPanel.showCreateFeederForm(

        this.selectedPond,

        feeder

    );

   
}


    cancelCreateFeeder() {

        this.reset();

        if (this.selectedPond) {

            this.infoPanel.showPond(

                this.selectedPond

            );

        }
        else {

            this.infoPanel.showWelcome();

        }

    }

    reset() {

        this.currentPosition = null;

    }


    async deleteFeeder(feederId) {

    const confirmed = confirm(

        "¿Desea eliminar este alimentador?"

    );

    if (!confirmed) {

        return;

    }

    const response = await this.controller.delete(

        feederId

    );

    if (!response.success) {

        alert(response.message);

        return;

    }

    // Eliminar del arreglo local
    this.feeders = this.feeders.filter(

        feeder => feeder.id !== feederId

    );

 // Obtener el estanque al que pertenecía
const pond = this.selectedPond;

if (pond) {

    // Actualizar la lista de alimentadores
    pond.feeders = this.feeders.filter(

        feeder => feeder.pondId === pond.id

    );

}

// Notificar al resto de la aplicación
this.eventBus.emit(

    EventTypes.FEEDER_DELETED,

    feederId

);

// Regresar el panel al estanque
if (pond) {

    this.infoPanel.showPond(

        pond

    );

}

console.log(

    "Alimentador eliminado:",

    feederId

);

}


}