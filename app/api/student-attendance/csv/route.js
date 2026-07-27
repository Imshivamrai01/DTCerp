import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Attendance from "@/models/studentAttendenceModel";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    if (!month || !year) {
      return NextResponse.json({ error: "month and year are required" }, { status: 400 });
    }

    const numericMonth = parseInt(month) - 1;
    const startDate = new Date(year, numericMonth, 1);
    const endDate = new Date(year, numericMonth + 1, 0, 23, 59, 59, 999);

    const summary = await Attendance.aggregate([
      { $match: { date: { $gte: startDate, $lte: endDate } } },
      { $lookup: { from: "students", localField: "student", foreignField: "_id", as: "studentInfo" } },
      { $unwind: "$studentInfo" },
      {
        $group: {
          _id: {
            studentId: "$student",
            name: "$studentInfo.name",
            rollNumber: "$studentInfo.rollNumber",
            studentClass: "$studentInfo.studentClass",
            studentSection: "$studentInfo.studentSection",
          },
          statuses: { $push: "$status" },
        },
      },
      {
        $project: {
          studentId: "$_id.studentId",
          name: "$_id.name",
          rollNumber: "$_id.rollNumber",
          studentClass: "$_id.studentClass",
          studentSection: "$_id.studentSection",
          presentCount: { $size: { $filter: { input: "$statuses", as: "status", cond: { $eq: ["$$status", "Present"] } } } },
          absentCount: { $size: { $filter: { input: "$statuses", as: "status", cond: { $eq: ["$$status", "Absent"] } } } },
          totalDays: { $size: "$statuses" },
        },
      },
      { $sort: { name: 1 } },
    ]);

    let csv = "Name,Roll Number,Class,Section,Present,Absent,Total Days\n";
    summary.forEach((student) => {
      csv += `"${student.name}","${student.rollNumber}","${student.studentClass}","${student.studentSection}",${student.presentCount},${student.absentCount},${student.totalDays}\n`;
    });

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=student_attendance_summary_${month}_${year}.csv`,
      },
    });
  } catch (error) {
    console.error("ExportCSV API Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
