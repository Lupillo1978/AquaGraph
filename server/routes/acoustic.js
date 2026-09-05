const express = require("express");
const AcousticController = require("../controllers/AcousticController");

const router = express.Router();
const controller = new AcousticController();

router.get("/ponds", controller.ponds.bind(controller));
router.get("/status/pond/:pondId", controller.status.bind(controller));
router.get("/config/:pondId", controller.getConfig.bind(controller));
router.put("/config/:pondId", controller.config.bind(controller));
router.post("/simulate", controller.simulate.bind(controller));
router.get("/history/:pondId", controller.history.bind(controller));
router.post("/history/:pondId/seed", controller.seedHistory.bind(controller));

module.exports = router;
