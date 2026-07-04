
import EventTypes from "../core/EventTypes.js";
export default class MapEngine {

    constructor(container, eventBus) {

        this.container = container;
        this.eventBus = eventBus;

        this.map = null;
        this.layers = {

            temporary: null,

            ponds: null,

            feeders: null

        };

        this.drawControl = null;  
    }

    initialize() {

        this.createMap();

        this.createLayers();
        
        this.createBaseMap();

        this.createDrawControls();

        this.registerEvents();

    }

    createMap() {

        this.map = L.map(this.container);

        this.map.setView([26.000776, -109.387543], 15);

    }

    createLayers() {

       this.layers.temporary = new L.FeatureGroup();

       this.layers.ponds = new L.FeatureGroup();

       this.layers.feeders = new L.FeatureGroup();

       this.map.addLayer(this.layers.temporary);

       this.map.addLayer(this.layers.ponds);

       this.map.addLayer(this.layers.feeders);

    }

    createBaseMap() {

        L.tileLayer(

            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",

            {

                attribution: "Tiles © Esri"

            }

        ).addTo(this.map);

    }

    createDrawControls() {

        this.drawControl = new L.Control.Draw({

            draw: {

                polyline: false,

                rectangle: false,

                circle: false,

                marker: false,

                circlemarker: false

            },

            edit: {

                featureGroup: this.layers.temporary

            }

        });

        this.map.addControl(this.drawControl);

    }

    registerEvents() {

        this.map.on(L.Draw.Event.CREATED, (event) => {

            const layer = event.layer;

            this.layers.temporary.addLayer(layer);

            const geoJson = layer.toGeoJSON();

            console.log(geoJson);

            this.eventBus.emit(

                 EventTypes.POND_GEOMETRY_CREATED,

                geoJson

            );

        });

        this.eventBus.on(

           EventTypes.MAP_DRAW_POLYGON,

              () => {

                    console.log("🗺️ Iniciar dibujo de polígono");

                }

        );

    }

}