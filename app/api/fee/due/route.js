import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Fee from "@/models/feeModel";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await dbConnect();
    const fee = await Fee.find({ isFeeDue: true })
      .populate([{
        path: "studentId",
        select: "name fathersName rollNumber contactNumber fathersNo studentClass studentSection",
      }])
      .select("-session -feeMonth -admissionFee -tutionFee -othersFee -boardFee -discount -isFeeDue -feeDue -gst -createdAt -updatedAt");

    return NextResponse.json({ data: fee, success: true }, { status: 200 });
  } catch (error) {
    console.error("GetDueFee API Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}
