const app = require("./server/app");
const config = require("./server/config/serverConfig");

app.listen(config.port, '0.0.0.0' , () => {
    console.log("==");
    console.log("AD&M");
    console.log(`Servidor iniciado en puerto ${config.port}`);
    console.log("==");
});