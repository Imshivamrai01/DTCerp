import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import CoordinatorAssignment from "@/models/coordinatorAssignmentModel";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const assignments = Array.isArray(body) ? body : [body];
    const createdAssignments = [];

    for (const assignmentData of assignments) {
      const { teacherName, teacherId, class: className, section, subject, assignedWorkType, projectedDate, coordinatorName, coordinatorId } = assignmentData;

      if (!teacherName || !teacherId || !className || !section || !assignedWorkType?.length || !projectedDate || !coordinatorName || !coordinatorId) {
        return NextResponse.json({ message: "All fields are required for each assignment!", success: false }, { status: 400 });
      }

      const assignment = await CoordinatorAssignment.create({
        teacherName, teacherId, class: className, section, subject, assignedWorkType, projectedDate, coordinatorName, coordinatorId,
      });
      createdAssignments.push(assignment);
    }

    return NextResponse.json({ data: createdAssignments, success: true, message: `${createdAssignments.length} assignment(s) created successfully.` }, { status: 201 });
  } catch (error) {
    console.error("CreateAssignment API Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}
