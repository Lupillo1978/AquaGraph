export default class Header {

    render() {

        document.getElementById("header").innerHTML = `

            <div class="d-flex justify-content-between align-items-center h-100 px-3">

                <h4 class="m-0">

                    AD&M AquaControl

                </h4>

                <div class="d-flex align-items-center gap-3">

                    <div id="headerClock" class="header-clock"></div>

                    <div>

                        Operador

                    </div>

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