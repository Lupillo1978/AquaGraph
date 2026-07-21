export default class DietItemRow {

    constructor(item, index) {

        this.item = item;

        this.index = index;

    }

    render() {

    return `

<tr data-index="${this.index}">

    <td>

        <input
            type="time"
            class="form-control diet-start"
            value="${this.item.start}">

    </td>

    <td>

        <input
            type="time"
            class="form-control diet-end"
            value="${this.item.end}">

    </td>

    <td>

        <input
            type="number"
            class="form-control diet-percentage"
            min="0"
            max="100"
            value="${this.item.percentage}">

    </td>

    <td>

        <input
            type="number"
            class="form-control diet-interval"
            min="1"
            value="${this.item.interval}">

    </td>

    <td class="diet-shots text-center">

        -

    </td>

    <td class="diet-status text-center">

        ⚪

    </td>

    <td>

        <button
            class="btn btn-danger btnDeleteDietItem">

            🗑

        </button>

    </td>

</tr>

`;

}

}