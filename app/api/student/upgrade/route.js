import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Student from "@/models/studentModel";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const fromClass = searchParams.get("fromClass");
    const toClass = searchParams.get("toClass");

    if (!fromClass || !toClass) {
      return NextResponse.json({ message: "Missing fromClass or toClass", success: false }, { status: 400 });
    }

    const students = await Student.aggregate([
      {
        $match: {
          studentClass: fromClass,
          isDeleted: { $ne: true },
        },
      },
      {
        $set: {
          studentClass: toClass,
        },
      },
    ]);

    const studentIds = students.map((student) => student._id);

    const result = await Student.updateMany(
      {
        _id: { $in: studentIds },
        isDeleted: { $ne: true },
      },
      { $set: { studentClass: toClass } }
    );

    if (result && result.acknowledged) {
      return NextResponse.json({ data: students, result: result, success: true }, { status: 200 });
    } else {
      return NextResponse.json({ message: "Failed to upgrade student class", success: false }, { status: 500 });
    }
  } catch (error) {
    console.error("UpgradeStudentClass API Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}
