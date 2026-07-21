import Logger from "./Logger.js";
import EventBus from "./EventBus.js";
import StateManager from "./StateManager.js";
import Header from "../components/Header.js";
import Sidebar from "../components/Sidebar.js";
import InfoPanel from "../components/InfoPanel.js";
import StatusBar from "../components/StatusBar.js";
import MapEngine from "../engines/MapEngine.js";
import PondEngine from "../engines/PondEngine.js";
import FeederEngine from "../engines/FeederEngine.js";
import DietEngine from "../engines/DietEngine.js";
import WorkspaceManager from "./WorkspaceManager.js";


export default class Application{

    constructor(){

        this.eventBus=new EventBus();

        this.state=new StateManager();

        this.header=new Header();

        this.sidebar=new Sidebar();

        this.infoPanel=new InfoPanel();

        this.workspaceManager = new WorkspaceManager(
        this.infoPanel
        );

        this.statusBar=new StatusBar();

        this.map=new MapEngine(
            
            "map",
        
            this.eventBus
        
        );

        this.pondEngine = new PondEngine(
            
            this.infoPanel,
        
            this.eventBus
        
        );
        
        this.feederEngine = new FeederEngine(

           this.infoPanel,

           this.eventBus

        );

        this.dietEngine = new DietEngine(

         this.workspaceManager

        );


    }

    async start() {

    Logger.success("Iniciando AD&M AquaControl");

    this.header.render();

    this.sidebar.render();

    this.infoPanel.render();

    this.statusBar.render();

    this.map.initialize();

    this.pondEngine.initialize();

    this.feederEngine.initialize();

    document

    .getElementById(

        "btnDiets"

    )

    .addEventListener(

        "click",

        () => {

            this.dietEngine.showEditor();

        }

    );

}

}