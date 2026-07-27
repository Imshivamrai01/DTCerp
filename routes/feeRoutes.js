const express = require("express");
const router = express.Router();
const {
  addFee,
  editFee,
  getDueFee,
  getQaurterlyFee,
  getPendingFee,
  getDueFees,
} = require("../controllers/feeController");

router.post("/", addFee);
router.get("/due", getDueFee);
router.get("/view", getQaurterlyFee);
router.get("/pending", getPendingFee);
router.get("/fee-due", getDueFees);
router.put("/:id", editFee);

module.exports = router;
