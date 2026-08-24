export default class DietEditorView {
    render() {
        return `
<div class="container-fluid diet-editor-shell">
    <div class="card mb-2 diet-editor-topbar">
        <div class="card-body py-2">
            <div class="diet-topbar-inner">
                <div class="diet-topbar-title">
                    <h2 class="diet-editor-title mb-0">Editor de Dietas</h2>
                </div>

                <div class="diet-topbar-field">
                    <label class="form-label diet-label">Nombre</label>
                    <input id="dietName" class="form-control form-control-sm">
                </div>

                <div class="diet-topbar-field">
                    <label class="form-label diet-label">Descripción</label>
                    <input id="dietDescription" class="form-control form-control-sm">
                </div>

                <div class="diet-topbar-actions">
                    <button id="btnCancelDiet" class="btn btn-outline-light btn-sm">Cancelar</button>
                    <button id="btnSaveDiet" class="btn btn-success btn-sm">Guardar</button>
                </div>
            </div>
        </div>
    </div>

    <div class="row g-2 diet-main-row">
        <div class="col-xl-8 diet-blocks-col">
            <div class="card h-100 diet-blocks-card">
                <div class="card-header d-flex justify-content-between align-items-center diet-card-header">
                    <span>Bloques de Alimentación</span>
                    <button id="btnAddDietItem" class="btn btn-primary btn-sm">+ Agregar Bloque</button>
                </div>

                <div class="card-body p-0">
                    <div class="diet-table-wrapper">
                        <table class="table table-dark table-hover align-middle diet-editor-table" style="margin-bottom: 0;">
                            <thead>
                                <tr>
                                    <th style="width: 125px;">Inicio</th>
                                    <th style="width: 125px;">Fin</th>
                                    <th style="width: 90px;" class="text-center">%</th>
                                    <th style="width: 125px;" class="text-center">Intervalo</th>
                                    <th style="width: 95px;" class="text-center">Disparos</th>
                                    <th style="width: 85px;" class="text-center">Estado</th>
                                    <th style="width: 75px;" class="text-center">Acción</th>
                                </tr>
                            </thead>
                            <tbody id="dietItems"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-xl-4">
            <div class="card h-100 diet-chart-card">
                <div class="card-header diet-card-header">Distribución de Alimentación por Bloque</div>
                <div class="card-body p-2">
                    <div class="diet-chart-shell">
                        <canvas id="dietChart" height="320"></canvas>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="card mt-2 diet-summary-card">
        <div class="card-body py-2">
            <div class="row g-2 text-center">
                <div class="col-12 col-sm-4">
                    <div class="diet-summary-pill">
                        <strong>Total %</strong>
                        <span id="dietPercentage">0 %</span>
                    </div>
                </div>

                <div class="col-12 col-sm-4">
                    <div class="diet-summary-pill">
                        <strong>Disparos</strong>
                        <span id="dietShots">0</span>
                    </div>
                </div>

                <div class="col-12 col-sm-4">
                    <div class="diet-summary-pill">
                        <strong>Duración</strong>
                        <span id="dietDuration">0 min</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
`;
    }
}
