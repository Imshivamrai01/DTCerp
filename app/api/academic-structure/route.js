import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import AcademicStructure from "@/models/academicStructureModel";

export async function GET() {
  try {
    await connectDB();
    const structures = await AcademicStructure.find({});
    return NextResponse.json({ success: true, data: structures }, { status: 200 });
  } catch (error) {
    console.error("Error fetching academic structure:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    console.log("POST /api/academic-structure called");
    await connectDB();
    console.log("DB connected");
    const body = await req.json();
    console.log("Body parsed:", body);
    const { wingName } = body;

    if (!wingName) {
      return NextResponse.json({ success: false, message: "Wing name is required" }, { status: 400 });
    }

    const existing = await AcademicStructure.findOne({ wingName });
    if (existing) {
      return NextResponse.json({ success: false, message: "Wing already exists" }, { status: 400 });
    }

    const newWing = await AcademicStructure.create({ wingName, classes: [] });
    return NextResponse.json({ success: true, data: newWing, message: "Wing created successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error creating wing:", error);
    require('fs').appendFileSync('error_log.txt', error.stack + '\n');
    return NextResponse.json({ success: false, message: error.message, stack: error.stack }, { status: 500 });
  }
}
