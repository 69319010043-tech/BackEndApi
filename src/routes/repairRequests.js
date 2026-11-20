const express = require("express");
const repairRequestsController = require("../controllers/repairRequestsController");

const router = express.Router();

router.get("/", repairRequestsController.listRepairRequests);
router.get("/:id", repairRequestsController.getRepairRequest);
router.post("/", repairRequestsController.createRepairRequest);
router.put("/:id", repairRequestsController.updateRepairRequest);
router.delete("/:id", repairRequestsController.deleteRepairRequest);

module.exports = router;
