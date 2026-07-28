import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Student from "@/models/studentModel";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);

    const rawClass = (searchParams.get("studentClass") || "all").trim();
    const rawSection = (searchParams.get("studentSection") || "all").trim();

    const isClassAll = !rawClass || rawClass.toLowerCase() === "all";
    const isSectionAll = !rawSection || rawSection.toLowerCase() === "all";

    let query = { isDeleted: { $ne: true } };

    if (!isClassAll) {
      const safeClass = rawClass.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.studentClass = { $regex: `^${safeClass}$`, $options: "i" };
    }

    if (!isSectionAll) {
      const safeSection = rawSection.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.studentSection = { $regex: `^${safeSection}$`, $options: "i" };
    }

    const students = await Student.find(query)
      .collation({ locale: "en", numericOrdering: true })
      .sort({ rollNumber: 1, admissionNo: 1, name: 1 })
      .lean();

    return NextResponse.json({
      data: students || [],
      count: (students || []).length,
      success: true
    }, { status: 200 });

  } catch (error) {
    console.error("FilterAllStudent API Error:", error);
    return NextResponse.json({
      data: [],
      count: 0,
      message: error.message || "Internal Server Error",
      success: false
    }, { status: 500 });
  }
}
