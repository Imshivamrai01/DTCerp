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
        decompressed = compressedData;
      } else if (compression === 8) {
        decompressed = zlib.inflateRawSync(compressedData);
      }
      if (decompressed) {
        files[fileName] = decompressed;
      }
    } catch (e) {
      // ignore bad entry
    }

    offset = dataStart + compressedSize;
  }
  return files;
}

function parseXlsxFromFiles(zipFiles) {
  // Shared strings
  const sharedStrings = [];
  const ssXmlBuf = zipFiles["xl/sharedStrings.xml"] || zipFiles["xl/sharedstrings.xml"] || "";
  const ssXml = typeof ssXmlBuf === "string" ? ssXmlBuf : (Buffer.isBuffer(ssXmlBuf) ? ssXmlBuf.toString("utf8") : String(ssXmlBuf || ""));
  if (ssXml && typeof ssXml === "string" && ssXml.length > 0) {
    const matches = ssXml.match(/<t[^>]*>([\s\S]*?)<\/t>/g) || [];
    for (const m of matches) {
      const text = m.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
      sharedStrings.push(text);
    }
  }

  // Worksheets
  const rows = [];
  const sheetXmlBuf = zipFiles["xl/worksheets/sheet1.xml"] || zipFiles["xl/worksheets/Sheet1.xml"] || "";
  const sheetXml = typeof sheetXmlBuf === "string" ? sheetXmlBuf : (Buffer.isBuffer(sheetXmlBuf) ? sheetXmlBuf.toString("utf8") : String(sheetXmlBuf || ""));
  if (!sheetXml || typeof sheetXml !== "string") return rows;

  const rowMatches = sheetXml.match(/<row[^>]*>([\s\S]*?)<\/row>/g) || [];

  for (const rowXml of rowMatches) {
    const rMatch = rowXml.match(/r="(\d+)"/);
    const rowNum = rMatch ? rMatch[1] : null;

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

    const filePath = path.join(process.cwd(), "assets", "dust to crown students.xlsx");
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ message: "Excel file not found at " + filePath, success: false }, { status: 404 });
    }

    const buffer = fs.readFileSync(filePath);
    const zipFiles = parseZip(buffer);
    const extractedRows = parseXlsxFromFiles(zipFiles);

    if (!extractedRows || extractedRows.length === 0) {
      return NextResponse.json({ message: "No rows found in Excel sheet!", success: false }, { status: 400 });
    }

    // Determine header row
    const headerRow = extractedRows[0];
    const dataRows = extractedRows.slice(1);

    const importedStudents = [];
    const errors = [];

    for (let i = 0; i < dataRows.length; i++) {
      const r = dataRows[i];

      // Combine column values or headers
      const values = Object.values(r).filter(v => v !== r._rowNum && v !== "");
      if (values.length === 0) continue;

      // Map by column index / header name
      const colA = (r["A"] || "").toString().trim(); // S.N. / Admission No
      const colB = (r["B"] || "").toString().trim(); // Student Name
      const colC = (r["C"] || "").toString().trim(); // Father Name
      const colD = (r["D"] || "").toString().trim(); // Mother Name
      const colE = (r["E"] || "").toString().trim(); // DOB
      const colF = (r["F"] || "").toString().trim(); // Class
      const colG = (r["G"] || "").toString().trim(); // Section / Roll
      const colH = (r["H"] || "").toString().trim(); // Mobile / Contact
      const colI = (r["I"] || "").toString().trim(); // Address

      // Find student name from colB or any text column
      let name = colB;
      if (!name || name.toLowerCase().includes("name")) {
        // Fallback: try finding first alphabetic string among values
        name = values.find(v => /[a-zA-Z]/.test(v) && !/^\d+$/.test(v) && !v.toLowerCase().includes("student")) || "";
      }

      if (!name || name.toLowerCase() === "student name" || name.toLowerCase() === "name") {
        continue;
      }

      let rollNumber = colG || String(i + 1);
      let studentClass = colF || "1";
      let studentSection = "A";
      let admissionNo = colA || "ADM-" + String(1000 + i + 1);
      let fathersName = colC;
      let mothersName = colD;
      let dob = colE;
      let contactNumber = colH;
      let address = colI;

      const studentData = {
        name,
        rollNumber,
        studentClass: studentClass || "1",
        studentSection: studentSection || "A",
        admissionNo,
        fathersName: fathersName || "",
        mothersName: mothersName || "",
        contactNumber: contactNumber || "",
        dob: dob || "",
        gender: "Male",
        address: address || "",
        route: "Local",
        cityVillage: "Gorakhpur",
        feeCategory: "General",
        isDeleted: false,
        isActive: true
      };

      try {
        const newStudent = await Student.create(studentData);
        if (newStudent) {
          importedStudents.push(newStudent);
        }
      } catch (rowErr) {
        errors.push(`Row ${i + 1} (${name}): ${rowErr.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${importedStudents.length} students from 'dust to crown students.xlsx' directly into MongoDB!`,
      totalExtractedRows: extractedRows.length,
      importedCount: importedStudents.length,
      sampleFirstStudent: importedStudents[0] || null,
      sampleSecondStudent: importedStudents[1] || null,
      errors
    }, { status: 200 });

  } catch (error) {
    console.error("Import asset excel error:", error);
    return NextResponse.json({ success: false, error: error.message, stack: error.stack }, { status: 200 });
  }
}
