/*La clase PondController se encarga de controlar las operaciones relacionadas 
con los estanques y delega la lógica de acceso a datos en PondService.
En el constructor se crea una instancia del servicio:
this.service = new PondService();
Después dispone de dos operaciones:
create(pond) → solicita a PondService la creación de un nuevo estanque.
getAll() → solicita a PondService todos los estanques disponibles.
Ambos métodos son asíncronos porque trabajan con operaciones que probablemente 
implican comunicación con una API o fuente de datos.
En pocas palabras, PondController funciona como una capa de control para 
los estanques, delegando las operaciones al servicio correspondiente.*/

import PondService from "../services/PondService.js";

export default class PondController {

    constructor() {
        this.service = new PondService();
    }

    async create(pond) {
        return await this.service.create(pond);
    }

    async getAll() {
        return await this.service.getAll();
    }
}
