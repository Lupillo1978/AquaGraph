const express = require("express");

const router = express.Router();

router.get("/health", (req, res) => {

    res.json({

        success: true,
        application: "AD&M AquaControl",
        version: "0.2.1"

    });

});

module.exports = router;