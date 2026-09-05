const AcousticDataSource = require("./AcousticDataSource");

const SCENARIOS = {
    normal: { activityIndex: 0.72, noise: 0.12, dominantFrequency: 4200, signalQuality: 0.94 },
    low: { activityIndex: 0.28, noise: 0.1, dominantFrequency: 2800, signalQuality: 0.95 },
    high: { activityIndex: 0.88, noise: 0.14, dominantFrequency: 4700, signalQuality: 0.92 },
    noisy: { activityIndex: 0.72, noise: 0.78, dominantFrequency: 6100, signalQuality: 0.32 },
    disconnected: { activityIndex: null, noise: null, dominantFrequency: null, signalQuality: 0 },
    invalid: { activityIndex: NaN, noise: NaN, dominantFrequency: NaN, signalQuality: NaN }
};

class SimulatedHydrophone extends AcousticDataSource {

    read(input = {}) {
        const scenario = SCENARIOS[input.scenario] || {};
        const activityIndex = this.value(input.activityIndex, scenario.activityIndex ?? 0.5);
        const noise = this.value(input.noise, scenario.noise ?? 0.15);
        const dominantFrequency = this.value(input.dominantFrequency, scenario.dominantFrequency ?? 4200);
        const signalQuality = this.value(input.signalQuality, scenario.signalQuality ?? Math.max(0, 1 - noise));
        const variation = this.value(input.variation, 0.12);
        const currentActivity = activityIndex === null
            ? null
            : Math.max(0, Math.min(1, activityIndex + ((Math.random() - 0.5) * variation)));

        return {
            timestamp: new Date().toISOString(),
            rms: currentActivity === null ? null : Number((0.18 + currentActivity * 0.72).toFixed(3)),
            soundLevel: currentActivity === null ? null : Number((35 + currentActivity * 55).toFixed(1)),
            dominantFrequency: Number.isFinite(dominantFrequency) ? dominantFrequency : null,
            activityIndex: currentActivity,
            noiseLevel: noise,
            signalQuality,
            source: "SIMULATOR",
            waveform: this.waveform(currentActivity, noise)
        };
    }

    value(value, fallback) {
        if (value === null) {
            return null;
        }
        const parsed = value === undefined ? fallback : Number(value);
        return Number.isFinite(parsed) ? parsed : NaN;
    }

    waveform(activityIndex, noise) {
        if (activityIndex === null || !Number.isFinite(activityIndex)) {
            return [];
        }
        return Array.from({ length: 64 }, (_, index) => {
            const wave = Math.sin(index * 0.55) * activityIndex;
            const jitter = (Math.random() - 0.5) * (noise || 0.1);
            return Number((wave + jitter).toFixed(3));
        });
    }

}

module.exports = SimulatedHydrophone;
