const express = require('express');
const router = express.Router();
const teacherAttendanceController = require('../controllers/attendanceTechController');

// Create attendance record
router.post('/', teacherAttendanceController.createAttendance);
router.get('/pg', teacherAttendanceController.getAllAttendance);
router.get('/summary', teacherAttendanceController.getMonthlySummaryForAllTeachers);
router.get('/csv', teacherAttendanceController.exportMonthlySummaryCSV);
router.put('/update', teacherAttendanceController.updateAttendance);
router.put('/departure', teacherAttendanceController.markDeparture);

module.exports = router;