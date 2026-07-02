const express = require("express");
const path = require("path");
const routes = require("./routes");


const app = express();

// Middlewares
app.use(express.json());

// Archivos públicos
app.use(express.static(path.join(__dirname, "..", "public")));

app.use("/api", routes);


// Ruta principal
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

module.exports = app;