const app = require("./server/app");
const config = require("./server/config/serverConfig");

app.listen(config.port, () => {

    console.log("");

    console.log("======================================");

    console.log("AD&M AquaControl");

    console.log(`Servidor iniciado en puerto ${config.port}`);

    console.log("======================================");

});