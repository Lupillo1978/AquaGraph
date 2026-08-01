export default class DietItemRow {

    constructor(item, index) {

        this.item = item;

        this.index = index;

    }

    render() {

        return `

<tr data-index="${this.index}" class="diet-row">

    <td class="py-3">

        <input
            type="time"
            class="form-control form-control-sm diet-start"
            value="${this.item.start}">

    </td>

    <td class="py-3">

        <input
            type="time"
            class="form-control form-control-sm diet-end"
            value="${this.item.end}">

    </td>

    <td class="py-3">

        <input
            type="number"
            class="form-control form-control-sm diet-percentage"
            min="0"
            max="100"
            value="${this.item.percentage}">

    </td>

    <td class="py-3">

        <input
            type="number"
            class="form-control form-control-sm diet-interval"
            min="1"
            value="${this.item.interval}">

    </td>

    <td class="diet-shots text-center py-3">

        -

    </td>

    <td class="diet-status text-center py-3">

        ⚪

    </td>

    <td class="py-3">

        <button
            class="btn btn-outline-danger btn-sm btnDeleteDietItem"
            title="Eliminar bloque ${this.index + 1}">

            🗑

        </button>

    </td>

</tr>

`;

    }

}