console.log("===== diets.js cargado =====");

const express = require("express");

const router = express.Router();

const DietController = require("../controllers/DietController");

const controller = new DietController();

router.get(

    "/",

    controller.getAll.bind(controller)

);

router.post(

    "/",

    controller.create.bind(controller)

);

module.exports = router;