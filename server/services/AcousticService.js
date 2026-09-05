const fs = require("fs");
const path = require("path");
const SimulatedHydrophone = require("./acoustic/SimulatedHydrophone");
const PondRepository = require("../repositories/PondRepository");
const FeederRepository = require("../repositories/FeederRepository");

const storageFile = path.join(__dirname, "../storage/acoustic.json");
const DEFAULT_CONFIG = {
    mode: "TIMER",
    source: "SIMULATOR",
    minimumActivity: 0.55,
    optimalActivity: 0.72,
    maximumActivity: 0.95,
    observationSeconds: 30,
    minimumIntervalMinutes: 15,
    feedDurationSeconds: 10,
    initialAmountKg: 0.25,
    maximumDailyKg: 20,
    minimumDailyKg: 0,
    maximumDailyEvents: 20,
    confidenceMinimum: 0.65,
    stabilizationSeconds: 60,
    evaluationWaitSeconds: 30,
    learningMode: true
};

class AcousticService {

    constructor() {
        this.hydrophone = new SimulatedHydrophone();
        this.state = this.load();
    }

    load() {
        if (!fs.existsSync(storageFile)) {
            return { configs: {}, statuses: {}, history: [], alerts: [] };
        }
        return JSON.parse(fs.readFileSync(storageFile, "utf8"));
    }

    save() {
        fs.writeFileSync(storageFile, JSON.stringify(this.state, null, 4));
    }

    getPonds() {
        const feeders = FeederRepository.getAll();

        return PondRepository.getAll().map(pond => ({
            ...pond,
            feeders: feeders.filter(feeder => feeder.pondId === pond.id)
        }));
    }

    getConfig(pondId) {
        return { ...DEFAULT_CONFIG, ...(this.state.configs[pondId] || {}) };
    }

    configure(pondId, data = {}) {
        const current = this.getConfig(pondId);
        const config = { ...current };
        Object.keys(DEFAULT_CONFIG).forEach(key => {
            if (data[key] !== undefined) {
                config[key] = typeof DEFAULT_CONFIG[key] === "number" ? Number(data[key]) : data[key];
            }
        });
        this.state.configs[pondId] = config;
        this.save();
        return config;
    }

    getStatus(pondId) {
        return this.state.statuses[pondId] || this.emptyStatus(pondId);
    }

    getHistory(pondId) {
        return this.state.history.filter(item => item.pondId === pondId).slice(-100).reverse();
    }

    seedHistory(pondId, sampleCount = 48) {
        const pond = this.getPonds().find(item => item.id === pondId);
        const config = this.getConfig(pondId);
        const feederIds = pond ? pond.feeders.map(feeder => feeder.id) : [];
        const now = Date.now();
        const samples = [];
        let consumedKg = 0;

        for (let index = 0; index < sampleCount; index += 1) {
            const timestamp = new Date(now - (sampleCount - index) * 5 * 60000).toISOString();
            const cycle = index % 12;
            const pulse = cycle === 2 || cycle === 3 ? 0.3 : 0;
            const activityIndex = Number(Math.max(0.12, Math.min(0.9, 0.38 + (cycle / 18) + pulse + Math.sin(index * 0.8) * 0.08)).toFixed(3));
            const shouldFeed = config.mode === "TIMER"
                ? cycle === 2
                : activityIndex >= config.minimumActivity && cycle === 2;
            const feedAmountKg = shouldFeed ? config.initialAmountKg : 0;
            consumedKg += feedAmountKg;

            samples.push({
                timestamp,
                pondId,
                feederIds,
                mode: config.mode,
                activityIndex,
                rms: Number((0.18 + activityIndex * 0.72).toFixed(3)),
                soundLevel: Number((35 + activityIndex * 55).toFixed(1)),
                dominantFrequency: Math.round(2800 + activityIndex * 1800),
                signalQuality: 0.93,
                noiseLevel: Number((0.08 + (index % 5) * 0.02).toFixed(2)),
                threshold: config.minimumActivity,
                feedAmountKg,
                remainingKg: Math.max(0, config.maximumDailyKg - consumedKg),
                decision: shouldFeed ? "FEED" : "WAIT",
                reason: shouldFeed
                    ? "Evento simulado de alimentación."
                    : "Actividad simulada en observación.",
                simulated: true
            });
        }

        this.state.history = this.state.history.filter(item => item.pondId !== pondId);
        this.state.history.push(...samples);
        this.save();
        return samples;
    }

    simulate(pondId, input = {}) {
        const pond = this.getPonds().find(item => item.id === pondId);
        const config = this.getConfig(pondId);
        const measurement = this.hydrophone.read(input);
        const previous = this.getStatus(pondId);
        const feeders = pond ? pond.feeders : [];
        const consumed = Number(previous.consumedKg || 0);
        const events = Number(previous.eventsToday || 0);
        const remaining = Math.max(0, config.maximumDailyKg - consumed);
        const now = Date.now();
        const lastFeedAt = previous.lastFeedAt ? new Date(previous.lastFeedAt).getTime() : 0;
        const blockedByInterval = lastFeedAt > 0 && now - lastFeedAt < config.minimumIntervalMinutes * 60000;
        const invalid = !measurement || !Number.isFinite(measurement.activityIndex) || !Number.isFinite(measurement.signalQuality);
        let decision = "WAIT";
        let reason = "Actividad por debajo del umbral.";
        let feedAmountKg = 0;
        let feederAllocations = [];
        let alert = null;

        if (invalid || measurement.signalQuality < config.confidenceMinimum) {
            decision = "BLOCKED";
            reason = "Señal inválida o con baja confianza; no se alimenta automáticamente.";
            alert = "SENSOR_INVALID";
        } else if (config.mode !== "SONIC") {
            reason = "El estanque está en modo Timer.";
        } else if (!feeders.length) {
            decision = "BLOCKED";
            reason = "El estanque no tiene alimentadores asignados.";
            alert = "NO_FEEDERS";
        } else if (measurement.activityIndex > config.maximumActivity) {
            decision = "BLOCKED";
            reason = "Actividad anormalmente alta; requiere revisión del operador.";
            alert = "ACTIVITY_ABNORMAL";
        } else if (remaining <= 0) {
            decision = "BLOCKED";
            reason = "Ración diaria agotada.";
            alert = "RATION_EXHAUSTED";
        } else if (events >= config.maximumDailyEvents) {
            decision = "BLOCKED";
            reason = "Se alcanzó el máximo de eventos diarios.";
            alert = "EVENT_LIMIT";
        } else if (blockedByInterval) {
            reason = "Periodo de espera entre eventos activo.";
        } else if (measurement.activityIndex >= config.minimumActivity) {
            decision = "FEED";
            feedAmountKg = Math.min(config.initialAmountKg, remaining);
            feederAllocations = feeders.map(feeder => ({
                feederId: feeder.id,
                amountKg: Number((feedAmountKg / feeders.length).toFixed(3))
            }));
            reason = "Actividad acústica sostenida por encima del umbral configurado.";
        }

        const status = {
            pondId,
            feederIds: feeders.map(feeder => feeder.id),
            feederAllocations,
            mode: config.mode,
            source: measurement.source,
            sensorState: invalid ? "INVALID" : "CONNECTED",
            activityIndex: measurement.activityIndex,
            rms: measurement.rms,
            soundLevel: measurement.soundLevel,
            dominantFrequency: measurement.dominantFrequency,
            signalQuality: measurement.signalQuality,
            noiseLevel: measurement.noiseLevel,
            waveform: measurement.waveform,
            decision,
            reason,
            feedAmountKg,
            consumedKg: Number((consumed + feedAmountKg).toFixed(3)),
            remainingKg: Number((remaining - feedAmountKg).toFixed(3)),
            eventsToday: events + (decision === "FEED" ? 1 : 0),
            lastFeedAt: decision === "FEED" ? measurement.timestamp : previous.lastFeedAt || null,
            lastEvaluationAt: measurement.timestamp,
            config,
            learningMode: config.learningMode
        };

        this.state.statuses[pondId] = status;
        this.state.history.push({
            timestamp: measurement.timestamp,
            pondId,
            feederIds: feeders.map(feeder => feeder.id),
            mode: config.mode,
            activityIndex: measurement.activityIndex,
            rms: measurement.rms,
            threshold: config.minimumActivity,
            feedAmountKg,
            remainingKg: status.remainingKg,
            decision,
            reason,
            signalQuality: measurement.signalQuality
        });
        if (alert) {
            this.state.alerts.push({ timestamp: measurement.timestamp, pondId, type: alert, message: reason });
        }
        this.save();
        return status;
    }

    emptyStatus(pondId) {
        return {
            pondId,
            mode: this.getConfig(pondId).mode,
            sensorState: "NO_DATA",
            activityIndex: null,
            consumedKg: 0,
            remainingKg: this.getConfig(pondId).maximumDailyKg,
            eventsToday: 0,
            decision: "WAIT",
            reason: "Aún no hay mediciones acústicas."
        };
    }

}

module.exports = new AcousticService();
