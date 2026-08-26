/*La clase Application funciona como el controlador principal o punto 
de entrada de la aplicación AD&M AquaControl.
Su responsabilidad principal es crear, conectar e inicializar los 
diferentes componentes, gestores y motores de la aplicación.
¿Qué hace?
Crea el sistema de eventos mediante EventBus.
Inicializa el administrador del estado con StateManager.
Crea los componentes visuales:Header,Sidebar,InfoPanel,StatusBar
Crea el WorkspaceManager, encargado de gestionar el espacio de trabajo.
Inicializa los motores relacionados con:El mapa (MapEngine).
Los estanques (PondEngine).Los alimentadores (FeederEngine).
Las dietas (DietEngine).El administrador de dietas (DietManagerEngine).
En el método start():Muestra un mensaje indicando que la aplicación está iniciando.
Renderiza los componentes de la interfaz.Inicializa los motores principales.
Configura los eventos de los botones btnDietManager y btnDiets.
Permite abrir el administrador de dietas o el editor de dietas.
En términos sencillos, Application es el orquestador de la aplicación: 
no realiza directamente las operaciones de mapas, estanques, alimentación o dietas, 
sino que crea cada módulo, establece sus dependencias y coordina su 
inicialización y comunicación.*/
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
import DietManagerEngine from "../engines/DietManagerEngine.js";

import WorkspaceManager from "./WorkspaceManager.js";


export default class Application {

    constructor() {
        // Core services
        this.eventBus = new EventBus();
        this.state = new StateManager();

        // UI components
        this.header = new Header();
        this.sidebar = new Sidebar();
        this.infoPanel = new InfoPanel();
        this.statusBar = new StatusBar();

        // Workspace management
        this.workspaceManager = new WorkspaceManager(
            this.infoPanel
        );

        // Engines
        this.dietManager = new DietManagerEngine(
            this.workspaceManager
        );

        this.map = new MapEngine(
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

        // Renderizar interfaz
        this.header.render();
        this.sidebar.render();
        this.infoPanel.render();
        this.statusBar.render();

        // Inicializar motores
        this.map.initialize();
        this.pondEngine.initialize();
        this.feederEngine.initialize();

        // Eventos de navegación
        document
            .getElementById("btnDietManager")
            .addEventListener("click", () => {
                this.dietManager.show();
            });

        document
            .getElementById("btnDiets")
            .addEventListener("click", () => {
                this.dietEngine.showEditor();
            });
    }
}
