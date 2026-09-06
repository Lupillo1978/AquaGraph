import AcousticController from "../controllers/AcousticController.js";
import AcousticView from "../views/AcousticView.js";

export default class AcousticEngine {

    constructor(workspaceManager) {
        this.workspaceManager = workspaceManager;
        this.controller = new AcousticController();
        this.view = new AcousticView();
        this.ponds = [];
        this.status = null;
        this.pollTimer = null;
        this.simulationTimer = null;
        this.simulationRunning = false;
        this.timelineZoom = 1;
        this.timelineDayOffset = 0;
    }

    formatLocalTime(value) {
        return new Date(value).toLocaleTimeString("es-MX", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            timeZone: "America/Mazatlan"
        });
    }

    formatLocalDate(value) {
        return new Date(value).toLocaleDateString("es-MX", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            timeZone: "America/Mazatlan"
        });
    }

    async show() {
        this.workspaceManager.showWorkspace();
        const response = await this.controller.getPonds();
        this.ponds = response.success ? response.data : [];
        this.workspaceManager.render(this.view.render(this.ponds));
        this.registerEvents();
        if (this.ponds.length) {
            await this.selectPond(this.ponds[0].id);
        }
        clearInterval(this.pollTimer);
        this.pollTimer = setInterval(() => {
            this.refreshStatus();
            if (this.timelineDayOffset === 0) {
                this.renderHistory();
            }
        }, 60000);
    }

    registerEvents() {
        document.getElementById("acousticPond")?.addEventListener("change", event => this.selectPond(event.target.value));
        document.getElementById("acousticMode")?.addEventListener("change", event => this.changeMode(event.target.value));
        document.getElementById("btnSimulateAcoustic")?.addEventListener("click", () => this.simulate());
        document.getElementById("btnToggleSimulation")?.addEventListener("click", () => this.toggleSimulation());
        document.getElementById("btnSaveAcousticConfig")?.addEventListener("click", () => this.saveConfig());
        document.getElementById("btnSeedAcousticHistory")?.addEventListener("click", () => this.seedHistory());
        document.getElementById("btnTimelineZoomIn")?.addEventListener("click", () => this.setTimelineZoom(this.timelineZoom * 2));
        document.getElementById("btnTimelineZoomOut")?.addEventListener("click", () => this.setTimelineZoom(this.timelineZoom / 2));
        document.getElementById("btnTimelineZoomReset")?.addEventListener("click", () => this.resetTimelineZoom());
        document.getElementById("btnPreviousAcousticDay")?.addEventListener("click", () => this.changeTimelineDay(-1));
        document.getElementById("btnNextAcousticDay")?.addEventListener("click", () => this.changeTimelineDay(1));
        document.getElementById("acousticTimelineScroll")?.addEventListener("wheel", event => this.handleTimelineWheel(event), { passive: false });
        document.getElementById("acousticTimelineScroll")?.addEventListener("scroll", event => this.syncHourRuler(event.currentTarget));
        document.querySelector(".acoustic-hour-scroll")?.addEventListener("scroll", event => this.syncTimelineScroll(event.currentTarget));
        document.getElementById("acousticTimeline")?.addEventListener("mousemove", event => this.showTimelineTooltip(event));
        document.getElementById("acousticTimeline")?.addEventListener("mouseleave", () => this.hideTimelineTooltip());
        ["simActivity", "simNoise"].forEach(id => {
            document.getElementById(id)?.addEventListener("input", event => {
                document.getElementById(`${id}Output`).textContent = `${event.target.value}%`;
            });
        });
    }

    async selectPond(pondId) {
        this.pondId = pondId;
        const config = await this.controller.getConfig(pondId);
        this.fillConfig(config.data);
        const status = await this.controller.getStatus(pondId);
        if (status.success) document.getElementById("acousticMode").value = status.data.mode || config.data.mode;
        await this.refreshStatus();
        await this.renderHistory();
    }

    async refreshStatus() {
        if (!this.pondId) return;
        const response = await this.controller.getStatus(this.pondId);
        if (response.success) this.renderStatus(response.data);
    }

    async simulate() {
        const response = await this.controller.simulate(this.pondId, {
            scenario: document.getElementById("simScenario").value,
            activityIndex: Number(document.getElementById("simActivity").value) / 100,
            noise: Number(document.getElementById("simNoise").value) / 100
        });
        if (response.success) {
            this.renderStatus(response.data);
            await this.renderHistory();
        }
    }

    toggleSimulation() {
        this.simulationRunning = !this.simulationRunning;
        const button = document.getElementById("btnToggleSimulation");

        if (!this.simulationRunning) {
            clearInterval(this.simulationTimer);
            button.textContent = "Iniciar";
            return;
        }

        button.textContent = "Pausar";
        this.simulate();
        this.simulationTimer = setInterval(() => this.simulate(), 5000);
    }

    async changeMode(mode) {
        if (!this.pondId) return;
        const message = mode === "SONIC"
            ? "El alimentador usará actividad acústica como variable de decisión. La dieta y los límites continuarán aplicándose."
            : "El alimentador dejará de usar decisiones acústicas y volverá al modo seleccionado.";
        if (!confirm(message)) {
            document.getElementById("acousticMode").value = this.status?.mode || "TIMER";
            return;
        }
        await this.controller.saveConfig(this.pondId, { mode });
        await this.refreshStatus();
    }

    async saveConfig() {
        const response = await this.controller.saveConfig(this.pondId, {
            minimumActivity: Number(document.getElementById("acousticThreshold").value),
            maximumDailyKg: Number(document.getElementById("acousticDailyLimit").value),
            maximumDailyEvents: Number(document.getElementById("acousticEventLimit").value),
            minimumIntervalMinutes: Number(document.getElementById("acousticInterval").value)
        });
        if (response.success) this.fillConfig(response.data);
    }

    fillConfig(config) {
        document.getElementById("acousticThreshold").value = config.minimumActivity;
        document.getElementById("acousticDailyLimit").value = config.maximumDailyKg;
        document.getElementById("acousticEventLimit").value = config.maximumDailyEvents;
        document.getElementById("acousticInterval").value = config.minimumIntervalMinutes;
    }

    renderStatus(status) {
        this.status = status;
        const activity = Number.isFinite(status.activityIndex) ? `${Math.round(status.activityIndex * 100)} %` : "-- %";
        document.getElementById("acousticActivity").textContent = activity;
        document.getElementById("acousticRemaining").textContent = `${status.remainingKg ?? "--"} kg`;
        document.getElementById("acousticFeeders").textContent = `${status.feederIds?.length ?? 0}`;
        document.getElementById("acousticSensor").textContent = status.sensorState || "Sin datos";
        document.getElementById("acousticDecision").textContent = status.decision || "Esperando";
        document.getElementById("acousticReason").textContent = status.reason || "Aún no hay una decisión.";
        document.getElementById("acousticReading").textContent = `RMS ${status.rms ?? "--"} · dB ${status.soundLevel ?? "--"}`;
        document.getElementById("acousticFrequency").textContent = `Frecuencia ${status.dominantFrequency ?? "--"} Hz`;
        document.getElementById("acousticDistribution").innerHTML = status.feederAllocations?.length
            ? status.feederAllocations.map(item => `<div class="acoustic-history-row"><strong>${item.feederId}</strong><span>${item.amountKg} kg</span><span>Asignado</span></div>`).join("")
            : "Sin distribución: el evento no fue autorizado.";
        this.drawWaveform(status.waveform || []);
        this.drawSpectrum(status.activityIndex);
    }

    drawWaveform(values) {
        const canvas = document.getElementById("acousticWaveform");
        if (!canvas) return;
        const context = canvas.getContext("2d");
        const width = canvas.clientWidth || 600;
        canvas.width = width;
        context.clearRect(0, 0, width, canvas.height);
        context.strokeStyle = "#36d399";
        context.lineWidth = 2;
        context.beginPath();
        values.forEach((value, index) => {
            const x = (index / Math.max(values.length - 1, 1)) * width;
            const y = canvas.height / 2 - value * canvas.height * 0.36;
            index ? context.lineTo(x, y) : context.moveTo(x, y);
        });
        context.stroke();
    }

    drawSpectrum(activity) {
        const canvas = document.getElementById("acousticSpectrum");
        if (!canvas) return;
        const context = canvas.getContext("2d");
        const width = canvas.clientWidth || 600;
        canvas.width = width;
        context.clearRect(0, 0, width, canvas.height);
        const intensity = Number.isFinite(activity) ? activity : 0;
        for (let index = 0; index < 32; index += 1) {
            const value = Math.max(0.04, Math.min(1, intensity * (1 - index / 42) + Math.random() * 0.12));
            context.fillStyle = `hsl(${145 - value * 120}, 75%, ${35 + value * 28}%)`;
            const barWidth = width / 32 - 2;
            context.fillRect(index * (width / 32), canvas.height - value * canvas.height, barWidth, value * canvas.height);
        }
    }

    async renderHistory() {
        let response = await this.controller.getHistory(this.pondId, this.getTimelineDate());
        const container = document.getElementById("acousticHistory");
        if (!response.success) return;

        const simulatedHistory = response.data.every(item => item.simulated);
        const historySpan = response.data.length > 1
            ? new Date(response.data[response.data.length - 1].timestamp).getTime() - new Date(response.data[0].timestamp).getTime()
            : 0;

        if (this.timelineDayOffset <= 0 && (response.data.length < 12 || (simulatedHistory && historySpan < 12 * 60 * 60 * 1000))) {
            await this.controller.seedHistory(this.pondId, this.getTimelineDate());
            response = await this.controller.getHistory(this.pondId, this.getTimelineDate());
        }

        this.timelineHistory = response.data || [];
        this.drawTimeline(response.data || []);
        if (!container || !response.data.length) return;
        container.innerHTML = response.data.slice(0, 8).map(item => `
            <div class="acoustic-history-row"><time>${this.formatLocalTime(item.timestamp)}</time><strong>${item.decision}</strong><span>${Number.isFinite(item.activityIndex) ? `${Math.round(item.activityIndex * 100)}%` : "sin señal"}</span><span>${item.reason}</span></div>
        `).join("");
    }

    async seedHistory() {
        const response = await this.controller.seedHistory(this.pondId, this.getTimelineDate());
        if (response.success) {
            await this.renderHistory();
        }
    }

    getTimelineDate() {
        const date = new Date();
        const parts = new Intl.DateTimeFormat("en-CA", {
            timeZone: "America/Mazatlan",
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        }).formatToParts(date);
        const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
        const localDate = new Date(`${values.year}-${values.month}-${values.day}T12:00:00`);
        localDate.setDate(localDate.getDate() + this.timelineDayOffset);
        return `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, "0")}-${String(localDate.getDate()).padStart(2, "0")}T00:00:00.000Z`;
    }

    async changeTimelineDay(offset) {
        this.timelineDayOffset += offset;
        await this.seedHistory();
        const scroll = document.getElementById("acousticTimelineScroll");
        if (scroll) scroll.scrollLeft = 0;
    }

    drawTimeline(history) {
        const canvas = document.getElementById("acousticTimeline");
        if (!canvas) return;

        const context = canvas.getContext("2d");
        const viewport = document.getElementById("acousticTimelineScroll")?.clientWidth || 900;
        const width = Math.max(viewport, viewport * this.timelineZoom);
        const height = 300;
        const padding = { top: 22, right: 12, bottom: 38, left: 10 };
        const plotWidth = width - padding.left - padding.right;
        const plotHeight = height - padding.top - padding.bottom;
        const points = history
            .filter(item => item.timestamp)
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        const selectedDate = this.getTimelineDate().slice(0, 10);
        const minTime = new Date(`${selectedDate}T00:00:00`).getTime();
        const maxTime = minTime + 24 * 60 * 60000;
        const timeSpan = maxTime - minTime;
        const xFor = timestamp => padding.left + ((new Date(timestamp).getTime() - minTime) / timeSpan) * plotWidth;
        const yFor = value => padding.top + (1 - Math.max(0, Math.min(1, value))) * plotHeight;
        this.timelineGeometry = { minTime, maxTime, timeSpan, padding, plotWidth, width };

        canvas.width = width;
        canvas.height = height;
        canvas.style.width = `${width}px`;
        const timelineContent = document.getElementById("acousticTimelineContent");
        if (timelineContent) {
            timelineContent.style.width = `${width}px`;
        }
        const hourRuler = document.getElementById("acousticHourRuler");
        if (hourRuler) {
            hourRuler.style.width = `${width}px`;
            hourRuler.querySelectorAll("span").forEach((label, hour) => {
                label.style.left = `${(hour / 23) * 100}%`;
            });
        }
        context.clearRect(0, 0, width, height);
        context.font = "11px Segoe UI, sans-serif";
        context.strokeStyle = "rgba(176, 208, 201, 0.14)";
        context.fillStyle = "#536d6a";
        context.lineWidth = 1;

        for (let index = 0; index <= 4; index += 1) {
            const value = index / 4;
            const y = yFor(value);
            context.beginPath();
            context.moveTo(padding.left, y);
            context.lineTo(width - padding.right, y);
            context.stroke();
        }

        const drawReference = (value, color, dash = []) => {
            context.save();
            context.strokeStyle = color;
            context.setLineDash(dash);
            context.beginPath();
            context.moveTo(padding.left, yFor(value));
            context.lineTo(width - padding.right, yFor(value));
            context.stroke();
            context.restore();
        };

        drawReference(this.status?.config?.minimumActivity ?? 0.55, "#e1bd55", [5, 4]);
        drawReference(0.25, "#4aa87e", [2, 5]);

        if (points.length) {
            const responseValue = point => Number.isFinite(point.responseIndex)
                ? point.responseIndex
                : Number.isFinite(point.activityIndex) ? point.activityIndex : 0;

            context.beginPath();
            points.forEach((point, index) => {
                const x = xFor(point.timestamp);
                const y = yFor(responseValue(point));
                index ? context.lineTo(x, y) : context.moveTo(x, y);
            });
            context.lineTo(xFor(points[points.length - 1].timestamp), yFor(0));
            context.lineTo(xFor(points[0].timestamp), yFor(0));
            context.closePath();
            context.fillStyle = "rgba(220, 68, 58, 0.28)";
            context.fill();

            context.beginPath();
            points.forEach((point, index) => {
                const x = xFor(point.timestamp);
                const y = yFor(responseValue(point));
                index ? context.lineTo(x, y) : context.moveTo(x, y);
            });
            context.strokeStyle = "#e25245";
            context.lineWidth = 2;
            context.stroke();

            points.forEach(point => {
                if (point.decision !== "FEED" || !point.feedAmountKg) return;
                const x = xFor(point.timestamp);
                const y = yFor(Math.min(1, Number(point.turnDurationSeconds || 0) / 40));
                context.strokeStyle = "#278fc0";
                context.lineWidth = 4;
                context.beginPath();
                context.moveTo(x, padding.top + plotHeight);
                context.lineTo(x, y);
                context.stroke();
                context.fillStyle = "#278fc0";
                context.beginPath();
                context.arc(x, y, 3, 0, Math.PI * 2);
                context.fill();
            });

            this.drawContextLine(context, points, point => point.waterTemperature, 27.2, 29.0, "#5b86a6", xFor, yFor);
            this.drawContextLine(context, points, point => point.dissolvedOxygen, 4.8, 5.5, "#9b884b", xFor, yFor);
        }

        // La escala horaria forma parte del gráfico para que siempre sea visible.
        context.save();
        context.fillStyle = "#172f32";
        context.font = "bold 10px Segoe UI, sans-serif";
        context.textAlign = "center";
        for (let hour = 0; hour < 24; hour += 1) {
            const x = padding.left + (hour / 23) * plotWidth;
            context.fillText(`${String(hour).padStart(2, "0")}:00`, x, height - 12);
        }
        context.restore();

        const dateElement = document.getElementById("acousticTimelineDate");
        if (dateElement) {
            dateElement.textContent = points.length
                ? this.formatLocalDate(points[points.length - 1].timestamp)
                : "Sin datos históricos";
        }

        const zoomElement = document.getElementById("acousticTimelineZoom");
        if (zoomElement) {
            zoomElement.textContent = `${this.timelineZoom}x`;
        }
        this.syncHourRuler(document.getElementById("acousticTimelineScroll"));
    }

    syncHourRuler(scroll) {
        const ruler = document.getElementById("acousticHourRuler");
        const hourScroll = document.querySelector(".acoustic-hour-scroll");
        if (!scroll || !ruler || !hourScroll) return;
        hourScroll.scrollLeft = scroll.scrollLeft;
    }

    syncTimelineScroll(hourScroll) {
        const scroll = document.getElementById("acousticTimelineScroll");
        if (!scroll || !hourScroll) return;
        scroll.scrollLeft = hourScroll.scrollLeft;
    }

    drawContextLine(context, points, valueFor, minimum, maximum, color, xFor, yFor) {
        const values = points.filter(point => Number.isFinite(valueFor(point)));
        if (!values.length) return;

        context.save();
        context.strokeStyle = color;
        context.lineWidth = 1.5;
        context.beginPath();
        values.forEach((point, index) => {
            const normalized = (valueFor(point) - minimum) / (maximum - minimum);
            const x = xFor(point.timestamp);
            const y = yFor(Math.max(0, Math.min(1, normalized)));
            index ? context.lineTo(x, y) : context.moveTo(x, y);
        });
        context.stroke();
        context.restore();
    }

    showTimelineTooltip(event) {
        const canvas = event.currentTarget;
        const tooltip = document.getElementById("acousticTimelineTooltip");
        if (!tooltip || !this.timelineHistory?.length) return;

        const bounds = canvas.getBoundingClientRect();
        const geometry = this.timelineGeometry;
        const ratio = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
        const hoveredTime = geometry
            ? geometry.minTime + ratio * geometry.timeSpan
            : Date.now();
        const sorted = this.timelineHistory
            .filter(item => item.timestamp)
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        const point = sorted.reduce((closest, candidate) => {
            if (!closest) return candidate;
            return Math.abs(new Date(candidate.timestamp).getTime() - hoveredTime) <
                Math.abs(new Date(closest.timestamp).getTime() - hoveredTime)
                ? candidate
                : closest;
        }, null);
        if (!point) return;

        const activity = Number.isFinite(point.responseIndex)
            ? point.responseIndex
            : point.activityIndex;
        tooltip.innerHTML = `
            <strong>${this.formatLocalTime(point.timestamp)}</strong>
            <span>Respuesta: ${Number.isFinite(activity) ? `${Math.round(activity * 100)}%` : "sin datos"}</span>
            <span>Tiempo de giro: ${point.turnDurationSeconds ?? "--"} seg</span>
            <span>Alimento: ${point.feedAmountKg || 0} kg</span>
            <span>Temp.: ${point.waterTemperature ?? "--"} °C · O₂: ${point.dissolvedOxygen ?? "--"} mg/L</span>
        `;
        tooltip.style.left = `${Math.max(8, Math.min(canvas.clientWidth - 220, event.offsetX + 12))}px`;
        tooltip.style.top = `${Math.max(8, event.offsetY - 76)}px`;
        tooltip.classList.add("is-visible");
    }

    hideTimelineTooltip() {
        document.getElementById("acousticTimelineTooltip")?.classList.remove("is-visible");
    }

    setTimelineZoom(zoom, anchorRatio = 0.5) {
        const scroll = document.getElementById("acousticTimelineScroll");
        if (!scroll) return;

        const oldWidth = Math.max(scroll.clientWidth, scroll.clientWidth * this.timelineZoom);
        const oldScrollPosition = scroll.scrollLeft + scroll.clientWidth * anchorRatio;
        const oldRatio = oldScrollPosition / oldWidth;
        this.timelineZoom = Math.max(1, Math.min(20, zoom));
        this.drawTimeline(this.timelineHistory || []);

        const newWidth = Math.max(scroll.clientWidth, scroll.clientWidth * this.timelineZoom);
        scroll.scrollLeft = Math.max(0, Math.min(
            newWidth - scroll.clientWidth,
            newWidth * oldRatio - scroll.clientWidth * anchorRatio
        ));
    }

    resetTimelineZoom() {
        const scroll = document.getElementById("acousticTimelineScroll");
        this.timelineZoom = 1;
        this.drawTimeline(this.timelineHistory || []);
        if (scroll) {
            scroll.scrollLeft = 0;
            this.syncHourRuler(scroll);
        }
    }

    handleTimelineWheel(event) {
        if (!event.ctrlKey && !event.metaKey) return;
        event.preventDefault();
        const scroll = event.currentTarget;
        const bounds = scroll.getBoundingClientRect();
        const anchorRatio = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
        const direction = event.deltaY < 0 ? 2 : 0.5;
        this.setTimelineZoom(this.timelineZoom * direction, anchorRatio);
    }
}
