import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import CopyCheck from "@/models/copyCheckModel";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json({ message: "studentId is required", success: false }, { status: 400 });
    }
    
    const records = await CopyCheck.find({ studentId }).sort({ createdAt: -1 });

    return NextResponse.json({ data: records, success: true }, { status: 200 });
  } catch (error) {
    console.error("GetStudentCopyChecks API Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}
