const express = require("express");
const router = express.Router();
const {
  createAssignment,
  getAllAssignments,
  updateAssignment,
  getAssignmentsByTeacher,
  updateSubmissionDate,
} = require("../controllers/coordinatorAssignmentController");

router.post("/", createAssignment);
router.get("/all", getAllAssignments);
router.get("/teacher", getAssignmentsByTeacher);
router.put("/submission/:id", updateSubmissionDate);
router.put("/:id", updateAssignment);

module.exports = router;