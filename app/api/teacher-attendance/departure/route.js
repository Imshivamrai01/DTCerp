import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import TeacherAttendance from "@/models/teacherAttendence";

export async function PUT(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { teacherId, date } = body;

    if (!teacherId || !date) {
      return NextResponse.json({ error: "Teacher ID and date are required." }, { status: 400 });
    }

    const startOfDay = new Date(date + "T00:00:00.000+05:30");
    const endOfDay = new Date(date + "T23:59:59.999+05:30");

    const attendance = await TeacherAttendance.findOneAndUpdate(
      { teacher: teacherId, date: { $gte: startOfDay, $lte: endOfDay } },
      { departureTime: new Date() },
      { new: true }
    );

    if (!attendance) {
      return NextResponse.json({ error: "Attendance record not found for the given date" }, { status: 404 });
    }

    return NextResponse.json({ message: "Departure time recorded", data: attendance }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
