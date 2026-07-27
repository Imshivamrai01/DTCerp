import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Attendance from "@/models/studentAttendenceModel";
import Student from "@/models/studentModel";

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { student, status, date } = body;

    if (!student || !status) {
      return NextResponse.json({ success: false, error: "Student ID and status are required fields" }, { status: 400 });
    }

    if (!["Present", "Absent"].includes(status)) {
      return NextResponse.json({ success: false, error: 'Status must be either "Present" or "Absent"' }, { status: 400 });
    }

    const studentDoc = await Student.findOne({
      _id: student,
      isDeleted: { $ne: true },
    }).lean();

    if (!studentDoc) {
      return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
    }

    const existingAttendance = await Attendance.findOne({
      student,
      date: date || new Date().toISOString().split("T")[0],
    });

    if (existingAttendance) {
      return NextResponse.json({ success: false, error: "Attendance already exists for this student on the selected date" }, { status: 400 });
    }

    const newAttendance = new Attendance({
      student: studentDoc._id,
      rollNumber: studentDoc.rollNumber,
      name: studentDoc.name,
      studentClass: studentDoc.studentClass || studentDoc.class,
      studentSection: studentDoc.studentSection || studentDoc.section,
      status,
      date: date || new Date(),
    });

    const savedAttendance = await newAttendance.save();

    return NextResponse.json({ success: true, message: "Attendance recorded successfully", data: savedAttendance }, { status: 201 });
  } catch (error) {
    console.error("Attendance creation error:", error);
    return NextResponse.json({ success: false, error: "Internal server error", message: error.message }, { status: 500 });
  }
}
