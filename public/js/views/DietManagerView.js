export default class DietManagerView {

    render(diets = []) {

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

                     <th>Bloques</th>

                     <th>Disparos</th>

                     <th>Duración</th>

                     <th>Estado</th>

                    </tr>

                </thead>

                <tbody>

                    ${this.renderRows(diets)}

                </tbody>

            </table>

        </div>

    </div>

</div>

`;

    }

    renderRows(diets) {

    if (!diets.length) {

        return `

<tr>

    <td colspan="5" class="text-center p-4">

        No existen dietas registradas.

    </td>

</tr>

`;

    }

    return diets.map(diet => {

        const blocks = diet.blocks ?? [];

        const totalShots = blocks.reduce((total, block) => {

            const start = block.start.split(":");

            const end = block.end.split(":");

            const startMinutes = Number(start[0]) * 60 + Number(start[1]);

            const endMinutes = Number(end[0]) * 60 + Number(end[1]);

            const duration = endMinutes - startMinutes;

            if (duration <= 0 || block.interval <= 0) {

                return total;

            }

            return total + Math.floor(duration / block.interval);

        }, 0);

        let totalMinutes = 0;

        blocks.forEach(block => {

            const start = block.start.split(":");

            const end = block.end.split(":");

            totalMinutes +=

                (Number(end[0]) * 60 + Number(end[1])) -

                (Number(start[0]) * 60 + Number(start[1]));

        });

        const hours = Math.floor(totalMinutes / 60);

        const minutes = totalMinutes % 60;

        const durationText =

            hours + " h " + minutes + " min";

        return `

<tr
 class="diet-row"

    data-id="${diet.id}"
>

    <td>${diet.name}</td>

    <td>${blocks.length}</td>

    <td>${totalShots}</td>

    <td>${durationText}</td>

    <td>

        ${diet.active ? "🟢 Activa" : "⚪ Inactiva"}

    </td>

</tr>

`;

    }).join("");

}

}