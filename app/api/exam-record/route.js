import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import ExamRecord from "@/models/examRecordModel";
import Student from "@/models/studentModel";

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

export async function POST(req) {
  try {
    await dbConnect();
    const data = await req.json();

    if (!data.studentId) {
      return NextResponse.json({ message: "Please provide the student ID!", success: false }, { status: 404 });
    }

    const dataExists = await ExamRecord.findOne({
      studentId: data.studentId,
      subject: data.subject,
      examType: data.examType,
    });

    if (dataExists) {
      await ExamRecord.findByIdAndUpdate(dataExists._id, data, { new: true });
      return NextResponse.json({ success: true, message: "Updated" }, { status: 200 });
    }

    const examRecord = await ExamRecord.create(data);

    if (!examRecord) {
      return NextResponse.json({ message: "Error while creating exam record!", success: false }, { status: 400 });
    }

    return NextResponse.json({ data: examRecord, success: true }, { status: 201 });
  } catch (error) {
    console.error("CreateExamRecord API Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}
