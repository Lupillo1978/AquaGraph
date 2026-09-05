export default class AcousticView {

    render(ponds = []) {
        const options = ponds.map(pond => `
            <option value="${pond.id}">${pond.name || pond.id} · ${pond.feeders.length} alimentador(es)</option>
        `).join("");

        return `
<div class="acoustic-shell">
    <div class="acoustic-heading">
        <div>
            <span class="acoustic-eyebrow">OPERACION INTELIGENTE</span>
            <h2>Modo Sónico</h2>
            <p>Actividad acústica como indicador configurable, nunca como medición absoluta de apetito.</p>
        </div>
        <div class="acoustic-controls">
            <label>Estanque
                <select id="acousticPond" class="form-select form-select-sm">${options}</select>
            </label>
            <label>Modo
                <select id="acousticMode" class="form-select form-select-sm">
                    <option value="TIMER">Timer</option>
                    <option value="SONIC">Sónico</option>
                    <option value="MANUAL">Manual</option>
                </select>
            </label>
        </div>
    </div>

    <div class="acoustic-status-strip">
        <div><span class="acoustic-label">Estado</span><strong id="acousticDecision">Esperando</strong></div>
        <div><span class="acoustic-label">Actividad</span><strong id="acousticActivity">-- %</strong></div>
        <div><span class="acoustic-label">Ración restante</span><strong id="acousticRemaining">-- kg</strong></div>
        <div><span class="acoustic-label">Alimentadores</span><strong id="acousticFeeders">--</strong></div>
        <div><span class="acoustic-label">Sensor</span><strong id="acousticSensor">Sin datos</strong></div>
    </div>
    <section class="acoustic-panel acoustic-timeline-panel">
        <div class="acoustic-panel-title">
            <span>Respuesta acústica y alimentación</span>
            <div class="acoustic-timeline-actions">
                <small id="acousticTimelineRange">Últimas evaluaciones</small>
                <button id="btnSeedAcousticHistory" type="button" class="btn btn-outline-secondary btn-sm">Generar historial simulado</button>
            </div>
        </div>
        <div class="acoustic-timeline-nav">
            <span>← Día anterior</span>
            <strong id="acousticTimelineDate">Actividad del estanque</strong>
            <span>Día siguiente →</span>
        </div>
        <canvas id="acousticTimeline" height="300"></canvas>
        <div class="acoustic-chart-legend">
            <span><i class="legend-red"></i>Actividad acústica</span>
            <span><i class="legend-blue"></i>Eventos de alimentación</span>
            <span><i class="legend-yellow"></i>Umbral sónico</span>
            <span><i class="legend-green"></i>Señal estable</span>
        </div>
    </section>

    <div class="acoustic-grid">
        <section class="acoustic-panel acoustic-wave-panel">
            <div class="acoustic-panel-title"><span>Señal acústica en tiempo real</span><small id="acousticReading">RMS -- · dB --</small></div>
            <canvas id="acousticWaveform" height="180"></canvas>
        </section>
        <section class="acoustic-panel">
            <div class="acoustic-panel-title"><span>Espectro / actividad</span><small id="acousticFrequency">Frecuencia -- Hz</small></div>
            <canvas id="acousticSpectrum" height="180"></canvas>
        </section>
        <section class="acoustic-panel acoustic-distribution-panel">
            <div class="acoustic-panel-title"><span>Distribución por alimentador</span><small>Evento actual</small></div>
            <div id="acousticDistribution" class="acoustic-history-empty">Seleccione un estanque.</div>
        </section>
        <section class="acoustic-panel acoustic-simulator-panel">
            <div class="acoustic-panel-title"><span>Simulador de hidrófono</span><small>Fuente: SIMULATOR</small></div>
            <div class="acoustic-slider"><label>Actividad <output id="simActivityOutput">65%</output></label><input id="simActivity" type="range" min="0" max="100" value="65"></div>
            <div class="acoustic-slider"><label>Ruido <output id="simNoiseOutput">20%</output></label><input id="simNoise" type="range" min="0" max="100" value="20"></div>
            <select id="simScenario" class="form-select form-select-sm mb-2">
                <option value="normal">Alimentación normal</option>
                <option value="low">Baja actividad</option>
                <option value="high">Alta actividad</option>
                <option value="noisy">Señal ruidosa</option>
                <option value="disconnected">Hidrófono desconectado</option>
                <option value="invalid">Datos inválidos</option>
            </select>
            <div class="d-flex gap-2">
                <button id="btnToggleSimulation" class="btn btn-success btn-sm flex-fill">Iniciar</button>
                <button id="btnSimulateAcoustic" class="btn btn-outline-light btn-sm flex-fill">Evaluar ahora</button>
            </div>
        </section>
        <section class="acoustic-panel">
            <div class="acoustic-panel-title"><span>Configuración de seguridad</span><small>Por estanque</small></div>
            <div class="acoustic-config-grid">
                <label>Umbral mínimo<input id="acousticThreshold" type="number" min="0" max="1" step="0.01" class="form-control form-control-sm"></label>
                <label>Máximo diario (kg)<input id="acousticDailyLimit" type="number" min="0" step="0.1" class="form-control form-control-sm"></label>
                <label>Máx. eventos<input id="acousticEventLimit" type="number" min="1" class="form-control form-control-sm"></label>
                <label>Espera (min)<input id="acousticInterval" type="number" min="0" step="1" class="form-control form-control-sm"></label>
            </div>
            <button id="btnSaveAcousticConfig" class="btn btn-outline-info btn-sm w-100 mt-3">Guardar configuración</button>
            <div id="acousticReason" class="acoustic-reason">Aún no hay una decisión.</div>
        </section>
    </div>
    <section class="acoustic-panel acoustic-history-panel">
        <div class="acoustic-panel-title"><span>Historial de decisiones</span><small>Últimas evaluaciones</small></div>
        <div id="acousticHistory" class="acoustic-history-empty">Sin evaluaciones registradas.</div>
    </section>
</div>`;
    }
}
