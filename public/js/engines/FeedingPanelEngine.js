import DietController from "../controllers/DietController.js";

export default class FeedingPanelEngine {

    constructor(infoPanel) {

        this.infoPanel = infoPanel;

        this.controller = new DietController();

    }

    async initialize(pond) {

    this.pond = pond;

    console.log(
        "Inicializando alimentación para:",
        pond.name
    );

    await this.loadDiets();

    const btn = document.getElementById(
        "btnSendRation"
    );

    if (btn) {

        btn.onclick = () => {

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

};

    }

}

  calculateDailyFood() {

       const kg = Number(

           document.getElementById(

               "dailyFood"

           ).value

        );

        const grams = kg * 1000;

        console.log(

            "Alimento diario:",

            grams,

            "gramos"

        );

        return grams;

    }

    calculateFoodPerFeeder(totalGrams) {

    const feeders = this.pond.feeders || [];

    if (feeders.length === 0) {

        console.warn(

            "El estanque no tiene alimentadores."

        );

        return 0;

    }

    const gramsPerFeeder =

        totalGrams / feeders.length;

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