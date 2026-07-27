import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Fee from "@/models/feeModel";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const session = searchParams.get("session");
    const studentId = searchParams.get("studentId");
    const feeMonth = searchParams.get("feeMonth");

    const fee = await Fee.findOne({ session, studentId, feeMonth });

    if (fee) {
      return NextResponse.json({ data: fee, success: true }, { status: 200 });
    } else {
      return NextResponse.json({ message: "Fee not found!", success: false }, { status: 400 });
    }
  } catch (error) {
    console.error("GetQuarterlyFee API Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const data = await req.json();

    if (!data.studentId) {
      return NextResponse.json({ message: "Student Id is required", success: false }, { status: 400 });
    }

    const checkFeeExists = await Fee.findOne({
      studentId: data.studentId,
      session: data.session,
      feeMonth: data.feeMonth,
    });

    if (checkFeeExists) {
      return NextResponse.json({ message: "Fee already exists", success: false }, { status: 400 });
    }

    const fee = await Fee.create(data);

    if (fee) {
      return NextResponse.json({ data: fee, message: "Fee added successfully", success: true }, { status: 201 });
    } else {
      return NextResponse.json({ message: "Error while adding fee!", success: false }, { status: 400 });
    }
  } catch (error) {
    console.error("AddFee API Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}
