/*Header es la clase encargada de generar y actualizar la 
barra superior de la aplicación.
Sus funciones principales son:
render() crea el encabezado dentro del elemento #header.
Muestra el nombre AD&M AquaControl y el usuario Operador.
Crea el elemento donde se mostrará el reloj.
updateClock() obtiene la fecha y hora actuales y las muestra 
en formato DD/MM/AAAA HH:MM:SS.
Utiliza setInterval() para actualizar el reloj cada segundo.
En pocas palabras: Header controla la interfaz superior de la 
aplicación y mantiene visible un reloj en tiempo real.*/
export default class Header {
    render() {
        document.getElementById("header").innerHTML = `
<div class="d-flex justify-content-between align-items-center h-100 px-3">
    <h1 class="m-0">
        RGDC <span class="header-brand-subtitle">La tecnologia a tu alcance</span> 
    </h1>

    <div class="d-flex align-items-center gap-3">
        <div id="headerClock" class="header-clock"></div>
        <div>LD</div>
    </div>
</div>
`;

        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
    }

    updateClock() {
        const clockElement = document.getElementById("headerClock");

        if (!clockElement) {
            return;
        }

        const now = new Date();

        const date = now.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });

        const time = now.toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });

        clockElement.textContent = `${date} ${time}`;
    }
}
