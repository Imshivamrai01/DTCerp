import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import CopyCheck from "@/models/copyCheckModel";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const dateData = searchParams.get("date");

    if (!dateData) {
      return NextResponse.json({ message: "Please provide the date!", success: false }, { status: 400 });
    }

    const copyCheck = await CopyCheck.find({ date: dateData });
    const count = copyCheck.length;

    return NextResponse.json({ data: copyCheck, count, success: true }, { status: 200 });
  } catch (error) {
    console.error("ListAllCopyCheck API Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}
