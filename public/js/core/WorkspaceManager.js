/*Este administrador controla principalmente dos zonas de la interfaz:
MAPA   Y   WORKSPACE
El usuario puede pasar de una zona a otra mediante:
showWorkspace() y showMap()*/


export default class WorkspaceManager {

    constructor(infoPanel) {
        this.map = document.getElementById("map");
        this.workspace = document.getElementById("workspace");
        this.infoPanel = infoPanel;
    }

    showWorkspace() {
        this.map.classList.add("d-none");
        this.workspace.classList.remove("d-none");

        this.infoPanel.hide();
    }

    showMap() {
        this.workspace.classList.add("d-none");
        this.map.classList.remove("d-none");

        this.infoPanel.show();
    }

    render(content) {
        this.workspace.innerHTML = content;

        // Cuando se muestra el editor de dietas,
        // confinar el scroll a la tabla de bloques.
        // La clase también proporciona compatibilidad
        // con diferentes navegadores.
        this.workspace.classList.toggle(
            "diet-editor-mode",
            content.includes("diet-editor-shell")
        );
    }
}
