export default class StateManager {

    constructor(){

        this.state={

            farm:null,

            pond:null,

            feeder:null,

            user:null

        };

    }

    set(key,value){

        this.state[key]=value;

    }

    get(key){

        return this.state[key];

    }

}