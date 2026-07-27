import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Attendance from "@/models/studentAttendenceModel";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const startDate = searchParams.get("startDate");

    if (!studentId || !startDate) {
      return NextResponse.json({ success: false, error: "Student ID and start date are required" }, { status: 400 });
    }

    const start = new Date(startDate);
    if (isNaN(start.getTime())) {
      return NextResponse.json({ success: false, error: "Invalid start date format" }, { status: 400 });
    }

    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    start.setHours(0, 0, 0, 0);

    const studentObjectId = mongoose.Types.ObjectId.isValid(studentId)
      ? new mongoose.Types.ObjectId(studentId)
      : studentId;

    const attendanceRecord = await Attendance.findOne({ student: studentObjectId });
    if (!attendanceRecord) {
      return NextResponse.json({ success: false, error: "Student attendance record not found" }, { status: 404 });
    }

    const attendanceRecords = await Attendance.find({
      student: studentObjectId,
      date: { $gte: start, $lte: end },
    }).sort({ date: 1 });

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dailyReport = [];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(currentDate.getDate() + i);
      dailyReport.push({
        date: currentDate.toISOString().split("T")[0],
        day: daysOfWeek[currentDate.getDay()],
        status: "No record",
        recorded: false,
      });
    }

    attendanceRecords.forEach((record) => {
      const recordDate = new Date(record.date);
      const dayIndex = Math.floor((recordDate - start) / (24 * 60 * 60 * 1000));
      if (dayIndex >= 0 && dayIndex < 7) {
        dailyReport[dayIndex].status = record.status;
        dailyReport[dayIndex].recorded = true;
      }
    });

    const presentCount = attendanceRecords.filter((r) => r.status === "Present").length;
    const absentCount = attendanceRecords.filter((r) => r.status === "Absent").length;
    const totalRecorded = presentCount + absentCount;
    const attendancePercentage = totalRecorded > 0 ? ((presentCount / totalRecorded) * 100).toFixed(2) : 0;

    return NextResponse.json({
      success: true,
      data: {
        student: {
          id: attendanceRecord.student,
          name: attendanceRecord.name,
          rollNumber: attendanceRecord.rollNumber,
          class: attendanceRecord.studentClass,
          section: attendanceRecord.studentSection,
        },
        reportPeriod: {
          from: start.toISOString().split("T")[0],
          to: end.toISOString().split("T")[0],
        },
        dailyReport,
        summary: { present: presentCount, absent: absentCount, totalRecorded, attendancePercentage: `${attendancePercentage}%` },
      },
    }, { status: 200 });
  } catch (error) {
    console.error("WeeklyReport API Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error", message: error.message }, { status: 500 });
  }
}
