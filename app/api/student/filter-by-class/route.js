import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Student from "@/models/studentModel";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = 15;
    const skip = (page - 1) * limit;

    const studentClass = searchParams.get("studentClass");
    const studentSection = searchParams.get("studentSection");

    let query = { isDeleted: { $ne: true } };
    let sections = [];

    if (studentClass && studentClass !== "all") {
      query.studentClass = studentClass;
      sections = await Student.distinct("studentSection", { studentClass });
    } else {
      sections = await Student.distinct("studentSection");
    }

    if (studentSection && studentSection !== "all") {
      query.studentSection = studentSection;
    }

    const students = await Student.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 });

    const count = await Student.countDocuments(query);

    if (!students || students.length === 0) {
      return NextResponse.json({ message: "No Students Found!", success: false }, { status: 400 });
    }

    return NextResponse.json({
      data: students,
      count: count,
      sections: sections,
      success: true,
    }, { status: 200 });
  } catch (error) {
    console.error("FilterStudentsByClass API Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}
