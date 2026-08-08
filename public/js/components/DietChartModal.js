import DietChart from "../engines/DietChart.js";

export default class DietChartModal {

    constructor() {

        this.overlay = null;

        this.chart = null;

    }

    /**
     * Convierte los bloques de una dieta a un schedule de disparos
     * (misma lógica utilizada en DietEngine.buildDailySchedule).
     */
    buildSchedule(blocks) {

        const schedule = [];

        (blocks || []).forEach(block => {

            const shots = this.calculateShots(block);

            if (shots <= 0) {

                return;

            }

            const foodPerShot = Number(block.percentage) / shots;

            let current = this.timeToMinutes(block.start);

            const end = this.timeToMinutes(block.end);

while (current < end) {

                schedule.push({

                    minute: current,

                    percentage: foodPerShot,

                    interval: Number(block.interval)

                });

                current += Number(block.interval);

            }

        });

        return schedule.sort((a, b) => a.minute - b.minute);

    }

    calculateShots(block) {

        const start = block.start.split(":");

        const end = block.end.split(":");

        const startMinutes = Number(start[0]) * 60 + Number(start[1]);

        const endMinutes = Number(end[0]) * 60 + Number(end[1]);

        const duration = endMinutes - startMinutes;

        if (duration <= 0 || Number(block.interval) <= 0) {

            return 0;

        }

        return Math.floor(duration / Number(block.interval));

    }

    timeToMinutes(time) {

        const parts = time.split(":");

        return Number(parts[0]) * 60 + Number(parts[1]);

    }

    /**
     * Abre el modal mostrando el gráfico de la dieta indicada.
     * @param {Object} diet - Objeto de dieta con { name, blocks }
     */
    open(diet) {

        this.close();

        this.overlay = document.createElement("div");

        this.overlay.className = "diet-modal-overlay";

        this.overlay.innerHTML = `

<div class="diet-modal" role="dialog" aria-modal="true">

    <div class="diet-modal-header">

        <h5 class="diet-modal-title">${this.escapeHtml(diet.name || "Dieta")}</h5>

        <button type="button" class="btn-close btn-close-white diet-modal-close" aria-label="Cerrar"></button>

    </div>

    <div class="diet-modal-body">

        <div class="diet-modal-chart-shell">

            <canvas id="dietChartModal" height="380"></canvas>

        </div>

    </div>

    <div class="diet-modal-footer">

        <button type="button" class="btn btn-secondary diet-modal-cancel">Cerrar</button>

    </div>

</div>

`;

        document.body.appendChild(this.overlay);

        // Cerrar al hacer clic en el overlay (fuera del modal)
        this.overlay.addEventListener("click", (e) => {

            if (e.target === this.overlay) {

                this.close();

            }

        });

        // Cerrar con el botón X
        this.overlay.querySelector(".diet-modal-close").addEventListener("click", () => this.close());

        // Cerrar con el botón Cancelar
        this.overlay.querySelector(".diet-modal-cancel").addEventListener("click", () => this.close());

        // Cerrar con tecla Escape
        this.handleEsc = (e) => {

            if (e.key === "Escape") {

                this.close();

            }

        };

        document.addEventListener("keydown", this.handleEsc);

        // Inicializar el gráfico y dibujar las barras
        this.chart = new DietChart("dietChartModal");

        this.chart.initialize();

        const schedule = this.buildSchedule(diet.blocks);

        this.chart.update(schedule);

    }

    close() {

        if (this.overlay) {

            this.overlay.remove();

            this.overlay = null;

        }

        if (this.handleEsc) {

            document.removeEventListener("keydown", this.handleEsc);

            this.handleEsc = null;

        }

    }

    escapeHtml(value) {

        const div = document.createElement("div");

        div.textContent = value;

        return div.innerHTML;

    }

}
