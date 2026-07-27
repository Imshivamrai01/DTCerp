import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import AcademicStructure from "@/models/academicStructureModel";

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { wingId } = params;
    
    const deleted = await AcademicStructure.findByIdAndDelete(wingId);
    if (!deleted) {
      return NextResponse.json({ success: false, message: "Wing not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Wing deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting wing:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
