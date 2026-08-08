import DietController from "../controllers/DietController.js";
import FeedingCalculator from "../services/FeedingCalculator.js";
import DietChartModal from "../components/DietChartModal.js";


async function fetchJson(url, options = {}) {
    const response = await fetch(url, options);
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(result.error || 'Request failed');
    }
    return result;
}

export default class FeedingPanelEngine {

    constructor(infoPanel) {

        this.infoPanel = infoPanel;

        this.controller = new DietController();

        this.calculator = new FeedingCalculator();

        this.dietChartModal = new DietChartModal();

    }


    async initialize(pond) {

this.pond = pond;
        this.statusElement = document.getElementById('feedingStatus');
        this.bridgeStatusElement = document.getElementById('bridgeStatus');
        this.bridgeStatusBadge = document.getElementById('bridgeStatusBadge');
        this.ackListElement = document.getElementById('ackList');
        this.bridgePortSelect = document.getElementById('bridgePortSelect');
        this.btnRefreshPorts = document.getElementById('btnRefreshPorts');
        this.btnConnectBridge = document.getElementById('btnConnectBridge');
        this.btnDisconnectBridge = document.getElementById('btnDisconnectBridge');

        console.log(
            "Inicializando alimentación para:",
            pond.name
        );

this.bindBridgeEvents();
        await this.loadDiets();
        await this.loadPorts();
        await this.refreshBridgeStatus();

        // Polling periódico para mantener el estado del puente actualizado
        // en tiempo real (clave si el servidor se reconecta automáticamente).
        if (this._pollTimer) {
            clearInterval(this._pollTimer);
        }
        this._pollTimer = setInterval(() => {
            this.refreshBridgeStatus();
            this.refreshAcks();
        }, 3000);

        const btn = document.getElementById(
            "btnSendRation"
        );

        if (btn) {

            btn.onclick = async () => {

                const totalGrams = this.calculateDailyFood();

                const foodPerFeeder =

                    this.calculateFoodPerFeeder(

                        totalGrams

                    );

                const selectedDietId =

                    document.getElementById(

                        "dietSelect"

                    ).value;

                const diet =

                    this.diets.find(

                        d => d.id === selectedDietId

                    );

                console.log(

                    "Dieta seleccionada:",

                    diet

                );

                if (!diet) {

                    alert(

                        "Seleccione una dieta."

                    );

                    return;

                }

                this.calculateBlocks(

                    foodPerFeeder,

                    diet

                );

                const gramsPerSecond = Number(

                    document.getElementById(

                        "gramsPerSecond"

                    ).value

                );

                const program =

                    this.calculator.buildFeedingProgram(

                        this.pond,

                        diet,

                        Number(

                            document.getElementById(

                                "dailyFood"

                            ).value

                        ),

                        gramsPerSecond

                    );

                console.log(

                    "Programa generado:",

                    program

                );

                try {

                    this.setStatus('Enviando programa al Heltec...');

                    const result = await fetchJson('/api/bridge/send-program', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(program)
                    });

                    if (!result.success) {
                        throw new Error(result.error || 'No se pudo enviar la ración');
                    }

                    await this.refreshBridgeStatus();
                    await this.refreshAcks();

                    const acksResult = await fetchJson('/api/bridge/acks');
                    const lastAck = acksResult.data && acksResult.data.length
                        ? acksResult.data[acksResult.data.length - 1]
                        : null;

                    if (lastAck) {
                        this.setStatus(`Confirmado: ${lastAck.nodeId || 'Heltec'} - ${lastAck.status || 'OK'}`);
                    } else {
                        this.setStatus('Programa enviado. Esperando confirmación...');
                    }

                } catch (error) {
                    console.error('Error enviando ración:', error);
                    this.setStatus(error.message || 'Error enviando la ración');
                    alert(error.message || 'Error enviando la ración');
                }

            };

        }

        // Botón "Ver Gráfico" de la dieta seleccionada
        const btnViewChart = document.getElementById(
            "btnViewDietChart"
        );

        if (btnViewChart) {

            btnViewChart.onclick = () => {

                const selectedDietId = document.getElementById(
                    "dietSelect"
                ).value;

                const diet = this.diets.find(
                    d => d.id === selectedDietId
                );

                if (!diet) {

                    alert("Seleccione una dieta para ver su gráfico.");

                    return;

                }

                this.dietChartModal.open(diet);

            };

        }

    }

    async refreshBridgeStatus() {
        try {
            const result = await fetchJson('/api/bridge/status');
            const connected = result && result.status && result.status.connected;
            this.bridgeStatusElement.textContent = connected
                ? `Conectado en ${result.status.path || 'puerto serial'}`
                : 'El Heltec no está conectado aún.';
            this.bridgeStatusBadge.className = `badge ${connected ? 'bg-success' : 'bg-secondary'}`;
            this.bridgeStatusBadge.textContent = connected ? 'Conectado' : 'Desconectado';
        } catch (error) {
            this.bridgeStatusElement.textContent = 'No se pudo consultar el estado del puente.';
            this.bridgeStatusBadge.className = 'badge bg-secondary';
            this.bridgeStatusBadge.textContent = 'Desconocido';
        }
    }

bindBridgeEvents() {
        if (this.btnRefreshPorts) {
            this.btnRefreshPorts.onclick = () => this.loadPorts();
        }
        if (this.btnConnectBridge) {
            this.btnConnectBridge.onclick = () => this.connect();
        }
        if (this.btnDisconnectBridge) {
            this.btnDisconnectBridge.onclick = () => this.disconnect();
        }
    }

    async loadPorts() {
        if (!this.bridgePortSelect) return;
        try {
            const result = await fetchJson('/api/bridge/ports');
            const ports = (result && result.ports) || [];
            this.bridgePortSelect.innerHTML = '';
            if (!ports.length) {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'No se encontraron puertos';
                this.bridgePortSelect.appendChild(option);
                return;
            }
            ports.forEach(p => {
                const option = document.createElement('option');
                option.value = p.path;
                option.textContent = p.path + (p.manufacturer ? ` · ${p.manufacturer}` : '');
                this.bridgePortSelect.appendChild(option);
            });
        } catch (error) {
            this.bridgePortSelect.innerHTML = '<option value="">No se pudieron cargar puertos</option>';
        }
    }

    async connect() {
        const path = this.bridgePortSelect && this.bridgePortSelect.value;
        if (!path) {
            this.setStatus('Seleccione un puerto serial para conectar.');
            return;
        }
        try {
            this.setStatus(`Conectando al Heltec en ${path}...`);
            const result = await fetchJson('/api/bridge/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path, baudRate: 115200 })
            });
            if (!result.success) {
                throw new Error(result.error || 'No se pudo conectar');
            }
            await this.refreshBridgeStatus();
            this.setStatus('Heltec conectado.');
        } catch (error) {
            console.error('Error conectando:', error);
            this.setStatus(error.message || 'Error conectando al Heltec');
            this.refreshBridgeStatus();
        }
    }

    async disconnect() {
        try {
            this.setStatus('Desconectando Heltec...');
            const result = await fetchJson('/api/bridge/disconnect', { method: 'POST' });
            if (!result.success) {
                throw new Error(result.error || 'No se pudo desconectar');
            }
            await this.refreshBridgeStatus();
            this.setStatus('Heltec desconectado.');
        } catch (error) {
            console.error('Error desconectando:', error);
            this.setStatus(error.message || 'Error desconectando al Heltec');
            this.refreshBridgeStatus();
        }
    }

    async refreshAcks() {
        try {
            const result = await fetchJson('/api/bridge/acks');
            const acks = result.data || [];
            this.ackListElement.innerHTML = '';
            if (!acks.length) {
                const item = document.createElement('li');
                item.textContent = 'Sin ACKs recibidos aún.';
                this.ackListElement.appendChild(item);
                return;
            }

            acks.slice(-5).reverse().forEach(ack => {
                const item = document.createElement('li');
                item.textContent = `${ack.nodeId || 'Nodo'} · ${ack.status || 'OK'} · ${ack.message || ''}`;
                this.ackListElement.appendChild(item);
            });
        } catch (error) {
            this.ackListElement.innerHTML = '<li>No se pudieron cargar los ACKs.</li>';
        }
    }

    calculateDailyFood() {

        const kg = Number(

            document.getElementById(

                "dailyFood"

            ).value

        );

        const grams = this.calculator.calculateDailyFood(

            kg

        );

        console.log(

            "Alimento diario:",

            grams,

            "gramos"

        );

        return grams;

    }

    calculateFoodPerFeeder(totalGrams) {

        const feeders = this.pond.feeders || [];

        const gramsPerFeeder =

            this.calculator.calculateFoodPerFeeder(

                totalGrams,

                feeders

            );

        console.log(

            "Alimentadores:",

            feeders.length

        );

        console.log(

            "Gramos por alimentador:",

            gramsPerFeeder

        );

        return gramsPerFeeder;

    }

    calculateBlocks(foodPerFeeder, diet) {

        const blocks = diet.blocks.map(block => {

            const grams =

                foodPerFeeder *

                block.percentage /

                100;

            return {

                ...block,

                grams

            };

        });

        console.log(

            "Bloques calculados:",

            blocks

        );

        return blocks;

    }

    async loadDiets() {

        const response = await this.controller.getAll();

        console.log(

            "Dietas disponibles:",

            response

        );

        if (!response.success) {

            return;

        }

        this.diets = response.data;

        this.fillDietList(

            this.diets

        );

    }

    setStatus(message) {
        if (this.statusElement) {
            this.statusElement.textContent = message;
        }
    }

    fillDietList(diets) {

        const select = document.getElementById(

            "dietSelect"

        );

        if (!select) {

            return;

        }

        select.innerHTML = "";

        const defaultOption = document.createElement("option");

        defaultOption.value = "";

        defaultOption.textContent =

            "Seleccione una dieta...";

        select.appendChild(defaultOption);

        diets.forEach(diet => {

            const option = document.createElement("option");

            option.value = diet.id;

            option.textContent = diet.name;

            select.appendChild(option);

        });

    }


}