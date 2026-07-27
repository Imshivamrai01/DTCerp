import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import TeacherAttendance from "@/models/teacherAttendence";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = 25;
    const skip = (page - 1) * limit;
    const filter = {};

    const date = searchParams.get("date");
    if (date) {
      const startOfDay = new Date(date + "T00:00:00.000+05:30");
      const endOfDay = new Date(date + "T23:59:59.999+05:30");
      filter.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const attendances = await TeacherAttendance.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 });

    if (!attendances || attendances.length === 0) {
      return NextResponse.json({ message: "No attendance records found", data: [], total: 0, page, totalPages: 1, limit }, { status: 200 });
    }

    const totalCount = await TeacherAttendance.countDocuments(filter);

    return NextResponse.json({
      message: "Attendance records fetched successfully",
      data: attendances,
      total: totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
      limit,
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching teacher attendance:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
