import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Attendance from "@/models/studentAttendenceModel";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const filter = {};

    const date = searchParams.get("date");
    const studentClass = searchParams.get("class");

    if (date) {
      const startOfDay = new Date(date + "T00:00:00.000+05:30");
      const endOfDay = new Date(date + "T23:59:59.999+05:30");
      filter.date = { $gte: startOfDay, $lte: endOfDay };
    }

    if (studentClass && studentClass !== "all") {
      filter.studentClass = studentClass;
    }

    const records = await Attendance.find(filter).sort({ name: 1 });

    if (!records || records.length === 0) {
      return NextResponse.json({ message: "No attendance records found", data: [], total: 0 }, { status: 200 });
    }

    return NextResponse.json({ message: "Attendance fetched successfully", data: records, total: records.length }, { status: 200 });
  } catch (error) {
    console.error("GetAllAttendance API Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
