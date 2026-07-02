require("dotenv").config();

const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname,"public")));

app.get("/api/datos",(req,res)=>{

    const ruta=path.join(__dirname,"data","datos.json");

    fs.readFile(ruta,"utf8",(err,data)=>{

        if(err){

            return res.status(500).json({
                error:"No se pudo leer el archivo."
            });

        }

        res.json(JSON.parse(data));

    });

});

app.listen(PORT,()=>{

    console.log(`Servidor iniciado`);

    console.log(`http://localhost:${PORT}`);

});