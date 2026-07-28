import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Student from "@/models/studentModel";

export const dynamic = "force-dynamic";

function buildClassQuery(rawClass) {
  if (!rawClass || rawClass.trim().toLowerCase() === "all") return null;

  const str = rawClass.trim();
  const noDots = str.replace(/\./g, "");

  const ROMAN_MAP = {
    "1": "I", "2": "II", "3": "III", "4": "IV", "5": "V",
    "6": "VI", "7": "VII", "8": "VIII", "9": "IX", "10": "X",
    "11": "XI", "12": "XII",
    "I": "1", "II": "2", "III": "3", "IV": "4", "V": "5",
    "VI": "6", "VII": "7", "VIII": "8", "IX": "9", "X": "10",
    "XI": "11", "XII": "12"
  };

  const cleanStr = str.replace(/^Class\s*/i, "").trim();
  const equivalent = ROMAN_MAP[cleanStr] || ROMAN_MAP[str];

  const OrList = [];

  const safeStr = str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  OrList.push({ studentClass: { $regex: `^${safeStr}$`, $options: "i" } });
  OrList.push({ studentClass: { $regex: `^Class\\s*${safeStr}$`, $options: "i" } });

  const safeClean = cleanStr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  OrList.push({ studentClass: { $regex: `^${safeClean}$`, $options: "i" } });
  OrList.push({ studentClass: { $regex: `^Class\\s*${safeClean}$`, $options: "i" } });

  let pattern = "";
  for (const char of noDots) {
    if (/[a-zA-Z]/.test(char)) {
      pattern += char + "\\.?\\s*";
    } else {
      pattern += char;
    }
  }
  OrList.push({ studentClass: { $regex: `^${pattern}$`, $options: "i" } });

  if (equivalent) {
    const safeEq = equivalent.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    OrList.push({ studentClass: { $regex: `^${safeEq}$`, $options: "i" } });
    OrList.push({ studentClass: { $regex: `^Class\\s*${safeEq}$`, $options: "i" } });
  }

  return OrList;
}

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = 15;
    const skip = (page - 1) * limit;

    const rawClass = (searchParams.get("studentClass") || "all").trim();
    const rawSection = (searchParams.get("studentSection") || "all").trim();

    const isClassAll = !rawClass || rawClass.toLowerCase() === "all";
    const isSectionAll = !rawSection || rawSection.toLowerCase() === "all";

    const andConditions = [{ isDeleted: { $ne: true } }];

    if (!isClassAll) {
      const classOr = buildClassQuery(rawClass);
      if (classOr) {
        andConditions.push({ $or: classOr });
      }
    }

    if (!isSectionAll) {
      const safeSection = rawSection.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      andConditions.push({ studentSection: { $regex: `^${safeSection}$`, $options: "i" } });
    }

    const query = andConditions.length === 1 ? andConditions[0] : { $and: andConditions };

    const students = await Student.find(query)
      .collation({ locale: "en", numericOrdering: true })
      .sort({ rollNumber: 1, admissionNo: 1, name: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const count = await Student.countDocuments(query);
    const sections = await Student.distinct("studentSection", { isDeleted: { $ne: true } });

    return NextResponse.json({
      data: students || [],
      count: count || 0,
      sections: sections || [],
      success: true
    }, { status: 200 });

  } catch (error) {
    console.error("FilterStudentsByClass API Error:", error);
    return NextResponse.json({
      data: [],
      count: 0,
      sections: [],
      message: error.message || "Internal Server Error",
      success: false
    }, { status: 500 });
  }
}
