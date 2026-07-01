export function crearDatasets(datos) {

    return {

        giro: datos.map(item => ({
            x: item.fecha,
            y: item.giro
        })),

        oxigeno: datos.map(item => ({
            x: item.fecha,
            y: item.oxigeno
        })),

        temperatura: datos.map(item => ({
            x: item.fecha,
            y: item.temperatura
        }))

    };

}