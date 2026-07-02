import Logger from "./Logger.js";
import EventBus from "./EventBus.js";
import StateManager from "./StateManager.js";
import MapEngine from "../engines/MapEngine.js";

export default class Application {

    constructor() {

        this.map=new MapEngine("map");

        this.eventBus = new EventBus();

        this.state = new StateManager();

        Logger.success("Application creada");

    }

    

    async start() {

        this.map.initialize();
        Logger.info("==============================");
        Logger.info("AD&M AquaControl");
        Logger.info("Versión 0.1");
        Logger.info("==============================");

        Logger.success("Inicialización completada");

    }

}