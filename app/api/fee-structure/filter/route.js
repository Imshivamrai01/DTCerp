import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import FeeStructure from "@/models/feeStructureModel";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const className = searchParams.get("className");
    const category = searchParams.get("category");
    const route = searchParams.get("route");

    let query = {};
    if (className) query.class = className;
    if (category) query.category = category;
    if (route) query.route = route;

    const result = await FeeStructure.find(query);
    return NextResponse.json({ data: result, success: true }, { status: 200 });
  } catch (error) {
    console.error("FilterFeeStructure API Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}
