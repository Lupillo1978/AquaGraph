const SerialService = require('../utils/SerialService');
const { buildHeltecPayload } = require('../utils/HeltecProtocol');

class HeltecBridgeService {
    async sendFeedingProgram(program) {
        if (!program) {
            throw new Error('Program is required');
        }

        if (!SerialService.getStatus().connected) {
            throw new Error('Heltec not connected');
        }

        const payload = buildHeltecPayload(program);
        await SerialService.send(payload);
        return { success: true, payload };
    }
}

module.exports = new HeltecBridgeService();
