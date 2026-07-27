import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/userModel";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const parentId = searchParams.get("parentId");

    if (!parentId) {
      return NextResponse.json({ message: "Parent ID is required", success: false }, { status: 400 });
    }

    const parentUser = await User.findById(parentId).populate('linkedStudents');
    
    if (!parentUser || !parentUser.linkedStudents) {
      return NextResponse.json({ message: "Parent not found or no students linked", success: false }, { status: 404 });
    }

    return NextResponse.json({ data: parentUser.linkedStudents, success: true }, { status: 200 });
  } catch (error) {
    console.error("GetParentStudents API Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}
