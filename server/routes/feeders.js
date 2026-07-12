console.log("===== feeders.js cargado =====");

const express = require("express");

const router = express.Router();

const FeederController = require("../controllers/FeederController");

const controller = new FeederController();

router.get(

    "/",

    controller.getAll.bind(controller)

);

router.post(

    "/",

    controller.create.bind(controller)

);

module.exports = router;