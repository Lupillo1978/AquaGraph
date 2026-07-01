export async function obtenerDatos() {

    try {

        const respuesta = await fetch("/api/datos");

        if (!respuesta.ok) {
            throw new Error("Error obteniendo datos.");
        }

        return await respuesta.json();

    } catch (error) {

        console.error(error);

        return [];

    }

}