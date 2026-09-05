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
        this.pollTimer = setInterval(() => this.refreshStatus(), 3000);
    }

    registerEvents() {
        document.getElementById("acousticPond")?.addEventListener("change", event => this.selectPond(event.target.value));
        document.getElementById("acousticMode")?.addEventListener("change", event => this.changeMode(event.target.value));
        document.getElementById("btnSimulateAcoustic")?.addEventListener("click", () => this.simulate());
        document.getElementById("btnToggleSimulation")?.addEventListener("click", () => this.toggleSimulation());
        document.getElementById("btnSaveAcousticConfig")?.addEventListener("click", () => this.saveConfig());
        document.getElementById("btnSeedAcousticHistory")?.addEventListener("click", () => this.seedHistory());
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
        let response = await this.controller.getHistory(this.pondId);
        const container = document.getElementById("acousticHistory");
        if (!response.success) return;

        if (response.data.length < 12) {
            await this.controller.seedHistory(this.pondId);
            response = await this.controller.getHistory(this.pondId);
        }

        this.drawTimeline(response.data || []);
        if (!container || !response.data.length) return;
        container.innerHTML = response.data.slice(0, 8).map(item => `
            <div class="acoustic-history-row"><time>${new Date(item.timestamp).toLocaleTimeString()}</time><strong>${item.decision}</strong><span>${Number.isFinite(item.activityIndex) ? `${Math.round(item.activityIndex * 100)}%` : "sin señal"}</span><span>${item.reason}</span></div>
        `).join("");
    }

    async seedHistory() {
        const response = await this.controller.seedHistory(this.pondId);
        if (response.success) {
            await this.renderHistory();
        }
    }

    drawTimeline(history) {
        const canvas = document.getElementById("acousticTimeline");
        if (!canvas) return;

        const context = canvas.getContext("2d");
        const width = canvas.clientWidth || 900;
        const height = 300;
        const padding = { top: 22, right: 24, bottom: 38, left: 48 };
        const plotWidth = width - padding.left - padding.right;
        const plotHeight = height - padding.top - padding.bottom;
        const points = history
            .filter(item => item.timestamp)
            .slice(-80)
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        const minTime = points.length ? new Date(points[0].timestamp).getTime() : Date.now() - 3600000;
        const maxTime = points.length ? new Date(points[points.length - 1].timestamp).getTime() : Date.now();
        const timeSpan = Math.max(maxTime - minTime, 60000);
        const xFor = timestamp => padding.left + ((new Date(timestamp).getTime() - minTime) / timeSpan) * plotWidth;
        const yFor = value => padding.top + (1 - Math.max(0, Math.min(1, value))) * plotHeight;

        canvas.width = width;
        canvas.height = height;
        context.clearRect(0, 0, width, height);
        context.font = "11px Segoe UI, sans-serif";
        context.strokeStyle = "rgba(176, 208, 201, 0.14)";
        context.fillStyle = "#86a39b";
        context.lineWidth = 1;

        for (let index = 0; index <= 4; index += 1) {
            const value = index / 4;
            const y = yFor(value);
            context.beginPath();
            context.moveTo(padding.left, y);
            context.lineTo(width - padding.right, y);
            context.stroke();
            context.fillText(`${Math.round(value * 100)}`, 14, y + 4);
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
            context.beginPath();
            points.forEach((point, index) => {
                const x = xFor(point.timestamp);
                const y = yFor(Number.isFinite(point.activityIndex) ? point.activityIndex : 0);
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
                const y = yFor(Number.isFinite(point.activityIndex) ? point.activityIndex : 0);
                index ? context.lineTo(x, y) : context.moveTo(x, y);
            });
            context.strokeStyle = "#e25245";
            context.lineWidth = 2;
            context.stroke();

            points.forEach(point => {
                if (point.decision !== "FEED" || !point.feedAmountKg) return;
                const x = xFor(point.timestamp);
                const y = yFor(Math.min(1, Number(point.feedAmountKg) / 0.5));
                context.strokeStyle = "#278fc0";
                context.lineWidth = 3;
                context.beginPath();
                context.moveTo(x, yFor(0));
                context.lineTo(x, y);
                context.stroke();
                context.fillStyle = "#278fc0";
                context.beginPath();
                context.arc(x, y, 3, 0, Math.PI * 2);
                context.fill();
            });
        }

        const labels = points.length ? [points[0], points[Math.floor(points.length / 2)], points[points.length - 1]] : [];
        labels.forEach(point => {
            const x = xFor(point.timestamp);
            context.fillStyle = "#86a39b";
            context.fillText(new Date(point.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), x - 22, height - 12);
        });

        const dateElement = document.getElementById("acousticTimelineDate");
        if (dateElement) {
            dateElement.textContent = points.length
                ? new Date(points[points.length - 1].timestamp).toLocaleDateString()
                : "Sin datos históricos";
        }
    }
}
