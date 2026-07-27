import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import CoordinatorAssignment from "@/models/coordinatorAssignmentModel";

export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const id = params.id;
    const { actualSubmissionDate } = await req.json();

    if (!id) {
      return NextResponse.json({ message: "Assignment ID is required!", success: false }, { status: 400 });
    }
    if (!actualSubmissionDate) {
      return NextResponse.json({ message: "Actual submission date is required!", success: false }, { status: 400 });
    }

    const assignment = await CoordinatorAssignment.findByIdAndUpdate(id, { actualSubmissionDate }, { new: true });

    if (!assignment) {
      return NextResponse.json({ message: "Assignment not found!", success: false }, { status: 404 });
    }

    return NextResponse.json({ data: assignment, success: true, message: "Submission date updated successfully." }, { status: 200 });
  } catch (error) {
    console.error("UpdateSubmissionDate API Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}
