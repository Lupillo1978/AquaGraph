/*EventBus actúa como un intermediario de comunicación entre los diferentes 
módulos de AD&M AquaControl.
Tiene dos funciones principales:
on() → permite suscribirse a un evento.
emit() → permite emitir/disparar un evento y enviar información a quienes estén suscritos.
El beneficio es importante: PondEngine no necesita saber quién va a recibir la información. 
Solamente publica el evento, y los módulos interesados deciden si quieren escucharlo.*/
export default class EventBus {

    constructor() {
        this.events = {};
    }

    /**
     * Registra una función para escuchar un evento.
     *
     * @param {string} event - Nombre del evento.
     * @param {Function} callback - Función que se ejecutará cuando ocurra el evento.
     */
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }

        this.events[event].push(callback);
    }

    /**
     * Emite un evento y ejecuta todos sus callbacks registrados.
     *
     * @param {string} event - Nombre del evento.
     * @param {*} data - Información que se enviará a los listeners.
     */
    emit(event, data = null) {
        if (!this.events[event]) {
            return;
        }

        this.events[event].forEach((callback) => {
            callback(data);
        });
    }
}
