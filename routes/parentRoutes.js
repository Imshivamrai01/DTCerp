const express = require("express");
const router = express.Router();
const {
  getStudentsForParentRegistration,
  registerParent,
  getParentStudents,
  getStudentAttendance,
  getStudentCopyChecks
} = require("../controllers/parentController");

router.get("/students", getStudentsForParentRegistration);
router.post("/register", registerParent);
router.get("/my-students", getParentStudents);
router.get("/attendance", getStudentAttendance);
router.get("/copy-checks", getStudentCopyChecks);

module.exports = router;
