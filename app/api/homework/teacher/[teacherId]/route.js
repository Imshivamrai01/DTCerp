import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Homework from "@/models/homeworkModel";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const teacherId = params.teacherId;

    if (!teacherId) {
      return NextResponse.json({ message: "Please provide teacher ID!", success: false }, { status: 400 });
    }

    const homework = await Homework.find({ teacherId }).sort({ createdAt: -1 });

    if (!homework || homework.length === 0) {
      return NextResponse.json({ message: "No homework assignments found for this teacher!", success: false }, { status: 404 });
    }

    return NextResponse.json({ data: homework, success: true }, { status: 200 });
  } catch (error) {
    console.error("GetHomeworkByTeacher API Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}
