import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import TeacherAttendance from "@/models/teacherAttendence";

export async function PUT(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { teacher: teacherId, date, status } = body;

    if (!teacherId || !date || !status) {
      return NextResponse.json({ error: "Teacher, date, and status are required." }, { status: 400 });
    }

    const startOfDay = new Date(date + "T00:00:00.000+05:30");
    const endOfDay = new Date(date + "T23:59:59.999+05:30");

    const attendance = await TeacherAttendance.findOneAndUpdate(
      { teacher: teacherId, date: { $gte: startOfDay, $lte: endOfDay } },
      { status },
      { new: true }
    );

    if (!attendance) {
      return NextResponse.json({ error: "Attendance record not found for the given date" }, { status: 404 });
    }

    return NextResponse.json({ message: "Attendance status updated", data: attendance }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
