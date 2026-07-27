import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/userModel";
import Student from "@/models/studentModel";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const studentClass = searchParams.get("studentClass");
    const studentSection = searchParams.get("studentSection");

    if (!studentClass || !studentSection) {
      return NextResponse.json({ message: "Class and Section are required", success: false }, { status: 400 });
    }

    let classMatch = studentClass;
    if (!studentClass.startsWith("Class ") && !studentClass.includes("K.G")) {
      classMatch = { $in: [studentClass, `Class ${studentClass}`] };
    } else {
      classMatch = { $in: [studentClass, studentClass.replace("Class ", "")] };
    }

    const students = await Student.find({ 
      studentClass: classMatch, 
      studentSection, 
      isDeleted: { $ne: true } 
    }).lean();

    if (!students || students.length === 0) {
      return NextResponse.json({ data: [], success: true }, { status: 200 });
    }

    const parentUsers = await User.find({ role: "Parent", linkedStudents: { $exists: true, $not: { $size: 0 } } }).lean();

    const assignedStudentIds = new Set();
    parentUsers.forEach(parent => {
      if (parent.linkedStudents) {
        parent.linkedStudents.forEach(id => assignedStudentIds.add(id.toString()));
      }
    });

    const result = students.map(student => ({
      ...student,
      hasParent: assignedStudentIds.has(student._id.toString())
    }));

    return NextResponse.json({ data: result, success: true }, { status: 200 });
  } catch (error) {
    console.error("GetStudentsForParentRegistration API Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}
