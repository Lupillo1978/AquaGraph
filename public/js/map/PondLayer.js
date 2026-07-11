import EventTypes from "../core/EventTypes.js";

export default class PondLayer {

    constructor(map, layerGroup, eventBus) {

        this.map = map;

        this.layerGroup = layerGroup;

        this.eventBus = eventBus;

        this.selectedLayer = null;

    }

    addPond(pond) {

        const layer = L.geoJSON(pond.geometry, {

            style: {

                color: pond.color || "#2196F3",

                weight: 2,

                fillOpacity: 0.35

            }

        });

        layer.eachLayer((polygon) => {

            polygon.pond = pond;

            polygon.on("click", () => {

                this.select(polygon);

            });

        });

        layer.addTo(this.layerGroup);

    }

    select(layer) {

        if (this.selectedLayer) {

            this.selectedLayer.setStyle({

                color: this.selectedLayer.pond.color || "#2196F3",

                weight: 2

            });

        }

        this.selectedLayer = layer;

        layer.setStyle({

            color: "#FFD600",

            weight: 4

        });

        this.eventBus.emit(

            EventTypes.POND_SELECTED,

            layer.pond

        );

    }

}