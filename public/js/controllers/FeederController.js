/*La clase FeederController se encarga de realizar las operaciones CRUD de los 
alimentadores comunicándose directamente con la API de la aplicación mediante fetch().
Sus métodos son:
getAll() → realiza una petición GET a /api/feeders para obtener todos los alimentadores.
create(feeder) → realiza una petición POST para crear un nuevo alimentador.
update(id, feeder) → realiza una petición PUT para modificar un alimentador existente.
delete(id) → realiza una petición DELETE para eliminar un alimentador.
En las operaciones POST y PUT, el objeto feeder se convierte a JSON mediante:
JSON.stringify(feeder)
y se especifica que el contenido enviado a la API es JSON mediante:
"Content-Type": "application/json"
Finalmente, todas las operaciones convierten la respuesta de la API 
nuevamente a un objeto JavaScript utilizando:
return await response.json();
En pocas palabras
FeederController funciona como el puente entre la aplicación frontend y la API de alimentadores.
La comunicación queda estructurada así:
Interfaz → FeederController → API /api/feeders
Y las operaciones disponibles son:
GET → obtener | POST → crear | PUT → actualizar | DELETE → eliminar*/

export default class FeederController {

    async getAll() {
        const response = await fetch("/api/feeders");

        return await response.json();
    }

    async create(feeder) {
        const response = await fetch(
            "/api/feeders",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(feeder)
            }
        );

        return await response.json();
    }

    async update(id, feeder) {
        const response = await fetch(
            `/api/feeders/${id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(feeder)
            }
        );

        return await response.json();
    }

    async delete(id) {
        const response = await fetch(
            `/api/feeders/${id}`,
            {
                method: "DELETE"
            }
        );

        return await response.json();
    }
}
