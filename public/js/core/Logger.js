/*La clase Logger proporciona cuatro métodos estáticos:
Logger.info() → mensajes informativos.
Logger.success() → operaciones completadas correctamente.
Logger.warning() → situaciones que requieren atención, pero no necesariamente detienen la aplicación.
Logger.error() → errores o situaciones críticas.*/

export default class Logger {

    static info(message) {
        console.log(`ℹ️ ${message}`);
    }

    static success(message) {
        console.log(`✅ ${message}`);
    }

    static warning(message) {
        console.warn(`⚠️ ${message}`);
    }

    static error(message) {
        console.error(`❌ ${message}`);
    }

}