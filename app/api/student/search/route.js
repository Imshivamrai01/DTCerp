import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Student from "@/models/studentModel";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ message: "Please enter a query", success: false }, { status: 400 });
    }

    const regexQuery = new RegExp(query, "i");

    const users = await Student.find({
      isDeleted: { $ne: true },
      isActive: { $ne: false },
      $or: [
        { name: { $regex: regexQuery } },
        { contactNumber: { $regex: regexQuery } },
        { rollNumber: { $regex: regexQuery } },
        { admissionNo: { $regex: regexQuery } },
        { fathersName: { $regex: regexQuery } },
        { mothersName: { $regex: regexQuery } },
        { fathersNo: { $regex: regexQuery } },
        { mothersNo: { $regex: regexQuery } },
        { dob: { $regex: regexQuery } },
      ],
    });

    if (!users || users.length === 0) {
      return NextResponse.json({ message: "No students found!", success: false }, { status: 404 });
    }

    return NextResponse.json({ data: users, success: true }, { status: 200 });
  } catch (error) {
    console.error("SearchStudents API Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}
