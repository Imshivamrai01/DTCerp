import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import GraduatedStudent from "@/models/graduatedStudentModel";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const year = searchParams.get("year");

    const query = year ? { graduatedYear: year } : {};
    const students = await GraduatedStudent.find(query).sort({ name: 1 });

    return NextResponse.json({ data: students, count: students.length, success: true }, { status: 200 });
  } catch (error) {
    console.error("ListGraduatedStudents API Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}
