/*La clase StatusBar se encarga de generar y mostrar la barra de estado 
inferior de la aplicación.
Su único método, render(), busca el elemento HTML con el identificador statusBar 
y coloca dentro de él una serie de indicadores relacionados con el estado 
de los diferentes componentes del sistema:
API,MongoDB,Gateway,LoRa,ESP32,Versión de la aplicación (v0.2.0)
La barra utiliza clases de Bootstrap para distribuir y alinear horizontalmente los indicadores.
En pocas palabras StatusBar funciona como un indicador visual del estado de los 
servicios y dispositivos de AquaControl, mostrando al usuario información básica 
sobre la conectividad y la versión actual del sistema.*/
export default class StatusBar {

    render() {
        document.getElementById("statusBar").innerHTML = `
            <div class="d-flex justify-content-around align-items-center h-100">

                <small>API ●</small>
                <small>MongoDB ○</small>
                <small>Gateway ●</small>
                <small>LoRa ●</small>
                <small>ESP32 0</small>
                <small>v1.1.1</small>

            </div>
        `;
    }
}
