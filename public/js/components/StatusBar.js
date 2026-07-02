export default class StatusBar{

    render(){

        document.getElementById("statusBar").innerHTML=`

        <div class="d-flex justify-content-around align-items-center h-100">

            <small>API ●</small>

            <small>MongoDB ○</small>

            <small>Gateway ○</small>

            <small>LoRa ○</small>

            <small>ESP32 0</small>

            <small>v0.2.0</small>

        </div>

        `;

    }

}