
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
        
        this.drawTools = {
            polygon: null
        };

        this.selectedPondLayer = null;
        
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

    getDefaultPondStyle() {

     return {

        color: "#00ff88",

        weight: 2,

        fillColor: "#00cc66",

        fillOpacity: 0.35

     };

    }

    getSelectedPondStyle() {

     return {

        color: "#FFD700",

        weight: 3,

        fillColor: "#FFD700",

        fillOpacity: 0.50

     };

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

        this.drawTools.polygon = new L.Draw.Polygon(this.map);
        

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

                     this.startPolygonDrawing();

                }

        );

        this.eventBus.on(

           EventTypes.MAP_ADD_POND,

             (pond) => {

                  this.addPondToMap(pond);

                }

        );

        this.eventBus.on(

          EventTypes.MAP_CLEAR_TEMPORARY,

           () => {

              this.layers.temporary.clearLayers();

            }

        );

    }

    startPolygonDrawing() {
             
      this.drawTools.polygon.enable();

    }

    addPondToMap(pond) {

            // Verificar si ya existe
             let exists = false;

             this.layers.ponds.eachLayer(layer => {

                if (layer.pondId === pond.id) {

                 exists = true;

                }

              });

              if (exists) {

               return;

              }

             const layer = L.geoJSON(pond.geometry, {

             style: this.getDefaultPondStyle()

              });

             layer.pondId = pond.id;

             layer.bindTooltip(pond.name);

            // Guardar la información completa del estanque
            layer.pond = pond;

            // Evento de selección
            layer.on("click", () => {

            this.selectPond(layer);
            
            this.eventBus.emit(

            EventTypes.POND_SELECTED,

            pond

            );

            });

          layer.addTo(this.layers.ponds);

        }
 
        selectPond(layer) {

    // Si había un estanque seleccionado,
    // restaurar su estilo original.
    if (this.selectedPondLayer) {

        this.selectedPondLayer.setStyle(
            this.getDefaultPondStyle()
        );

    }

    // Guardar la nueva selección.
    this.selectedPondLayer = layer;

    // Aplicar el estilo de seleccionado.
    this.selectedPondLayer.setStyle(
        this.getSelectedPondStyle()
    );

}

}