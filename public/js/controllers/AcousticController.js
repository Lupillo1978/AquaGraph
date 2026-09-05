export default class AcousticController {

    async getPonds() {
        const response = await fetch("/api/acoustic/ponds");
        return await response.json();
    }

    async getStatus(pondId) {
        const response = await fetch(`/api/acoustic/status/pond/${pondId}`);
        return await response.json();
    }

    async getConfig(pondId) {
        const response = await fetch(`/api/acoustic/config/${pondId}`);
        return await response.json();
    }

    async saveConfig(pondId, config) {
        const response = await fetch(`/api/acoustic/config/${pondId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(config)
        });
        return await response.json();
    }

    async simulate(pondId, input) {
        const response = await fetch("/api/acoustic/simulate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pondId, ...input })
        });
        return await response.json();
    }

    async getHistory(pondId) {
        const response = await fetch(`/api/acoustic/history/${pondId}`);
        return await response.json();
    }

    async seedHistory(pondId) {
        const response = await fetch(`/api/acoustic/history/${pondId}/seed`, {
            method: "POST"
        });
        return await response.json();
    }

}
