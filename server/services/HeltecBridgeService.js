const SerialService = require('../utils/SerialService');
const { buildHeltecPayload, buildAckPayload, buildAckEnvelope } = require('../utils/HeltecProtocol');

class HeltecBridgeService {
    constructor() {
        this.acks = [];
        this.maxAcks = 50;
        this.lastProgram = null;

        this._bindSerialEvents();
    }

    _bindSerialEvents() {
        SerialService.on('data', message => {
            this.handleIncomingMessage(message);
        });
    }

    handleIncomingMessage(message) {
        if (!message) return null;

        if (typeof message === 'string') {
            try {
                message = JSON.parse(message);
            } catch (err) {
                return null;
            }
        }

        if (message.type === 'ACK') {
            const ack = buildAckEnvelope(
                message.requestId || message.requestId || 'unknown',
                message.nodeId || 'UNKNOWN',
                message.status || 'OK',
                message.message || ''
            );

            this.acks.push({ ...ack, receivedAt: new Date().toISOString() });
            if (this.acks.length > this.maxAcks) {
                this.acks.shift();
            }
            return ack;
        }

        return message;
    }

    async sendFeedingProgram(program) {
        if (!program) {
            throw new Error('Program is required');
        }

        if (!SerialService.getStatus().connected) {
            const pendingError = new Error('Heltec not connected');
            pendingError.code = 'HELTEC_DISCONNECTED';
            throw pendingError;
        }

        this.lastProgram = program;
        const payload = buildHeltecPayload(program);
        await SerialService.send(payload);
        return { success: true, payload };
    }

    async sendAckToMaster(requestId, nodeId, status, message = '') {
        if (!SerialService.getStatus().connected) {
            const pendingError = new Error('Heltec not connected');
            pendingError.code = 'HELTEC_DISCONNECTED';
            throw pendingError;
        }

        const payload = buildAckPayload(requestId, nodeId, status, message);
        await SerialService.send(payload);
        return { success: true, payload };
    }

    getAcks() {
        return this.acks;
    }

    getLastProgram() {
        return this.lastProgram;
    }
}

module.exports = new HeltecBridgeService();
