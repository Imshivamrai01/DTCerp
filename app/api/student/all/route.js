import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Student from "@/models/studentModel";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const students = await Student.find({ isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-password");

    if (!students || students.length === 0) {
      return NextResponse.json({ message: "Students not found!", success: false }, { status: 404 });
    }

    const count = await Student.countDocuments({ isDeleted: { $ne: true } });

    return NextResponse.json({ data: students, count, success: true }, { status: 200 });
  } catch (error) {
    console.error("ListAllStudents API Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}
