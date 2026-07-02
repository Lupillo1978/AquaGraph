export default class MapEngine {

    constructor(container){

        this.container=container;

        this.map=null;

    }

    initialize(){

        this.map=L.map(this.container);

        this.map.setView([26.000776,-109.387543],15);

        L.tileLayer(
                   "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                   {
                   attribution: "Tiles © Esri"
                   }
        
                ).addTo(this.map);
        

    }

}