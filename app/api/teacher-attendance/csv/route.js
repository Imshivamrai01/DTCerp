import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import TeacherAttendance from "@/models/teacherAttendence";

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

    const summary = await TeacherAttendance.aggregate([
      { $match: { date: { $gte: startDate, $lte: endDate } } },
      { $lookup: { from: "users", localField: "teacher", foreignField: "_id", as: "teacherInfo" } },
      { $unwind: "$teacherInfo" },
      {
        $group: {
          _id: { teacherId: "$teacher", name: "$teacherInfo.name", email: "$teacherInfo.email" },
          statuses: { $push: "$status" },
        },
      },
      {
        $project: {
          teacherId: "$_id.teacherId",
          name: "$_id.name",
          email: "$_id.email",
          presentCount: { $size: { $filter: { input: "$statuses", as: "status", cond: { $eq: ["$$status", "Present"] } } } },
          absentCount: { $size: { $filter: { input: "$statuses", as: "status", cond: { $eq: ["$$status", "Absent"] } } } },
          leaveCount: { $size: { $filter: { input: "$statuses", as: "status", cond: { $eq: ["$$status", "Leave"] } } } },
          totalDays: { $size: "$statuses" },
        },
      },
      { $sort: { name: 1 } },
    ]);

    let csv = "Name,Email,Present Days,Absent Days,Leave Days,Total Days\n";
    summary.forEach((teacher) => {
      csv += `"${teacher.name}","${teacher.email}",${teacher.presentCount},${teacher.absentCount},${teacher.leaveCount},${teacher.totalDays}\n`;
    });

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=attendance_summary_${month}_${year}.csv`,
      },
    });
  } catch (error) {
    console.error("ExportTeacherCSV API Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
