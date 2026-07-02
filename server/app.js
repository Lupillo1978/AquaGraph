const express = require("express");
const path = require("path");

const app = express();

// Middlewares
app.use(express.json());

// Archivos públicos
app.use(express.static(path.join(__dirname, "..", "public")));

// Ruta principal
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

module.exports = app;