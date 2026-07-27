import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import CoordinatorAssignment from "@/models/coordinatorAssignmentModel";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const coordinatorId = searchParams.get("coordinatorId");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = 25;
    const skip = (page - 1) * limit;

    let filter = {};
    if (coordinatorId) filter.coordinatorId = coordinatorId;

    const assignments = await CoordinatorAssignment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
    const totalCount = await CoordinatorAssignment.countDocuments(filter);

    return NextResponse.json({
      data: assignments,
      count: assignments.length,
      total: totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
      success: true,
    }, { status: 200 });
  } catch (error) {
    console.error("GetAllAssignments API Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}
