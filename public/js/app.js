import { obtenerDatos } from "./api.js";

import { crearDatasets } from "./datasets.js";

import { crearGrafico } from "./chart.js";

async function iniciar() {

    const datos = await obtenerDatos();

    const datasets = crearDatasets(datos);

    const canvas = document.getElementById("grafico");

    crearGrafico(canvas, datasets);

}

iniciar();