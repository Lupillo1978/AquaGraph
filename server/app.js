const express = require("express");
const path = require("path");
const routes = require("./routes");


const app = express();

// Middlewares
app.use(express.json());

// Archivos públicos
app.use(express.static(path.join(__dirname, "..", "public")));

app.use("/api", routes);

// Bridge serial service events + auto-connect al Heltec
try {
    const SerialService = require('./utils/SerialService');
    SerialService.on('open', () => console.log('[Serial] connection opened'));
    SerialService.on('close', () => console.log('[Serial] connection closed'));
    SerialService.on('data', d => console.log('[Serial] data:', d));
    SerialService.on('error', e => console.error('[Serial] error:', e && e.message ? e.message : e));

    // Auto-conexión: intenta abrir el puerto serial del Heltec al arrancar.
    // Si no se encuentra el puerto, no bloquea el arranque del servidor.
    (function autoConnect() {
        const preferred = process.env.HELTEC_PORT || 'COM3';
        SerialService.listPorts()
            .then(ports => {
                const candidates = ports.map(p => p.path).filter(Boolean);
                const target = candidates.includes(preferred) ? preferred : candidates[0];
                if (!target) {
                    console.warn('[Serial] No se encontró ningún puerto serial. Heltec seguirá desconectado.');
                    return;
                }
                console.log(`[Serial] Auto-conectando a ${target}...`);
                return SerialService.start(target, 115200);
            })
            .then(() => {
                if (SerialService.getStatus().connected) {
                    console.log(`[Serial] Heltec conectado en ${SerialService.getStatus().path}`);
                }
            })
            .catch(err => {
                console.warn(`[Serial] No se pudo auto-conectar: ${err && err.message ? err.message : err}`);
            });
    })();
} catch (e) {
    console.error('Could not initialize SerialService listeners', e.message || e);
}


// Ruta principal
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

module.exports = app;