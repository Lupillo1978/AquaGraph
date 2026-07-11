export default class BaseMarker {

    static create({

        color = "#9E9E9E",

        label = "",

        icon = "⬤"

    }) {

        return L.divIcon({

            className: "adm-marker",

            html: `

                <div class="adm-marker-container">

                    <div
                        class="adm-marker-status"
                        style="background:${color};">

                    </div>

                    <div class="adm-marker-icon">

                        ${icon}

                    </div>

                    <div class="adm-marker-label">

                        ${label}

                    </div>

                </div>

            `,

            iconSize: [42,52],

            iconAnchor: [21,26]

        });

    }

}