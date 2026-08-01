import DietController from "../controllers/DietController.js";
import FeedingCalculator from "../services/FeedingCalculator.js";

export default class FeedingPanelEngine {

    constructor(infoPanel) {

        this.infoPanel = infoPanel;

        this.controller = new DietController();

        this.calculator = new FeedingCalculator();

    }

    async initialize(pond) {

        this.pond = pond;
        this.statusElement = document.getElementById('feedingStatus');

        console.log(
            "Inicializando alimentación para:",
            pond.name
        );

        await this.loadDiets();

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

                    const response = await fetch('/api/bridge/send-program', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(program)
                    });

                    const result = await response.json();

                    if (!response.ok || !result.success) {
                        throw new Error(result.error || 'No se pudo enviar la ración');
                    }

                    const acksResponse = await fetch('/api/bridge/acks');
                    const acksResult = await acksResponse.json();
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