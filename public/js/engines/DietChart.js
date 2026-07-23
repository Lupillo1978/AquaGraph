export default class DietChart {

    constructor() {

        this.chart = null;

    }

    initialize() {

        const canvas = document.getElementById("dietChart");

        if (!canvas) {

            return;

        }

        this.chart = new Chart(canvas, {

            type: "line",

            data: {

                labels: Array.from(

                 { length: 24 },

                 (_, h) =>

                  h.toString().padStart(2,"0")+":00"

                ),

                datasets: [

                    {

                        label: "Distribución de alimento",

                        data: new Array(24).fill(0),

                        tension:0.35,

                        fill:true

                    }

                ]

            },

            options: {

                responsive:true,

                maintainAspectRatio:false,

                plugins:{

                    legend:{

                        display:false

                    }

                },

                scales:{

                    x:{

                        title:{

                            display:true,

                            text:"Hora"

                        }

                    },

                    y:{

                        beginAtZero:true,

                        max:100,

                        title:{

                            display:true,

                            text:"%"

                        }

                    }

                }

            }

        });

    }


    update(schedule) {

    if (!this.chart) {

        return;

    }

    const data = new Array(24).fill(0);

    schedule.forEach(event => {

        const hour = Math.floor(

            event.minute / 60

        );

        data[hour] += Number(

            event.percentage

        );

    });

    this.chart.data.datasets[0].data = data;

    /*-----------------------------------
      Escala automática
    -----------------------------------*/

    const max = Math.max(...data);

    this.chart.options.scales.y.max =

        Math.max(

            10,

            Math.ceil(max / 5) * 5

        );

    this.chart.update();

}
}