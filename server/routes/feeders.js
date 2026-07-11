import express from "express";
import FeederController from "../controllers/FeederController.js";

const router = express.Router();

const controller = new FeederController();

router.get(

    "/",

    controller.getAll.bind(controller)

);

router.post(

    "/",

    controller.create.bind(controller)

);

export default router;