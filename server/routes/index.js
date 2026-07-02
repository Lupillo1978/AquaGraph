const express = require("express");

const router = express.Router();

const pondRoutes = require("./ponds");


router.get("/health", (req, res) => {

    res.json({

        success: true,
        application: "AD&M AquaControl",
        version: "0.2.3"

    });

});

// Rutas de estanques
router.use("/ponds", pondRoutes);

module.exports = router;