import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Fee from "@/models/feeModel";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const session = searchParams.get("session");

    const fee = await Fee.find({ session, isFeeDue: true });

    return NextResponse.json({ data: fee, success: true }, { status: 200 });
  } catch (error) {
    console.error("GetPendingFee API Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}
