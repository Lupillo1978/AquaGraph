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

                labels: [

                    "00","02","04","06","08","10",

                    "12","14","16","18","20","22","24"

                ],

                datasets: [

                    {

                        label: "Distribución de alimento",

                        data: [

                            0,0,0,0,0,0,

                            0,0,0,0,0,0,0

                        ],

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

}