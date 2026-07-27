import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Homework from "@/models/homeworkModel";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const className = searchParams.get("className");
    const section = searchParams.get("section");
    const date = searchParams.get("date");

    if (!className || !section) {
      return NextResponse.json({ message: "Please provide class and section!", success: false }, { status: 400 });
    }

    const query = { className, section };

    if (date) {
      const start = new Date(date + "T00:00:00.000+05:30");
      const end = new Date(date + "T23:59:59.999+05:30");
      query.createdAt = { $gte: start, $lte: end };
    }

    const homework = await Homework.find(query).sort({ createdAt: -1 });

    if (!homework || homework.length === 0) {
      return NextResponse.json({ data: [], message: "No homework assignments found for this class on this date!", success: true }, { status: 200 });
    }

    return NextResponse.json({ data: homework, success: true }, { status: 200 });
  } catch (error) {
    console.error("GetHomeworkByClass API Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}
