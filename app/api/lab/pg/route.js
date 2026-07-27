import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Lab from "@/models/labModel";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = 15;
    const skip = (page - 1) * limit;

    const labs = await Lab.find().skip(skip).limit(limit).sort({ createdAt: -1 });
    const total = await Lab.countDocuments();

    return NextResponse.json({
      data: labs,
      pagination: { total, page, pages: Math.ceil(total / limit) },
      success: true,
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
