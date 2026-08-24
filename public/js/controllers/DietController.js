/*La clase DietController se encarga de gestionar las operaciones relacionadas con 
las dietas y sirve como intermediario entre las demás partes de la aplicación y DietService.
En su constructor crea una instancia de DietService:
this.service = new DietService();
Después, proporciona métodos para realizar las operaciones principales sobre las dietas:
getAll() → obtiene todas las dietas.
getById(id) → obtiene una dieta específica mediante su ID.
create(diet) → crea una nueva dieta.
update(id, diet) → actualiza una dieta existente.
delete(id) → elimina una dieta.
Todos estos métodos son asíncronos y delegan la operación directamente al servicio correspondiente.
En pocas palabras DietController funciona como una capa de control para las operaciones 
CRUD de las dietas. No contiene la lógica de acceso o procesamiento de datos; esa responsabilidad 
la delega a DietService.*/
import DietService from "../services/DietService.js";

export default class DietController {

    constructor() {
        this.service = new DietService();
    }

    async getAll() {
        return await this.service.getAll();
    }

    async getById(id) {
        return await this.service.getById(id);
    }

    async create(diet) {
        return await this.service.create(diet);
    }

    async update(id, diet) {
        return await this.service.update(id, diet);
    }

    async delete(id) {
        return await this.service.delete(id);
    }
}
