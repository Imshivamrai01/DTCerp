import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import FeeStructure from "@/models/feeStructureModel";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const result = await FeeStructure.findById(params.id);
    if (!result) return NextResponse.json({ message: "Something went wrong" }, { status: 400 });
    return NextResponse.json({ data: result, success: true, message: "Fee Structure fetched successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const data = await req.json();
    const result = await FeeStructure.findByIdAndUpdate(params.id, data, { new: true });
    if (!result) return NextResponse.json({ message: "Something went wrong" }, { status: 400 });
    return NextResponse.json({ data: result, success: true, message: "Fee Structure updated successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const result = await FeeStructure.findByIdAndDelete(params.id);
    if (!result) return NextResponse.json({ message: "Something went wrong" }, { status: 400 });
    return NextResponse.json({ data: result, success: true, message: "Fee Structure deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}
