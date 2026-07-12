export default class StateManager {

    constructor() {

        this.state = {

            // =====================================================
            // Información general
            // =====================================================

            farm: null,

            user: null,

            // =====================================================
            // Estanques
            // =====================================================

            ponds: [],

            selectedPond: null,

            // =====================================================
            // Alimentadores
            // =====================================================

            feeders: [],

            selectedFeeder: null

        };

    }

    set(key, value) {

        this.state[key] = value;

    }

    get(key) {

        return this.state[key];

    }

}