import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Attendance from "@/models/studentAttendenceModel";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    if (!studentId || !month || !year) {
      return NextResponse.json({ message: "studentId, month, and year are required", success: false }, { status: 400 });
    }

    const numericMonth = parseInt(month) - 1;
    const startDate = new Date(year, numericMonth, 1);
    const endDate = new Date(year, numericMonth + 1, 0, 23, 59, 59, 999);
    
    const records = await Attendance.find({
      student: studentId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });

    return NextResponse.json({ data: records, success: true }, { status: 200 });
  } catch (error) {
    console.error("GetStudentAttendance API Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}
