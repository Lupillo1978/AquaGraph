import { opciones } from "./config.js";

export function crearGrafico(canvas, datos) {

    return new Chart(canvas, {

        type: "line",

        data: {

            datasets: [

                {

                    label: "Tiempo Giro",

                    data: datos.giro,

                    borderColor: "#2979ff",

                    backgroundColor: "#2979ff",

                    borderWidth: 2,

                    tension: .35

                },

                {

                    label: "Oxígeno",

                    data: datos.oxigeno,

                    borderColor: "#43a047",

                    backgroundColor: "#43a047",

                    borderWidth: 2,

                    tension: .35

                },

                {

                    label: "Temperatura",

                    data: datos.temperatura,

                    borderColor: "#fbc02d",

                    backgroundColor: "#fbc02d",

                    borderWidth: 2,

                    tension: .35

                }

            ]

        },

        options: opciones

    });

}