const asyncHandler = require("express-async-handler");
const Student = require("../models/studentModel");
const User = require("../models/userModel");
const TeacherAttendance = require("../models/teacherAttendence");
const Attendance = require("../models/studentAttendenceModel");

const dataCount = asyncHandler(async (req, res) => {
  const role = req.query.role;

  if (!role) {
    return res.status(400).json({ message: "Provide the role field!", success: false });
  }

  const studentClass = req.query.studentClass;
  const studentDivision = req.query.studentDivision;

  let allStudents = 0;
  let allTeachers = 0;
  let allAdmins = 0;
  let allCoordinators = 0;
  let teacherAttendanceCount = 0;
  let studentAttendanceCount = 0;

  const normalizedRole = (role || "").trim().toLowerCase();
  const isAdminRole = ["admin", "super admin", "superadmin"].includes(normalizedRole) || normalizedRole.includes("admin");

  if (isAdminRole) {
    allStudents = await Student.countDocuments({ isDeleted: { $ne: true } });

    allTeachers = await User.countDocuments({
      $or: [
        { role: { $regex: "teacher", $options: "i" } },
        { secondaryRole: { $regex: "teacher", $options: "i" } }
      ]
    });

    allAdmins = await User.countDocuments({
      $or: [
        { role: { $regex: "admin", $options: "i" } },
        { secondaryRole: { $regex: "admin", $options: "i" } }
      ]
    });

    allCoordinators = await User.countDocuments({
      $or: [
        { role: { $regex: "coordinator", $options: "i" } },
        { secondaryRole: { $regex: "coordinator", $options: "i" } }
      ]
    });

    // Calculate today's attendance counts
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      teacherAttendanceCount = await TeacherAttendance.countDocuments({
        date: { $gte: startOfDay, $lte: endOfDay },
        status: "Present"
      });
    } catch (attErr) {
      console.error("Error fetching teacher attendance count:", attErr);
    }

    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      studentAttendanceCount = await Attendance.countDocuments({
        date: { $gte: startOfDay, $lte: endOfDay },
        status: "Present"
      });
    } catch (attErr) {
      console.error("Error fetching student attendance count:", attErr);
    }
  } else if (normalizedRole === "teacher") {
    const filter = { isDeleted: { $ne: true } };
    if (studentClass) filter.studentClass = studentClass;
    if (studentDivision) filter.studentDivision = studentDivision;
    allStudents = await Student.countDocuments(filter);
  }

  res.json({
    students: allStudents,
    teachers: allTeachers,
    admins: allAdmins,
    coordinators: allCoordinators,
    teacherAttendance: teacherAttendanceCount,
    studentAttendance: studentAttendanceCount,
    success: true,
  });
});

module.exports = { dataCount };
