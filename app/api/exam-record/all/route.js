import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import ExamRecord from "@/models/examRecordModel";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const examRecord = await ExamRecord.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("studentId");

    if (!examRecord || examRecord.length === 0) {
      return NextResponse.json({ message: "Exam Record data not found!", success: false }, { status: 404 });
    }

    const count = await ExamRecord.countDocuments();
    return NextResponse.json({ data: examRecord, count, success: true }, { status: 200 });
  } catch (error) {
    console.error("ListAllExamRecord API Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}
