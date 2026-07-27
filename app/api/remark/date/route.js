import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Remark from "@/models/remarkModel";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const remarkDate = searchParams.get("remarkDate");

    const remark = await Remark.find({ remarkDate });

    if (!remark || remark.length === 0) {
      return NextResponse.json({ message: "No Remark Found!", success: false }, { status: 404 });
    }

    return NextResponse.json({ data: remark, success: true }, { status: 200 });
  } catch (error) {
    console.error("GetRemarksByDate API Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}
