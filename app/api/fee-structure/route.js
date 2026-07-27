import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import FeeStructure from "@/models/feeStructureModel";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await dbConnect();
    const result = await FeeStructure.find();
    return NextResponse.json({ data: result, success: true, message: "Fee Structure fetched successfully" }, { status: 200 });
  } catch (error) {
    console.error("GetAllFeeStructure API Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const data = await req.json();
    const result = await FeeStructure.create(data);

    if (!result) {
      return NextResponse.json({ message: "Something went wrong" }, { status: 400 });
    }

    return NextResponse.json({ data: result, success: true, message: "Fee Structure created successfully" }, { status: 201 });
  } catch (error) {
    console.error("CreateFeeStructure API Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}
