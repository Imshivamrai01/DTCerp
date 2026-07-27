const express = require("express");
const router = express.Router();
const {
  createExamRecord,
  listAllExamRecord,
  updateExamRecord,
} = require("../controllers/examRecordController");

router.post("/", createExamRecord);
router.get("/all", listAllExamRecord);
router.route("/:id").put(updateExamRecord);

module.exports = router;
