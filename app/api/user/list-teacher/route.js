import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/userModel";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const className = searchParams.get("className");
    const subject = searchParams.get("subject");
    const section = searchParams.get("section");

    const teachers = await User.aggregate([
      {
        $match: {
          $or: [{ role: "Teacher" }, { secondaryRole: "Teacher" }],
        },
      },
      { $unwind: "$assignedClasses" },
      { $unwind: "$assignedSubjects" },
      { $unwind: "$assignedSections" },
      {
        $match: {
          "assignedClasses.value": className,
          "assignedSubjects.value": subject,
          "assignedSections.value": section,
        },
      },
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          role: { $first: "$role" },
          secondaryRole: { $first: "$secondaryRole" },
        },
      },
    ]);

    if (!teachers || teachers.length === 0) {
      return NextResponse.json({ message: "No teachers found!", success: false }, { status: 404 });
    }

    return NextResponse.json({ data: teachers, success: true }, { status: 200 });
  } catch (error) {
    console.error("GetTeachersByClassSubjectSection API Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}
