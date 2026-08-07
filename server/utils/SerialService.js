const EventEmitter = require("events");
const { SerialPort } = require("serialport");

class SerialService extends EventEmitter {
constructor() {
        super();
        this.port = null;
        this.buffer = "";
        this.connection = {
            path: null,
            baudRate: null,
            connected: false
        };
        this.reconnectTimer = null;
        this.reconnectDelayMs = 2000;
        this.autoReconnect = true;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 0; // 0 = reintentos ilimitados
    }

    _scheduleReconnect() {
        if (!this.autoReconnect) return;
        if (!this.connection.path) return;
        if (this.reconnectAttempts >= this.maxReconnectAttempts && this.maxReconnectAttempts > 0) {
            console.warn(`[Serial] Se alcanzó el máximo de reintentos (${this.maxReconnectAttempts}).`);
            return;
        }
        if (this.reconnectTimer) return; // ya hay un reintento programado

        const target = this.connection.path;
        const baud = this.connection.baudRate || 115200;
        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.reconnectAttempts++;
            console.log(`[Serial] Reintentando reconexión (${this.reconnectAttempts}) a ${target}...`);
            this.start(target, baud).catch(err => {
                console.warn(`[Serial] Reintento falló: ${err && err.message ? err.message : err}`);
            });
        }, this.reconnectDelayMs);
    }

    async listPorts() {
        try {
            const ports = await SerialPort.list();
            return ports;
        } catch (err) {
            throw err;
        }
    }

    getStatus() {
        return {
            path: this.connection.path,
            baudRate: this.connection.baudRate,
            connected: this.connection.connected
        };
    }

start(path, baudRate = 115200) {
        return new Promise((resolve, reject) => {
            if (this.port && this.port.isOpen) {
                console.log(`[Serial] already connected on ${this.connection.path}`);
                return resolve(this.port);
            }

            this.autoReconnect = true; // reactiva la reconexión automática al conectar
            this.buffer = "";
            this.connection.path = path;
            this.connection.baudRate = baudRate;
            console.log(`[Serial] attempting to open ${path} at ${baudRate} bps`);
            this.port = new SerialPort({ path, baudRate, autoOpen: false });

this.port.on('open', () => {
                console.log(`[Serial] connection opened on ${path}`);
                this.connection.connected = true;
                this.reconnectAttempts = 0; // reset contador al reconectar con éxito
                this.emit('open', { path, baudRate });
                resolve(this.port);
            });

            this.port.open(err => {
                if (err) {
                    console.error(`[Serial] open failed on ${path}: ${err.message || err}`);
                    this.emit('error', err);
                    this.connection.connected = false;
                    this._scheduleReconnect();
                    return reject(err);
                }
            });

            this.port.on('data', chunk => {
                try {
                    const text = chunk.toString('utf8');
                    this.buffer += text;
                    let idx;
                    while ((idx = this.buffer.indexOf('\n')) >= 0) {
                        const line = this.buffer.slice(0, idx).trim();
                        this.buffer = this.buffer.slice(idx + 1);
                        if (line.length) {
                            // try parse JSON, otherwise emit raw
                            try {
                                const obj = JSON.parse(line);
                                this.emit('data', obj);
                            } catch (e) {
                                this.emit('data', line);
                            }
                        }
                    }
                } catch (e) {
                    this.emit('error', e);
                }
            });

this.port.on('close', () => {
                console.log('[Serial] connection closed');
                this.connection.connected = false;
                this.emit('close');
                this._scheduleReconnect();
            });
            this.port.on('error', err => {
                console.error(`[Serial] error: ${err.message || err}`);
                this.connection.connected = false;
                this.emit('error', err);
                this._scheduleReconnect();
            });
        });
    }

    send(message) {
        return new Promise((resolve, reject) => {
            if (!this.port || !this.port.isOpen) {
                return reject(new Error('Serial port not open'));
            }

            const payload = typeof message === 'string' ? message : JSON.stringify(message);
            this.port.write(payload + '\n', err => {
                if (err) return reject(err);
                this.port.drain(drainErr => {
                    if (drainErr) return reject(drainErr);
                    resolve();
                });
            });
        });
    }

stop() {
        return new Promise((resolve, reject) => {
            // Desactiva la reconexión automática durante una desconexión manual
            this.autoReconnect = false;
            if (this.reconnectTimer) {
                clearTimeout(this.reconnectTimer);
                this.reconnectTimer = null;
            }
            if (!this.port) return resolve();
            if (!this.port.isOpen) return resolve();
            this.port.close(err => {
                if (err) return reject(err);
                resolve();
            });
        });
    }
}

module.exports = new SerialService();
