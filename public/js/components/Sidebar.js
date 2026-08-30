/*La clase Sidebar se encarga de construir y controlar el menú lateral de navegación 
de la aplicación.
Dentro de su método render() realiza principalmente dos tareas:
Genera el HTML del menú lateral, incluyendo las opciones:
Dashboard,Estanques,Dietas,Alimentadores,Alimentación,AquaGraph,Configuración
Configura el botón de menú para dispositivos pequeños, permitiendo mostrar u 
ocultar el sidebar mediante la clase CSS sidebar-collapsed.
Además, algunos botones tienen identificadores como btnPonds, btnDiets y btnDietManager, 
lo que permite que otras partes de la aplicación puedan detectar sus clics y conectar 
cada opción con la funcionalidad correspondiente.
En pocas palabras, Sidebar funciona como el menú principal de navegación de AquaControl. 
Su responsabilidad es crear visualmente las opciones disponibles y proporcionar el mecanismo 
para contraer o expandir el menú en pantallas pequeñas.*/
export default class Sidebar {
    render() {
        document.getElementById("sidebar").innerHTML = `
            <div class="p-3">

                <!-- Encabezado del menú -->
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <h5 class="mb-1">Menú</h5>
                        <small class="text-muted">Accesos rápidos</small>
                    </div>

                    <button
                        id="sidebarToggle"
                        class="btn btn-sm btn-outline-light d-lg-none">
                        ☰
                    </button>
                </div>

                <!-- Opciones del menú -->
                <div id="sidebarMenu" class="sidebar-menu">

                    <button class="btn btn-info w-100 mb-2 text-start">
                        <i class="me-2">📊</i>Dashboard
                    </button>

                    <button
                        id="btnPonds"
                        class="btn btn-outline-light w-100 mb-2 text-start">
                        <i class="me-2">🏞️</i>Estanques
                    </button>

                    <button
                        id="btnDiets"
                        class="btn btn-outline-light w-100 mb-2 text-start">
                        <i class="me-2">🥗</i>Cambio
                    </button>

                    <button class="btn btn-outline-light w-100 mb-2 text-start">
                        <i class="me-2">⚙️</i>Alimentadores
                    </button>

                    <button
                        id="btnDietManager"
                        class="btn btn-outline-light w-100 mb-2 text-start">
                        <i class="me-2">🍽️</i>Dietas
                    </button>

                    <button class="btn btn-outline-light w-100 mb-2 text-start">
                        <i class="me-2">🌊</i>AquaGraph
                    </button>

                    <button class="btn btn-outline-light w-100 text-start">
                        <i class="me-2">🔧</i>Configuración
                    </button>

                </div>

            </div>
        `;

        // Referencias a los elementos del sidebar
        const toggle = document.getElementById("sidebarToggle");
        const sidebar = document.getElementById("sidebar");

        // Control de apertura y cierre del sidebar
        if (toggle && sidebar) {
            toggle.addEventListener("click", () => {
                sidebar.classList.toggle("sidebar-collapsed");
            });
        }
    }
}
