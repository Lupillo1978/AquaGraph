const express = require("express");

const router = express.Router();

const pondRoutes = require("./ponds");

const feederRoutes = require("./feeders");

router.get("/health", (req, res) => {

    res.json({

        success: true,
        application: "AD&M AquaControl",
        version: "0.2.3"

    });

});

// Rutas de estanques
router.use("/ponds", pondRoutes);

router.use("/feeders", feederRoutes);


module.exports = router;