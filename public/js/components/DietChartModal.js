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

const realShots = [];

            let current = this.timeToMinutes(block.start);

            // "00:00" como hora de fin representa el final del día (24:00)
            const end = this.timeToMinutes(block.end, true);

            const interval = Number(block.interval);

            if (interval <= 0) {

                return;

            }

            while (current < end) {

                realShots.push(current);

                current += interval;

            }

            if (realShots.length === 0) {

                return;

            }

            // Distribuir el porcentaje entre los disparos REALES generados
            const foodPerShot = Number(block.percentage) / realShots.length;

            realShots.forEach(minute => {

                schedule.push({

                    minute,

                    percentage: foodPerShot,

                    interval

                });

            });

        });

        return schedule.sort((a, b) => a.minute - b.minute);

    }

calculateShots(block) {

        const startMinutes = this.timeToMinutes(block.start);

        const endMinutes = this.timeToMinutes(block.end, true);

        const duration = endMinutes - startMinutes;

        if (duration <= 0 || Number(block.interval) <= 0) {

            return 0;

        }

        return Math.floor(duration / Number(block.interval));

    }

timeToMinutes(time, isEnd = false) {

        const parts = time.split(":");

        let hours = Number(parts[0]);

        const minutes = Number(parts[1]);

        // "00:00" usado como fin representa el final del día (24:00)
        if (isEnd && hours === 0 && minutes === 0) {

            hours = 24;

        }

        return hours * 60 + minutes;

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
