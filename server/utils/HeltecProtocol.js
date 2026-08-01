function buildHeltecEnvelope(program) {
    return {
        type: 'FEEDING_PROGRAM',
        pondId: program.pondId,
        dietId: program.dietId,
        dailyFoodKg: program.dailyFoodKg,
        gramsPerSecond: program.gramsPerSecond,
        generatedAt: new Date().toISOString(),
        currentTime: new Date().toISOString(),
        requestId: program.requestId || `req-${Date.now()}`,
        nodes: (program.executionProgram || []).map(item => ({
            nodeId: item.nodeId,
            schedule: (item.schedule || []).map(block => ({
                start: block.start,
                interval: block.interval,
                shots: block.shots,
                seconds: block.seconds
            }))
        }))
    };
}

function buildHeltecPayload(program) {
    return JSON.stringify(buildHeltecEnvelope(program));
}

function buildAckEnvelope(requestId, nodeId, status, message = '') {
    return {
        type: 'ACK',
        requestId,
        nodeId,
        status,
        message,
        timestamp: new Date().toISOString()
    };
}

function buildAckPayload(requestId, nodeId, status, message = '') {
    return JSON.stringify(buildAckEnvelope(requestId, nodeId, status, message));
}

module.exports = {
    buildHeltecEnvelope,
    buildHeltecPayload,
    buildAckEnvelope,
    buildAckPayload
};
