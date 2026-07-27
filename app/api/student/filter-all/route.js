import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Student from "@/models/studentModel";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);

    const studentClass = searchParams.get("studentClass");

    let query = { isDeleted: { $ne: true }, isActive: true };

    if (studentClass && studentClass !== "all") {
      query.studentClass = studentClass;
    }

    const students = await Student.find(query).sort({ name: 1 });
    const count = students.length;

    if (!students || students.length === 0) {
      return NextResponse.json({ message: "No Students Found!", success: false }, { status: 400 });
    }

    return NextResponse.json({
      data: students,
      count: count,
      success: true,
    }, { status: 200 });
  } catch (error) {
    console.error("FilterAllStudent API Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}
