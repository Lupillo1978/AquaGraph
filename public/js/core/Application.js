import Logger from "./Logger.js";
import EventBus from "./EventBus.js";
import StateManager from "./StateManager.js";

import Header from "../components/Header.js";
import Sidebar from "../components/Sidebar.js";
import InfoPanel from "../components/InfoPanel.js";
import StatusBar from "../components/StatusBar.js";

import MapEngine from "../engines/MapEngine.js";

import PondEngine from "../engines/PondEngine.js";

export default class Application{

    constructor(){

        this.eventBus=new EventBus();

        this.state=new StateManager();

        this.header=new Header();

        this.sidebar=new Sidebar();

        this.infoPanel=new InfoPanel();

        this.statusBar=new StatusBar();

        this.map=new MapEngine("map");

        this.pondEngine = new PondEngine(this.infoPanel);

    }

    async start() {

    Logger.success("Iniciando AD&M AquaControl");

    this.header.render();

    this.sidebar.render();

    this.infoPanel.render();

    this.statusBar.render();

    this.map.initialize();

    this.pondEngine.initialize();

}

}