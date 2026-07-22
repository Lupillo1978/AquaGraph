export default class DietManagerView {

    render() {

        return `

<div class="container-fluid">

    <div class="row mb-3">

        <div class="col">

            <h2>

                Administrador de Dietas

            </h2>

            <small class="text-secondary">

                Catálogo de dietas disponibles

            </small>

        </div>

        <div class="col-auto">

            <button

                id="btnNewDiet"

                class="btn btn-success">

                Nueva Dieta

            </button>

        </div>

    </div>

    <div class="card">

        <div class="card-header">

            Dietas Registradas

        </div>

        <div class="card-body p-0">

            <table class="table table-dark table-hover mb-0">

                <thead>

                    <tr>

                        <th>Nombre</th>

                        <th>Descripción</th>

                        <th>Estado</th>

                    </tr>

                </thead>

                <tbody id="dietList">

                </tbody>

            </table>

        </div>

    </div>

</div>

`;

    }

}