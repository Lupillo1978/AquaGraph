export default class DietEditorView {

    render() {

        return `

        <div class="p-3">

            <h4>Nueva Dieta</h4>

            <hr>

            <div class="mb-3">

                <label class="form-label">

                    Nombre

                </label>

                <input

                    id="dietName"

                    class="form-control">

            </div>

            <div class="mb-3">

                <label class="form-label">

                    Descripción

                </label>

                <textarea

                    id="dietDescription"

                    class="form-control">

                </textarea>

            </div>

            <hr>

            <table class="table table-bordered">

                <thead>

                    <tr>

                        <th>Inicio</th>

                        <th>Fin</th>

                        <th>%</th>

                        <th>Intervalo</th>

                        <th></th>

                    </tr>

                </thead>

                <tbody id="dietItems">

                </tbody>

            </table>

            <button

                id="btnAddDietItem"

                class="btn btn-primary">

                Agregar Bloque

            </button>

            <hr>

            <h5>

                Total

                <span id="dietPercentage">

                    0%

                </span>

            </h5>

            <button

                id="btnSaveDiet"

                class="btn btn-success">

                Guardar Dieta

            </button>

        </div>

        `;

    }

}