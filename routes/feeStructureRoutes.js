const express = require("express");
const router = express.Router();
const {
  createFeeStructure,
  editFeeStructure,
  getSingleFeeStructure,
  getAllFeeStructure,
  deleteFeeStructure,
  filterData,
} = require("../controllers/feeStructureController");

router.post("/", createFeeStructure);
router.get("/all", getAllFeeStructure);
router.get("/filter", filterData);
router
  .route("/:id")
  .get(getSingleFeeStructure)
  .put(editFeeStructure)
  .delete(deleteFeeStructure);

module.exports = router;
