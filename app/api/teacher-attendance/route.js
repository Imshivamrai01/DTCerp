import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import TeacherAttendance from "@/models/teacherAttendence";
import User from "@/models/userModel";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();

    const teacher = await User.findOne({
      _id: body.teacher,
      $or: [{ role: "Teacher" }, { secondaryRole: "Teacher" }],
    });

    if (!teacher) {
      return NextResponse.json({ error: "Invalid teacher ID or user is not a teacher" }, { status: 400 });
    }

    const attendance = new TeacherAttendance({
      teacher: body.teacher,
      name: body.name || teacher.name,
      email: body.email || teacher.email,
      status: body.status,
      date: body.date || new Date(),
    });

    const savedAttendance = await attendance.save();
    return NextResponse.json(savedAttendance, { status: 201 });
  } catch (err) {
    console.error("CREATE TEACHER ATTENDANCE ERROR:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
