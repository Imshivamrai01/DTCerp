import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Homework from "@/models/homeworkModel";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const id = params.id;

    const homework = await Homework.findById(id);

    if (!homework) {
      return NextResponse.json({ success: false, message: "Homework not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: homework }, { status: 200 });
  } catch (error) {
    console.error("GetHomeworkById API Error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
