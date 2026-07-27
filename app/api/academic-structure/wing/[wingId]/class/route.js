import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import AcademicStructure from "@/models/academicStructureModel";

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { wingId } = params;
    const body = await req.json();
    const { className, sections } = body;

    if (!className) {
      return NextResponse.json({ success: false, message: "Class name is required" }, { status: 400 });
    }

    const wing = await AcademicStructure.findById(wingId);
    if (!wing) {
      return NextResponse.json({ success: false, message: "Wing not found" }, { status: 404 });
    }

    const classExists = wing.classes.find(c => c.className === className);
    if (classExists) {
      return NextResponse.json({ success: false, message: "Class already exists in this wing" }, { status: 400 });
    }

    wing.classes.push({ className, sections: sections || [] });
    await wing.save();

    return NextResponse.json({ success: true, data: wing, message: "Class added successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error adding class:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
