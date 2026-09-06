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
                <button id="btnTimelineZoomOut" type="button" class="btn btn-outline-secondary btn-sm" title="Alejar gráfica">−</button>
                <strong id="acousticTimelineZoom">1x</strong>
                <button id="btnTimelineZoomIn" type="button" class="btn btn-outline-secondary btn-sm" title="Acercar gráfica">+</button>
                <button id="btnTimelineZoomReset" type="button" class="btn btn-outline-secondary btn-sm">24 h</button>
            </div>
        </div>
        <div class="acoustic-timeline-nav">
            <button id="btnPreviousAcousticDay" type="button">← Día anterior</button>
            <strong id="acousticTimelineDate">Actividad del estanque</strong>
            <button id="btnNextAcousticDay" type="button">Día siguiente →</button>
        </div>
        <div class="acoustic-timeline-frame">
            <div class="acoustic-fixed-axis acoustic-left-axis" aria-hidden="true">
                <div class="acoustic-axis-scale"><span>40</span><span>30</span><span>20</span><span>10</span><span>0</span></div>
                <b>Tiempo de giro<br>(seg)</b>
            </div>
            <div id="acousticTimelineScroll" class="acoustic-timeline-scroll" tabindex="0" aria-label="Línea temporal desplazable">
                <div id="acousticTimelineContent" class="acoustic-timeline-content">
                    <canvas id="acousticTimeline" height="300"></canvas>
                    <div id="acousticTimelineTooltip" class="acoustic-timeline-tooltip" role="status"></div>
                </div>
            </div>
            <div class="acoustic-fixed-axis acoustic-right-axis" aria-hidden="true">
                <div class="acoustic-axis-scale"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div>
                <b>Respuesta<br>(%)</b>
            </div>
        </div>
        <div class="acoustic-hour-frame">
            <div class="acoustic-hour-axis-spacer"></div>
            <div class="acoustic-hour-scroll">
                <div class="acoustic-hour-title">HORARIO DEL DÍA</div>
                <div id="acousticHourRuler" class="acoustic-hour-ruler" aria-label="Horas del día">
                    <span>00:00</span><span>01:00</span><span>02:00</span><span>03:00</span><span>04:00</span><span>05:00</span>
                    <span>06:00</span><span>07:00</span><span>08:00</span><span>09:00</span><span>10:00</span><span>11:00</span>
                    <span>12:00</span><span>13:00</span><span>14:00</span><span>15:00</span><span>16:00</span><span>17:00</span>
                    <span>18:00</span><span>19:00</span><span>20:00</span><span>21:00</span><span>22:00</span><span>23:00</span>
                </div>
            </div>
            <div class="acoustic-hour-axis-spacer right"></div>
        </div>
        <div class="acoustic-timeline-hint">Deslice la barra inferior para recorrer las 24 horas del día.</div>
        <div class="acoustic-chart-legend">
              <span><i class="legend-red"></i>Respuesta del camarón (%)</span>
              <span><i class="legend-blue"></i>Tiempo de giro (seg)</span>
            <span><i class="legend-yellow"></i>Umbral sónico</span>
            <span><i class="legend-green"></i>Señal estable</span>
            <span><i class="legend-teal"></i>Temperatura del agua</span>
            <span><i class="legend-olive"></i>Oxígeno disuelto</span>
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
