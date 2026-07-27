import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Fee from "@/models/feeModel";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const session = searchParams.get("session");

    if (!studentId || !session) {
      return NextResponse.json({ message: "Student Id and Session are required!", success: false }, { status: 400 });
    }

    const fee = await Fee.find({ studentId, session, isFeeDue: true });

    const transformFee = fee.map((item) => ({
      feeId: item._id,
      feeMonth: item.feeMonth,
      dueFee: item.dueFee,
    }));

    return NextResponse.json({ data: transformFee, success: true }, { status: 200 });
  } catch (error) {
    console.error("GetDueFees API Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}
