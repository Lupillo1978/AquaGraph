export default class DietView {

    render() {

        return `

            <div class="p-3">

                <h4>

                    Dietas

                </h4>

                <hr>

                <button

                    id="btnNewDiet"

                    class="btn btn-success w-100 mb-3">

                    Nueva Dieta

                </button>

                <div id="dietList">

                </div>

            </div>

        `;

    }

}