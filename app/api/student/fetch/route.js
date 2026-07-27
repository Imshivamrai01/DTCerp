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

    let query = {
      studentClass: studentClass,
      studentSection: studentSection,
      isDeleted: { $ne: true },
    };

    const students = await Student.find(query).sort({ name: 1 });
    const count = students.length;

    if (!students || students.length === 0) {
      return NextResponse.json({ message: "No Students Found!", success: false }, { status: 400 });
    }

    const transformedData = students.map((student) => {
      return {
        name: student.name,
        fatherName: student.fathersName,
        admissionNo: student.admissionNo,
        admissionDate: student.admissionDate,
        dob: student.dob,
        gender: student.gender,
      };
    });

    return NextResponse.json({ data: transformedData, count: count, success: true }, { status: 200 });
  } catch (error) {
    console.error("FetchStudentsData API Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}
