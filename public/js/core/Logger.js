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