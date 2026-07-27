import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/userModel";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();
    const teachers = await User.find({
      $or: [
        { role: "Teacher" },
        { role: "Senior Coordinator" },
        { role: "Junior Coordinator" },
        { secondaryRole: "Teacher" },
        { secondaryRole: "Senior Coordinator" },
        { secondaryRole: "Junior Coordinator" },
      ],
    }).sort({ name: 1 });

    if (!teachers || teachers.length === 0) {
      return NextResponse.json({ message: "No Teachers Found!", success: false }, { status: 404 });
    }

    return NextResponse.json({ data: teachers, success: true }, { status: 200 });
  } catch (error) {
    console.error("GetAllTeachers API Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}
