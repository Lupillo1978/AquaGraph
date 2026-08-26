/*DietChart es el componente encargado de crear y actualizar la gráfica de 
distribución de alimento utilizando Chart.js.
La clase tiene dos responsabilidades principales:
Crear la gráfica.
Actualizarla con los datos de una programación de alimentación.
Utiliza una gráfica de tipo: bar*/

export default class DietChart {

    constructor(canvasId = "dietChart") {
        this.chart = null;
        this.canvasId = canvasId;
    }

    initialize() {
        const canvas = document.getElementById(this.canvasId);

        if (!canvas) {
            return;
        }

        this.chart = new Chart(canvas, {
            type: "bar",

            data: {
                labels: Array.from(
                    { length: 24 },
                    (_, h) => `${h.toString().padStart(2, "0")}:00`
                ),

                datasets: [
                    {
                        label: "Distribución de alimento",

                        data: new Array(24).fill(0),

                        intervals: new Array(24).fill(null),

                        backgroundColor: "rgba(40, 167, 69, 0.85)",
                        hoverBackgroundColor: "rgba(40, 167, 69, 1)",
                        borderColor: "rgba(40, 167, 69, 1)",

                        borderWidth: 1,
                        borderRadius: 4,
                        maxBarThickness: 16
                    }
                ]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,

                plugins: {
                    legend: {
                        display: false
                    },

                    tooltip: {
                        backgroundColor: "rgba(20, 22, 26, 0.95)",
                        titleColor: "#ffffff",
                        bodyColor: "#dee2e6",

                        borderColor: "rgba(40, 167, 69, 0.4)",
                        borderWidth: 1,

                        displayColors: false,

                        callbacks: {
                            label: function (context) {
                                const lines = [];

                                const value =
                                    context.parsed &&
                                    context.parsed.y !== undefined
                                        ? context.parsed.y
                                        : (
                                            context.dataIndex !== undefined
                                                ? context.dataset.data[
                                                    context.dataIndex
                                                ]
                                                : 0
                                        );

                                // Limitar a un máximo de 2 decimales.
                                const percent = parseFloat(
                                    Number(value).toFixed(2)
                                );

                                lines.push(
                                    "Porcentaje: " + percent + " %"
                                );

                                const interval =
                                    context.dataset.intervals &&
                                    context.dataset.intervals[
                                        context.dataIndex
                                    ];

                                if (interval && interval.length) {
                                    lines.push(
                                        "Intervalo: " +
                                        interval.join(", ") +
                                        " min"
                                    );
                                }

                                return lines;
                            }
                        }
                    }
                },

                scales: {
                    x: {
                        title: {
                            display: true,
                            text: "Hora",
                            color: "#adb5bd"
                        },

                        grid: {
                            display: false
                        },

                        ticks: {
                            color: "#adb5bd",
                            maxRotation: 90,
                            autoSkip: true,
                            maxTicksLimit: 12
                        }
                    },

                    y: {
                        beginAtZero: true,
                        max: 100,

                        title: {
                            display: true,
                            text: "%",
                            color: "#adb5bd"
                        },

                        grid: {
                            color: "rgba(255, 255, 255, 0.08)"
                        },

                        ticks: {
                            color: "#adb5bd",

                            callback: function (value) {
                                return value + " %";
                            }
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
        const intervals = new Array(24).fill(null);

        schedule.forEach((event) => {
            const hour = Math.floor(event.minute / 60);

            data[hour] += Number(event.percentage);

            // Recopilar los intervalos presentes en esta hora.
            if (event.interval) {
                if (!intervals[hour]) {
                    intervals[hour] = [];
                }

                if (
                    intervals[hour].indexOf(
                        Number(event.interval)
                    ) === -1
                ) {
                    intervals[hour].push(
                        Number(event.interval)
                    );
                }
            }
        });

        this.chart.data.datasets[0].data = data;

        this.chart.data.datasets[0].intervals = intervals;

        // Ajustar automáticamente la escala del eje Y.
        const max = Math.max(...data);

        this.chart.options.scales.y.max = Math.max(
            10,
            Math.ceil(max / 5) * 5
        );

        this.chart.update();
    }
}
