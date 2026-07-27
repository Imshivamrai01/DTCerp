import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Attendance from "@/models/studentAttendenceModel";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const studentClass = searchParams.get("class");
    const studentSection = searchParams.get("section");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    if (!month || !year) {
      return NextResponse.json({ error: "month and year are required" }, { status: 400 });
    }

    const numericMonth = parseInt(month) - 1;
    const startDate = new Date(year, numericMonth, 1);
    const endDate = new Date(year, numericMonth + 1, 0, 23, 59, 59, 999);

    const studentMatch = { isDeleted: { $ne: true } };
    if (studentClass) studentMatch.studentClass = studentClass;
    if (studentSection) studentMatch.studentSection = studentSection;

    const summary = await Attendance.aggregate([
      { $match: { date: { $gte: startDate, $lte: endDate } } },
      {
        $lookup: {
          from: "students",
          localField: "student",
          foreignField: "_id",
          as: "studentInfo",
          pipeline: [{ $match: studentMatch }],
        },
      },
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
          presentCount: {
            $size: {
              $filter: { input: "$statuses", as: "status", cond: { $eq: ["$$status", "Present"] } },
            },
          },
          absentCount: {
            $size: {
              $filter: { input: "$statuses", as: "status", cond: { $eq: ["$$status", "Absent"] } },
            },
          },
          totalDays: { $size: "$statuses" },
        },
      },
      { $sort: { name: 1 } },
    ]);

    return NextResponse.json({
      success: true,
      month,
      year,
      class: studentClass || "All",
      section: studentSection || "All",
      data: summary,
    }, { status: 200 });
  } catch (error) {
    console.error("GetMonthlySummary API Error:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
