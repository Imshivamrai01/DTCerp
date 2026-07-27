import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import ExamRecord from "@/models/examRecordModel";
import Student from "@/models/studentModel";

export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const id = params.id;

    if (!id) {
      return NextResponse.json({ message: "Please provide the ExamRecord id.", success: false }, { status: 404 });
    }

    const examRecordExists = await ExamRecord.findById(id);
    if (!examRecordExists) {
      return NextResponse.json({ message: "ExamRecord not exists!", success: false }, { status: 404 });
    }

    const data = await req.json();

    if (!data.studentId) {
      return NextResponse.json({ message: "Please provide the student ID", success: false }, { status: 400 });
    }

    const studentExists = await Student.findById(data.studentId);
    if (!studentExists) {
      return NextResponse.json({ message: "Student not found!", success: false }, { status: 404 });
    }

    const examRecord = await ExamRecord.findByIdAndUpdate(id, data, { new: true });

    if (!examRecord) {
      return NextResponse.json({ message: "Error while updating exam record!", success: false }, { status: 400 });
    }

    return NextResponse.json({ data: examRecord, success: true }, { status: 200 });
  } catch (error) {
    console.error("UpdateExamRecord API Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}
