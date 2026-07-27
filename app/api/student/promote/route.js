import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Student from "@/models/studentModel";
import GraduatedStudent from "@/models/graduatedStudentModel";

const CLASS_PROMOTION_MAP = {
  Nursery: "L.K.G",
  "L.K.G": "U.K.G",
  "U.K.G": "1",
  "1": "2",
  "2": "3",
  "3": "4",
  "4": "5",
  "5": "6",
  "6": "7",
  "7": "8",
  "8": "9",
  "9": "10",
};

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { studentClass } = body;

    if (!studentClass) {
      return NextResponse.json({ success: false, message: "Please provide studentClass" }, { status: 400 });
    }

    const toClass = CLASS_PROMOTION_MAP[studentClass];

    if (!toClass && studentClass !== "10") {
      return NextResponse.json({ success: false, message: `No promotion path found for class "${studentClass}"` }, { status: 400 });
    }

    if (studentClass === "10") {
      const currentYear = new Date().getFullYear().toString();
      const students = await Student.find({ studentClass: "10", isDeleted: { $ne: true } }).lean();

      if (students.length === 0) {
        return NextResponse.json({ success: false, message: "No Class 10 students found" }, { status: 404 });
      }

      const graduatedDocs = students.map(({ _id, __v, createdAt, updatedAt, ...rest }) => ({
        ...rest,
        graduatedYear: currentYear,
      }));

      await GraduatedStudent.insertMany(graduatedDocs);
      await Student.deleteMany({ studentClass: "10", isDeleted: { $ne: true } });

      return NextResponse.json({
        success: true,
        message: `${students.length} Class 10 students moved to graduated collection.`,
        count: students.length,
      }, { status: 200 });
    }

    const result = await Student.updateMany(
      { studentClass, isDeleted: { $ne: true } },
      { $set: { studentClass: toClass } }
    );

    return NextResponse.json({
      success: true,
      message: `${result.modifiedCount} students promoted from Class ${studentClass} to Class ${toClass}.`,
      count: result.modifiedCount,
    }, { status: 200 });
  } catch (error) {
    console.error("PromoteClass API Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}
