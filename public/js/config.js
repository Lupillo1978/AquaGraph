export const opciones = {

    responsive: true,

    maintainAspectRatio: false,

    interaction: {

        mode: "index",

        intersect: false

    },

    scales: {

        x: {

            type: "time",

            time: {

                unit: "hour",

                displayFormats: {

                    hour: "HH:mm"

                }

            },

            title: {

                display: true,

                text: "Hora"

            }

        },

        y: {

            title: {

                display: true,

                text: "Tiempo Giro"

            }

        }

    }

};