import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Student from "@/models/studentModel";
import User from "@/models/userModel";

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

    if (role === "Admin") {
      allStudents = await Student.countDocuments({ isDeleted: { $ne: true } });
      allTeachers = await User.countDocuments({ $or: [{ role: "Teacher" }, { secondaryRole: "Teacher" }] });
      allAdmins = await User.countDocuments({ $or: [{ role: "Admin" }, { secondaryRole: "Admin" }] });
      allCoordinators = await User.countDocuments({
        $or: [
          { role: { $in: ["Senior Coordinator", "Junior Coordinator"] } },
          { secondaryRole: { $in: ["Senior Coordinator", "Junior Coordinator"] } },
        ],
      });
    } else if (role === "Teacher") {
      allStudents = await Student.countDocuments({ studentClass, studentDivision });
    }

    if (allStudents === 0) {
      return NextResponse.json({ message: "No Student Found!", success: false });
    }

    return NextResponse.json({ students: allStudents, teachers: allTeachers, admins: allAdmins, coordinators: allCoordinators, success: true });
  } catch (error) {
    console.error("DataCount API Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}
