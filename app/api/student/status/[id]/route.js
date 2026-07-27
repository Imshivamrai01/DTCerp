import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Student from "@/models/studentModel";

export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const id = params.id;
    const body = await req.json();

    const { isActive } = body;

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { message: "Status must be a boolean value", success: false },
        { status: 400 }
      );
    }

    const student = await Student.findById(id);

    if (!student) {
      return NextResponse.json(
        { message: "Student not found", success: false },
        { status: 404 }
      );
    }

    student.isActive = isActive;
    await student.save();

    return NextResponse.json(
      { data: student, success: true, message: "Student status updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("UpdateStudentStatus API Error:", error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error", success: false },
      { status: 500 }
    );
  }
}
