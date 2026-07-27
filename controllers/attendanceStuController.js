const Attendance = require("../models/studentAttendenceModel"); // Your new student attendance model
const Student = require("../models/studentModel"); // Your Student model

exports.createAttendance = async (req, res) => {
  try {
    const { student, status, date } = req.body;

    // Validate required fields
    if (!student || !status) {
      return res.status(400).json({
        success: false,
        error: "Student ID and status are required fields",
      });
    }

    // Validate status value
    if (!["Present", "Absent"].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Status must be either "Present" or "Absent"',
      });
    }

    // Find student with proper error handling
    const studentDoc = await Student.findOne({
      _id: student,
      isDeleted: { $ne: true },
    }).lean();
    if (!studentDoc) {
      return res.status(404).json({
        success: false,
        error: "Student not found",
      });
    }

    // Check for existing attendance
    const existingAttendance = await Attendance.findOne({
      student,
      date: date || new Date().toISOString().split("T")[0],
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        error:
          "Attendance already exists for this student on the selected date",
      });
    }

    // Create new attendance with proper field mapping
    const newAttendance = new Attendance({
      student: studentDoc._id,
      rollNumber: studentDoc.rollNumber,
      name: studentDoc.name,
      studentClass: studentDoc.studentClass || studentDoc.class, // Handle both cases
      studentSection: studentDoc.studentSection || studentDoc.section, // Handle both cases
      status,
      date: date || new Date(),
    });

    const savedAttendance = await newAttendance.save();

    return res.status(201).json({
      success: true,
      message: "Attendance recorded successfully",
      data: savedAttendance,
    });
  } catch (error) {
    console.error("Attendance creation error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};

// Update student attendance for a specific date
exports.updateAttendance = async (req, res) => {
  try {
    const { student, status, date } = req.body;

    // Validate required fields
    if (!student || !date || !status) {
      return res.status(400).json({
        success: false,
        error: "Student ID, date, and status are all required fields",
      });
    }

    // Validate status
    if (!["Present", "Absent"].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Status must be either "Present" or "Absent"',
      });
    }

    // Validate date format
    const attendanceDate = new Date(date);
    if (isNaN(attendanceDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: "Invalid date format",
      });
    }

    // Set date range for the entire day
    const startOfDay = new Date(attendanceDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(attendanceDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Find and update attendance
    const updatedAttendance = await Attendance.findOneAndUpdate(
      {
        student,
        date: { $gte: startOfDay, $lte: endOfDay },
      },
      { status },
      {
        new: true,
        runValidators: true, // Ensures the update respects schema validation
      }
    );

    if (!updatedAttendance) {
      return res.status(404).json({
        success: false,
        error:
          "No attendance record found for this student on the specified date",
      });
    }

    res.status(200).json({
      success: true,
      message: "Attendance updated successfully",
      data: updatedAttendance,
    });
  } catch (error) {
    console.error("Update attendance error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};

// Get all attendance records with optional date filter
exports.getAllAttendance = async (req, res) => {
  try {
    const filter = {};

    // Add date filter
    if (req.query.date) {
      const startOfDay = new Date(req.query.date + "T00:00:00.000+05:30");
      const endOfDay = new Date(req.query.date + "T23:59:59.999+05:30");
      filter.date = { $gte: startOfDay, $lte: endOfDay };
    }

    // Add class filter
    if (req.query.class && req.query.class !== "all") {
      filter.studentClass = req.query.class;
    }

    // Add section filter
    // if (req.query.section && req.query.section !== "all") {
    //   filter.studentSection = req.query.section;
    // }

    const records = await Attendance.find(filter).sort({ name: 1 });

    if (!records || records.length === 0) {
      return res.status(200).json({ 
        message: "No attendance records found",
        data: [],
        total: 0
      });
    }

    const total = records.length;

    res.status(200).json({
      message: "Attendance fetched successfully",
      data: records,
      total,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get monthly summary for all students
exports.getMonthlySummaryForAllStudents = async (req, res) => {
  try {
    const {
      class: studentClass,
      section: studentSection,
      month,
      year,
    } = req.query;

    if (!month || !year) {
      return res.status(400).json({ error: "month and year are required" });
    }

    const numericMonth = parseInt(month) - 1;
    const startDate = new Date(year, numericMonth, 1);
    const endDate = new Date(year, numericMonth + 1, 0, 23, 59, 59, 999);

    // Dynamically build the student filter
    const studentMatch = { isDeleted: { $ne: true } };

    if (studentClass) {
      studentMatch.studentClass = studentClass;
    }

    if (studentSection) {
      studentMatch.studentSection = studentSection;
    }

    const summary = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $lookup: {
          from: "students",
          localField: "student",
          foreignField: "_id",
          as: "studentInfo",
          pipeline: [{ $match: studentMatch }],
        },
      },
      {
        $unwind: "$studentInfo",
      },
      {
        $group: {
          _id: {
            studentId: "$student",
            name: "$studentInfo.name",
            rollNumber: "$studentInfo.rollNumber",
            studentClass: "$studentInfo.studentClass",
            studentSection: "$studentInfo.studentSection",
          },
          statuses: { $push: "$status" },
        },
      },
      {
        $project: {
          studentId: "$_id.studentId",
          name: "$_id.name",
          rollNumber: "$_id.rollNumber",
          studentClass: "$_id.studentClass",
          studentSection: "$_id.studentSection",
          presentCount: {
            $size: {
              $filter: {
                input: "$statuses",
                as: "status",
                cond: { $eq: ["$$status", "Present"] },
              },
            },
          },
          absentCount: {
            $size: {
              $filter: {
                input: "$statuses",
                as: "status",
                cond: { $eq: ["$$status", "Absent"] },
              },
            },
          },
          totalDays: { $size: "$statuses" },
        },
      },
      {
        $sort: { name: 1 },
      },
    ]);

    res.status(200).json({
      success: true,
      month,
      year,
      class: studentClass || "All",
      section: studentSection || "All",
      data: summary,
    });
  } catch (error) {
    console.error("Error generating student summary:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

exports.exportMonthlyStudentSummaryCSV = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ error: "month and year are required" });
    }

    const numericMonth = parseInt(month) - 1;
    const startDate = new Date(year, numericMonth, 1);
    const endDate = new Date(year, numericMonth + 1, 0, 23, 59, 59, 999);

    const summary = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $lookup: {
          from: "students",
          localField: "student",
          foreignField: "_id",
          as: "studentInfo",
        },
      },
      {
        $unwind: "$studentInfo",
      },
      {
        $group: {
          _id: {
            studentId: "$student",
            name: "$studentInfo.name",
            rollNumber: "$studentInfo.rollNumber",
            studentClass: "$studentInfo.studentClass",
            studentSection: "$studentInfo.studentSection",
          },
          statuses: { $push: "$status" },
        },
      },
      {
        $project: {
          studentId: "$_id.studentId",
          name: "$_id.name",
          rollNumber: "$_id.rollNumber",
          studentClass: "$_id.studentClass",
          studentSection: "$_id.studentSection",
          presentCount: {
            $size: {
              $filter: {
                input: "$statuses",
                as: "status",
                cond: { $eq: ["$$status", "Present"] },
              },
            },
          },
          absentCount: {
            $size: {
              $filter: {
                input: "$statuses",
                as: "status",
                cond: { $eq: ["$$status", "Absent"] },
              },
            },
          },
          totalDays: { $size: "$statuses" },
        },
      },
      {
        $sort: { name: 1 },
      },
    ]);

    // Prepare CSV
    let csv = "Name,Roll Number,Class,Section,Present,Absent,Total Days\n";

    summary.forEach((student) => {
      csv += `"${student.name}","${student.rollNumber}","${student.studentClass}","${student.studentSection}",${student.presentCount},${student.absentCount},${student.totalDays}\n`;
    });

    // Set response headers
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=student_attendance_summary_${month}_${year}.csv`
    );

    res.status(200).end(csv);
  } catch (error) {
    console.error("Error exporting student CSV:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Get weekly attendance report for a specific student
exports.getStudentWeeklyReport = async (req, res) => {
  try {
    const { studentId, startDate } = req.query;

    if (!studentId || !startDate) {
      return res.status(400).json({
        success: false,
        error: "Student ID and start date are required",
      });
    }

    // Parse the start date
    const start = new Date(startDate);
    if (isNaN(start.getTime())) {
      return res.status(400).json({
        success: false,
        error: "Invalid start date format",
      });
    }

    // Calculate end date (7 days from start date)
    const end = new Date(start);
    end.setDate(end.getDate() + 6); // 7 days total (including start date)
    end.setHours(23, 59, 59, 999);

    const mongoose = require("mongoose");

    // Set start to beginning of day
    start.setHours(0, 0, 0, 0);

    const studentObjectId = mongoose.Types.ObjectId.isValid(studentId)
      ? new mongoose.Types.ObjectId(studentId)
      : studentId;

    // Find the student
    const attendanceRecord = await Attendance.findOne({
      student: studentObjectId,
    });
    if (!attendanceRecord) {
      return res.status(404).json({
        success: false,
        error: "Student attendance record not found",
      });
    }

    // Get attendance records for the week
    const attendanceRecords = await Attendance.find({
      student: studentObjectId,
      date: { $gte: start, $lte: end },
    }).sort({ date: 1 });

    // Create a day-by-day report
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dailyReport = [];

    // Initialize with all days in the range
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(currentDate.getDate() + i);

      dailyReport.push({
        date: currentDate.toISOString().split("T")[0],
        day: daysOfWeek[currentDate.getDay()],
        status: "No record", // Default status
        recorded: false,
      });
    }

    // Fill in actual attendance data
    attendanceRecords.forEach((record) => {
      const recordDate = new Date(record.date);
      const dayIndex = Math.floor((recordDate - start) / (24 * 60 * 60 * 1000));

      if (dayIndex >= 0 && dayIndex < 7) {
        dailyReport[dayIndex].status = record.status;
        dailyReport[dayIndex].recorded = true;
      }
    });

    // Calculate summary
    const presentCount = attendanceRecords.filter(
      (r) => r.status === "Present"
    ).length;
    const absentCount = attendanceRecords.filter(
      (r) => r.status === "Absent"
    ).length;
    const totalRecorded = presentCount + absentCount;
    const attendancePercentage =
      totalRecorded > 0 ? ((presentCount / totalRecorded) * 100).toFixed(2) : 0;

    res.status(200).json({
      success: true,
      data: {
        student: {
          id: attendanceRecord.student,
          name: attendanceRecord.name,
          rollNumber: attendanceRecord.rollNumber,
          class: attendanceRecord.studentClass,
          section: attendanceRecord.studentSection,
        },
        reportPeriod: {
          from: start.toISOString().split("T")[0],
          to: end.toISOString().split("T")[0],
        },
        dailyReport,
        summary: {
          present: presentCount,
          absent: absentCount,
          totalRecorded,
          attendancePercentage: `${attendancePercentage}%`,
        },
      },
    });
  } catch (error) {
    console.error("Error generating weekly report:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};
