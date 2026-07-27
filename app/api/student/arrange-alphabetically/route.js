import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Student from "@/models/studentModel";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);

    const studentClass = searchParams.get("studentClass");
    const studentSection = searchParams.get("studentSection");

    if (!studentClass || !studentSection) {
      return NextResponse.json({
        message: "Please provide studentClass and studentSection!",
        success: false,
      }, { status: 400 });
    }

    let students = await Student.find({
      studentClass,
      studentSection,
    });

    if (!students || students.length === 0) {
      return NextResponse.json({
        message: "No students found for this class and section!",
        success: false,
      }, { status: 404 });
    }

    const activeStudents = students.filter((student) => !student.isDeleted);

    activeStudents.sort((a, b) =>
      a.name.trim().toLowerCase().localeCompare(b.name.trim().toLowerCase())
    );

    for (let i = 0; i < activeStudents.length; i++) {
      activeStudents[i].rollNumber = (i + 1).toString();
      await activeStudents[i].save();
    }

    return NextResponse.json({
      message: "Active students arranged alphabetically and roll numbers assigned successfully!",
      data: activeStudents,
      success: true,
    }, { status: 200 });
  } catch (error) {
    console.error("ArrangeStudentsAlphabetically API Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}
