import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Student from "@/models/studentModel";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();

    const student = await Student.findOne({ isDeleted: { $ne: true } }).sort({
      _id: -1,
    });

    if (!student) {
      return NextResponse.json({ message: "No Student Found!", success: false }, { status: 404 });
    }

    return NextResponse.json({ data: student.admissionNo, success: true }, { status: 200 });
  } catch (error) {
    console.error("LastAdmissionNumber API Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}
