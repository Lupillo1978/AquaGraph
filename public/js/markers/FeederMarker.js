import BaseMarker from "./BaseMarker.js";

export default class FeederMarker {

    static create(label) {

        return BaseMarker.create({

            color:"#9E9E9E",

            icon:"⚙",

            label

        });

    }

}