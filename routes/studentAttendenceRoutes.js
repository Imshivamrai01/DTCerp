const express = require("express");
const router = express.Router();

const {
  createAttendance,
  updateAttendance,
  getAllAttendance,
  getMonthlySummaryForAllStudents,
  exportMonthlyStudentSummaryCSV,
  getStudentWeeklyReport,
} = require("../controllers/attendanceStuController");

// 🔹 Create attendance
router.post("/create", createAttendance);

// 🔹 Update attendance for a student on a specific date
router.put("/update", updateAttendance);

// 🔹 Get all attendance records (with pagination & date filter)
router.get("/pg", getAllAttendance);
router.get("/summary", getMonthlySummaryForAllStudents);
router.get("/csv", exportMonthlyStudentSummaryCSV);
router.get("/student/weekly-report", getStudentWeeklyReport);

module.exports = router;
