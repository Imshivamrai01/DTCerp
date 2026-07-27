import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import CoordinatorAssignment from "@/models/coordinatorAssignmentModel";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    if (!teacherId) {
      return NextResponse.json({ message: "Teacher ID is required!", success: false }, { status: 400 });
    }

    const assignments = await CoordinatorAssignment.find({ teacherId }).sort({ createdAt: -1 }).skip(skip).limit(limit);
    const totalCount = await CoordinatorAssignment.countDocuments({ teacherId });
    const pendingCount = await CoordinatorAssignment.countDocuments({ teacherId, actualSubmissionDate: { $in: [null, ""] } });

    return NextResponse.json({
      data: assignments,
      count: assignments.length,
      total: totalCount,
      pendingCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
      success: true,
    }, { status: 200 });
  } catch (error) {
    console.error("GetAssignmentsByTeacher API Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}
