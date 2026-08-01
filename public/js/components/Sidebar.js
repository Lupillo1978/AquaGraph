export default class Sidebar {

    render() {

        document.getElementById("sidebar").innerHTML = `

        <div class="p-3">

            <div class="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h5 class="mb-1">Menú</h5>
                    <small class="text-muted">Accesos rápidos</small>
                </div>
                <button id="sidebarToggle" class="btn btn-sm btn-outline-light d-lg-none">
                    ☰
                </button>
            </div>

            <div id="sidebarMenu" class="sidebar-menu">

            <button class="btn btn-success w-100 mb-2 text-start">
                <i class="me-2">📊</i>Dashboard
            </button>

            <button id="btnPonds" class="btn btn-outline-light w-100 mb-2 text-start">
                <i class="me-2">🏞️</i>Estanques
            </button>

            <button id="btnDiets" class="btn btn-outline-light w-100 mb-2 text-start">
                <i class="me-2">🥗</i>Dietas
            </button>

            <button class="btn btn-outline-light w-100 mb-2 text-start">
                <i class="me-2">⚙️</i>Alimentadores
            </button>

            <button id="btnDietManager" class="btn btn-outline-light w-100 mb-2 text-start">
                <i class="me-2">🍽️</i>Alimentación
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

        const toggle = document.getElementById("sidebarToggle");
        const sidebar = document.getElementById("sidebar");

        if (toggle && sidebar) {
            toggle.addEventListener("click", () => {
                sidebar.classList.toggle("sidebar-collapsed");
            });
        }

    }

}