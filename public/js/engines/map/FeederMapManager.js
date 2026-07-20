export default class FeederMapManager {

    constructor(feedersLayer) {

        this.feedersLayer = feedersLayer;

        this.markers = new Map();

    }

    add(feeder, marker) {

        this.markers.set(

            feeder.id,

            marker

        );

    }

    get(feederId) {

        return this.markers.get(

            feederId

        );

    }

    remove(feederId) {

        const marker = this.markers.get(

            feederId

        );

        if (!marker) {

            return false;

        }

        this.feedersLayer.removeLayer(

            marker

        );

        this.markers.delete(

            feederId
        );

        return true;

    }

    clear() {

        this.markers.clear();

    }

}