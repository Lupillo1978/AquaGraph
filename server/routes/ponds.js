const express = require("express");

const router = express.Router();

const PondController = require("../controllers/PondController");

router.get("/", (req, res) => {

    PondController.getAll(req, res);

});

router.post("/", (req, res) => {

    PondController.create(req, res);

});


module.exports = router;