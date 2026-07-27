import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Fee from "@/models/feeModel";

export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const id = params.id;
    const data = await req.json();

    const checkFeeExists = await Fee.findById(id);
    if (!checkFeeExists) {
      return NextResponse.json({ message: "Fee not found!", success: false }, { status: 400 });
    }

    const fee = await Fee.findByIdAndUpdate(id, data, { new: true });

    if (fee) {
      return NextResponse.json({ data: fee, message: "Fee updated successfully", success: true }, { status: 201 });
    } else {
      return NextResponse.json({ message: "Error while updating fee!", success: false }, { status: 400 });
    }
  } catch (error) {
    console.error("EditFee API Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}
