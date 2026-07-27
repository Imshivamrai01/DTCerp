const express = require("express");
const router = express.Router();
const {
  saveRemark,
  updateRemark,
  getRemarkswithRemarkToId,
  getRemarkswithRemarkById,
  getRemarkswithRemarkDate,
  getRemarkswithId,
} = require("../controllers/remarkController");

router.post("/", saveRemark);
router.get("/", getRemarkswithRemarkToId);
router.get("/by", getRemarkswithRemarkById);
router.get("/date", getRemarkswithRemarkDate);
// router.get("/filter", filterData);
router.route("/:id").get(getRemarkswithId).put(updateRemark);
//   .delete(deleteFeeStructure);

module.exports = router;
