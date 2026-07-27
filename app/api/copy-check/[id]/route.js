import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import CopyCheck from "@/models/copyCheckModel";
import Student from "@/models/studentModel";

export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const id = params.id;

    if (!id) {
      return NextResponse.json({ message: "Please provide the CopyCheck id.", success: false }, { status: 404 });
    }

    const copyCheckExists = await CopyCheck.findById(id);
    if (!copyCheckExists) {
      return NextResponse.json({ message: "CopyCheck not exists!", success: false }, { status: 404 });
    }

    const data = await req.json();

    if (!data.studentId) {
      return NextResponse.json({ message: "Please provide the student ID", success: false }, { status: 400 });
    }

    const studentExists = await Student.findById(data.studentId);
    if (!studentExists) {
      return NextResponse.json({ message: "Student not found!", success: false }, { status: 404 });
    }

    const copyCheck = await CopyCheck.findByIdAndUpdate(id, data, { new: true });

    if (!copyCheck) {
      return NextResponse.json({ message: "Error while updating copy check!", success: false }, { status: 400 });
    }

    return NextResponse.json({ data: copyCheck, success: true }, { status: 200 });
  } catch (error) {
    console.error("UpdateCopyCheck API Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}
