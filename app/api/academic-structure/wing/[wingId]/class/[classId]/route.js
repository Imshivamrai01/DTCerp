import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import AcademicStructure from "@/models/academicStructureModel";

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { wingId, classId } = params;
    
    const wing = await AcademicStructure.findById(wingId);
    if (!wing) {
      return NextResponse.json({ success: false, message: "Wing not found" }, { status: 404 });
    }

    wing.classes = wing.classes.filter(c => c._id.toString() !== classId);
    await wing.save();

    return NextResponse.json({ success: true, data: wing, message: "Class removed successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error removing class:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
