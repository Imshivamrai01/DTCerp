import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import zlib from "zlib";
import dbConnect from "@/lib/dbConnect";
import Student from "@/models/studentModel";

export const dynamic = "force-dynamic";

function parseZip(buffer) {
  const files = {};
  let offset = 0;

  while (offset < buffer.length - 30) {
    if (buffer.readUInt32LE(offset) !== 0x04034b50) {
      offset++;
      continue;
    }

    const compression = buffer.readUInt16LE(offset + 8);
    const compressedSize = buffer.readUInt32LE(offset + 18);
    const fileNameLen = buffer.readUInt16LE(offset + 26);
    const extraLen = buffer.readUInt16LE(offset + 28);

    const fileName = buffer.toString("utf8", offset + 30, offset + 30 + fileNameLen);
    const dataStart = offset + 30 + fileNameLen + extraLen;
    const compressedData = buffer.slice(dataStart, dataStart + compressedSize);

    try {
      let decompressed;
      if (compression === 0) {
        decompressed = compressedData.toString("utf8");
      } else if (compression === 8) {
        decompressed = zlib.inflateRawSync(compressedData).toString("utf8");
      }
      if (decompressed) {
        files[fileName] = decompressed;
      }
    } catch (e) {
      // ignore
    }

    offset = dataStart + compressedSize;
  }
  return files;
}

function parseXlsxFromFiles(zipFiles) {
  const sharedStrings = [];
  const ssXml = zipFiles["xl/sharedStrings.xml"] || zipFiles["xl/sharedstrings.xml"] || "";
  if (typeof ssXml === "string" && ssXml.length > 0) {
    const matches = ssXml.match(/<t[^>]*>([\s\S]*?)<\/t>/g) || [];
    for (const m of matches) {
      const text = m.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
      sharedStrings.push(text);
    }
  }

  const rows = [];
  const sheetXml = zipFiles["xl/worksheets/sheet1.xml"] || zipFiles["xl/worksheets/Sheet1.xml"] || "";
  if (typeof sheetXml !== "string" || !sheetXml) return rows;

  const rowMatches = sheetXml.match(/<row[^>]*>([\s\S]*?)<\/row>/g) || [];

  for (const rowXml of rowMatches) {
    const rMatch = rowXml.match(/r="(\d+)"/);
    const rowNum = rMatch ? parseInt(rMatch[1], 10) : null;

    const cellMatches = rowXml.match(/<c[^>]*>([\s\S]*?)<\/c>/g) || [];
    const rowObj = { _rowNum: rowNum };

    for (const cellXml of cellMatches) {
      const refMatch = cellXml.match(/r="([A-Z]+)\d+"/);
      if (!refMatch) continue;
      const colRef = refMatch[1];

      const tMatch = cellXml.match(/t="([^"]+)"/);
      const cellType = tMatch ? tMatch[1] : null;

      const vMatch = cellXml.match(/<v>([\s\S]*?)<\/v>/);
      const valStr = vMatch ? vMatch[1] : "";

      let val = valStr;
      if (cellType === "s" && valStr !== "") {
        const idx = parseInt(valStr, 10);
        val = sharedStrings[idx] !== undefined ? sharedStrings[idx] : valStr;
      } else if (cellType === "str" || cellType === "inlineStr") {
        const tVal = cellXml.match(/<t[^>]*>([\s\S]*?)<\/t>/);
        val = tVal ? tVal[1] : valStr;
      }

      rowObj[colRef] = val;
    }
    rows.push(rowObj);
  }

  return rows;
}

export async function GET() {
  try {
    await dbConnect();

    // 1. Delete test/unmapped entries from prior runs
    await Student.deleteMany({
      $or: [
        { name: /^\d+$/ },
        { name: "SR/ID No" },
        { name: "Student Name" },
        { name: "NAME OF STUDENT" },
        { name: "Adm.Date" },
        { dob: "MR. DHARMENDRA SHRMA" },
        { fathersName: "46119" }
      ]
    });

    const filePath = path.join(process.cwd(), "assets", "dust to crown students.xlsx");
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ message: "Excel file not found", success: false }, { status: 404 });
    }

    const buffer = fs.readFileSync(filePath);
    const zipFiles = parseZip(buffer);
    const extractedRows = parseXlsxFromFiles(zipFiles);

    const importedStudents = [];

    for (const r of extractedRows) {
      if (!r._rowNum || r._rowNum < 5) continue;

      const name = (r["E"] || "").toString().trim();
      if (!name || name.toLowerCase().includes("student name")) continue;

      const admissionNo = (r["A"] || "").toString().trim() || ("ADM-" + String(1000 + importedStudents.length + 1));
      const rollNumber = (r["B"] || "").toString().trim() || String(importedStudents.length + 1);
      const fathersName = (r["F"] || "").toString().trim();
      const mothersName = (r["G"] || "").toString().trim();
      const studentClass = (r["H"] || "").toString().trim() || "1";
      const studentSection = (r["I"] || "").toString().trim() || "A";
      const dob = (r["J"] || "").toString().trim();
      const address = (r["L"] || r["K"] || "").toString().trim() || "Gorakhpur";

      const studentData = {
        name,
        rollNumber,
        studentClass,
        studentSection,
        admissionNo,
        fathersName,
        mothersName,
        contactNumber: rollNumber || "",
        dob,
        gender: "Male",
        address,
        route: "Local",
        cityVillage: "Gorakhpur",
        feeCategory: "General",
        isDeleted: false,
        isActive: true
      };

      const newStudent = await Student.create(studentData);
      if (newStudent) {
        importedStudents.push(newStudent);
      }
    }

    const totalActiveInMongoDB = await Student.countDocuments({ isDeleted: { $ne: true } });

    return NextResponse.json({
      success: true,
      message: `🎉 IMPORT COMPLETED! Successfully imported all ${importedStudents.length} students from 'assets/dust to crown students.xlsx' directly into MongoDB!`,
      importedCount: importedStudents.length,
      totalActiveInMongoDB,
      sampleFirstStudent: importedStudents[0] || null,
      sampleSecondStudent: importedStudents[1] || null
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message, stack: error.stack }, { status: 200 });
  }
}
