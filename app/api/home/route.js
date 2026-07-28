import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Student from "@/models/studentModel";
import User from "@/models/userModel";
import TeacherAttendance from "@/models/teacherAttendence";
import Attendance from "@/models/studentAttendenceModel";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const studentClass = searchParams.get("studentClass");
    const studentDivision = searchParams.get("studentDivision");

    if (!role) {
      return NextResponse.json({ message: "Provide the role field!", success: false }, { status: 400 });
    }

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

      // Attendance for today
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

    return NextResponse.json({
      students: allStudents,
      teachers: allTeachers,
      admins: allAdmins,
      coordinators: allCoordinators,
      teacherAttendance: teacherAttendanceCount,
      studentAttendance: studentAttendanceCount,
      testKey: "123",
      success: true
    });
  } catch (error) {
    console.error("DataCount API Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}
