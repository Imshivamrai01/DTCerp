import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import AcademicStructure from "@/models/academicStructureModel";

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { wingId, classId } = params;
    const body = await req.json();
    const { sections } = body;

    if (!Array.isArray(sections)) {
      return NextResponse.json({ success: false, message: "Sections must be an array" }, { status: 400 });
    }

    const wing = await AcademicStructure.findById(wingId);
    if (!wing) {
      return NextResponse.json({ success: false, message: "Wing not found" }, { status: 404 });
    }

    const classItem = wing.classes.id(classId);
    if (!classItem) {
      return NextResponse.json({ success: false, message: "Class not found" }, { status: 404 });
    }

    classItem.sections = sections;
    await wing.save();

    return NextResponse.json({ success: true, data: wing, message: "Sections updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error updating sections:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
