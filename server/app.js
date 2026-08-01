const express = require("express");
const path = require("path");
const routes = require("./routes");


const app = express();

// Middlewares
app.use(express.json());

// Archivos públicos
app.use(express.static(path.join(__dirname, "..", "public")));

app.use("/api", routes);

// Bridge serial service events (no auto-start)
try {
    const SerialService = require('./utils/SerialService');
    SerialService.on('open', () => console.log('[Serial] connection opened'));
    SerialService.on('close', () => console.log('[Serial] connection closed'));
    SerialService.on('data', d => console.log('[Serial] data:', d));
    SerialService.on('error', e => console.error('[Serial] error:', e && e.message ? e.message : e));
} catch (e) {
    console.error('Could not initialize SerialService listeners', e.message || e);
}


// Ruta principal
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

module.exports = app;