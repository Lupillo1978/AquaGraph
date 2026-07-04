export default class MapEngine {

    constructor(container, eventBus){

        this.container=container;

        this.eventBus=eventBus;

        this.map=null;

        this.drawnItems = null;

    }

    initialize(){

        this.map=L.map(this.container);

        this.drawnItems = new L.FeatureGroup();

        this.map.addLayer(this.drawnItems);

        this.map.setView([26.000776,-109.387543],15);

        L.tileLayer(
                   "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                   {
                   attribution: "Tiles © Esri"
                   }
        
                ).addTo(this.map);
        
        const drawControl = new L.Control.Draw({

               draw:{

                 polyline:false,

                 rectangle:false,

                 circle:false,

                 marker:false,

                 circlemarker:false

                },

                edit:{

                    featureGroup:this.drawnItems

                }

            });

          this.map.addControl(drawControl);

          
          this.map.on(L.Draw.Event.CREATED, (event) => {

            const layer = event.layer;

            this.drawnItems.addLayer(layer);

            const geoJson = layer.toGeoJSON();

            console.log(geoJson);

            this.eventBus.emit(

            "pond:geometryCreated",

             geoJson

            );

        });

    }

}