import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Attendance from "@/models/studentAttendenceModel";

export async function PUT(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { student, status, date } = body;

    if (!student || !date || !status) {
      return NextResponse.json({ success: false, error: "Student ID, date, and status are all required fields" }, { status: 400 });
    }

    if (!["Present", "Absent"].includes(status)) {
      return NextResponse.json({ success: false, error: 'Status must be either "Present" or "Absent"' }, { status: 400 });
    }

    const attendanceDate = new Date(date);
    if (isNaN(attendanceDate.getTime())) {
      return NextResponse.json({ success: false, error: "Invalid date format" }, { status: 400 });
    }

    const startOfDay = new Date(attendanceDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(attendanceDate);
    endOfDay.setHours(23, 59, 59, 999);

    const updatedAttendance = await Attendance.findOneAndUpdate(
      {
        student,
        date: { $gte: startOfDay, $lte: endOfDay },
      },
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedAttendance) {
      return NextResponse.json({ success: false, error: "No attendance record found for this student on the specified date" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Attendance updated successfully", data: updatedAttendance }, { status: 200 });
  } catch (error) {
    console.error("Update attendance error:", error);
    return NextResponse.json({ success: false, error: "Internal server error", message: error.message }, { status: 500 });
  }
}
