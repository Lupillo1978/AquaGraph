export default class DietEditorView {

    render() {

        return `

<div class="container-fluid">

    <div class="row mb-3">

        <div class="col">

            <h2>

                Editor de Dietas

            </h2>

            <small class="text-secondary">

                Diseñe la distribución diaria del alimento

            </small>

        </div>

        <div class="col-auto">

            <div class="d-flex justify-content-end gap-2">

    <button

        id="btnCancelDiet"

        class="btn btn-secondary">

        Cancelar

    </button>

    <button

        id="btnSaveDiet"

        class="btn btn-success">

        Guardar Dieta

    </button>

</div>

        </div>

    </div>

    <div class="card mb-3">

        <div class="card-header">

            Información General

        </div>

        <div class="card-body">

            <div class="row">

                <div class="col-md-5">

                    <label class="form-label">

                        Nombre

                    </label>

                    <input

                        id="dietName"

                        class="form-control">

                </div>

                <div class="col-md-7">

                    <label class="form-label">

                        Descripción

                    </label>

                    <input

                        id="dietDescription"

                        class="form-control">

                </div>

            </div>

        </div>

    </div>

    <div class="row">

        <div class="col-lg-7">

            <div class="card h-100">

                <div class="card-header d-flex justify-content-between">

                    <span>

                        Bloques de Alimentación

                    </span>

                    <button

                        id="btnAddDietItem"

                        class="btn btn-primary btn-sm">

                        + Agregar Bloque

                    </button>

                </div>

                <div class="card-body p-0">

                    <table class="table table-dark table-hover align-middle" 
                            style="table-layout:fixed;">

                        <thead>

<tr>

    <th style="width:110px;">Inicio</th>

    <th style="width:110px;">Fin</th>

    <th style="width:90px;" class="text-center">

        %

    </th>

    <th style="width:110px;" class="text-center">

        Intervalo

    </th>

    <th style="width:90px;" class="text-center">

        Disparos

    </th>

    <th style="width:80px;" class="text-center">

        Estado

    </th>

    <th style="width:70px;" class="text-center">

        Acción

    </th>

</tr>

</thead>

                        <tbody id="dietItems">

                        </tbody>

                    </table>

                </div>

            </div>

        </div>

        <div class="col-lg-5">

            <div class="card h-100">

                <div class="card-header">

                    Curva de Alimentación

                </div>

                <div class="card-body d-flex justify-content-center align-items-center">

                    <div class="text-center text-secondary">

                       <canvas

                          id="dietChart"

                          height="260">

                        </canvas>

                    </div>

                </div>

            </div>

        </div>

    </div>

    <div class="card mt-3">

        <div class="card-body">

            <div class="row text-center">

                <div class="col">

                    <strong>

                        Total %

                    </strong>

                    <br>

                    <span id="dietPercentage">

                        0 %

                    </span>

                </div>

                <div class="col">

                    <strong>

                        Disparos

                    </strong>

                    <br>

                    <span id="dietShots">

                        0

                    </span>

                </div>

                <div class="col">

                    <strong>

                        Duración

                    </strong>

                    <br>

                    <span id="dietDuration">

                        0 min

                    </span>

                </div>

            </div>

        </div>

    </div>

</div>

`;

    }

}