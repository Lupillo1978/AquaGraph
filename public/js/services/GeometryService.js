export default class GeometryService {

    /**
     * Calcula el área de un polígono GeoJSON.
     * Devuelve el área en hectáreas.
     */
    calculateArea(geoJson) {

        const areaM2 = turf.area(geoJson);

        return areaM2 / 10000;

    }

    /**
     * Calcula el perímetro de un polígono.
     * Devuelve metros.
     */
    calculatePerimeter(geoJson) {

        const line = turf.polygonToLine(geoJson);

        return turf.length(line, {

            units: "meters"

        });

    }

}