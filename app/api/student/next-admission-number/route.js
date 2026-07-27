import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Student from "@/models/studentModel";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();

    const latestStudent = await Student.findOne({ admissionNo: { $exists: true, $ne: "" } })
      .sort({ createdAt: -1 });

    let nextAdno = "1001"; // Default starting number
    
    if (latestStudent && latestStudent.admissionNo) {
      const numericPart = parseInt(latestStudent.admissionNo.replace(/\D/g, ''), 10);
      if (!isNaN(numericPart)) {
        nextAdno = (numericPart + 1).toString();
      }
    }

    return NextResponse.json({ data: nextAdno, success: true }, { status: 200 });
  } catch (error) {
    console.error("NextAdmissionNumber API Error:", error);
    return NextResponse.json({ message: "Failed to generate admission number", success: false }, { status: 500 });
  }
}
