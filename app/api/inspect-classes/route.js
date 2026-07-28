import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Student from "@/models/studentModel";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();
    const distinctClasses = await Student.distinct("studentClass", { isDeleted: { $ne: true } });

    const counts = {};
    for (const cls of distinctClasses) {
      const c = await Student.countDocuments({ studentClass: cls, isDeleted: { $ne: true } });
      counts[cls] = c;
    }

    return NextResponse.json({
      distinctClasses,
      counts
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
