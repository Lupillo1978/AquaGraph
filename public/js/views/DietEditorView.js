export default class DietEditorView {

    render() {

        return `

<div class="container-fluid diet-editor-shell">

    <div class="row mb-4 align-items-start">

        <div class="col-lg-8">

            <div class="diet-editor-hero">

                <div>

                    <h2 class="mb-1">Editor de Dietas</h2>

                    <p class="mb-0">Diseñe una distribución diaria más clara, ordenada y visualmente cómoda.</p>

                </div>

                <span class="diet-editor-badge">Planificación</span>

            </div>

        </div>

        <div class="col-lg-4">

            <div class="d-flex justify-content-lg-end gap-2 mt-3 mt-lg-0">

                <button id="btnCancelDiet" class="btn btn-outline-light btn-sm">

                    Cancelar

                </button>

                <button id="btnSaveDiet" class="btn btn-success btn-sm">

                    Guardar Dieta

                </button>

            </div>

        </div>

    </div>

    <div class="card mb-3 diet-info-card">

        <div class="card-header">

            Información General

        </div>

        <div class="card-body">

            <div class="row g-3">

                <div class="col-md-5">

                    <label class="form-label">Nombre</label>

                    <input id="dietName" class="form-control">

                </div>

                <div class="col-md-7">

                    <label class="form-label">Descripción</label>

                    <input id="dietDescription" class="form-control">

                </div>

            </div>

        </div>

    </div>

    <div class="row g-3">

        <div class="col-xl-8">

            <div class="card h-100 diet-blocks-card">

                <div class="card-header d-flex justify-content-between align-items-center">

                    <span>Bloques de Alimentación</span>

                    <button id="btnAddDietItem" class="btn btn-primary btn-sm">

                        + Agregar Bloque

                    </button>

                </div>

                <div class="card-body p-0">

                    <div class="diet-table-wrapper">

                        <table class="table table-dark table-hover align-middle diet-editor-table" style="margin-bottom: 0;">

                            <thead>

                                <tr>

                                    <th style="width:125px;">Inicio</th>

                                    <th style="width:125px;">Fin</th>

                                    <th style="width:90px;" class="text-center">%</th>

                                    <th style="width:125px;" class="text-center">Intervalo</th>

                                    <th style="width:95px;" class="text-center">Disparos</th>

                                    <th style="width:85px;" class="text-center">Estado</th>

                                    <th style="width:75px;" class="text-center">Acción</th>

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

                <div class="card-header">Curva de Alimentación</div>

                <div class="card-body p-3">

                    <div class="diet-chart-shell">

                        <canvas id="dietChart" height="320"></canvas>

                    </div>

                </div>

            </div>

        </div>

    </div>

    <div class="card mt-3 diet-summary-card">

        <div class="card-body">

            <div class="row g-3 text-center">

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