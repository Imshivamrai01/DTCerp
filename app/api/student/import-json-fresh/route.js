import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import dbConnect from "@/lib/dbConnect";
import Student from "@/models/studentModel";

export const dynamic = "force-dynamic";

function isValidDate(dateStr) {
  if (dateStr === null || dateStr === undefined || dateStr === "") return true;
  const str = String(dateStr).trim();

  // Reject literal placeholder strings like "dd/MM/yyyy"
  if (str.toLowerCase().includes("dd") || str.toLowerCase().includes("mm") || str.toLowerCase().includes("yyyy")) {
    return false;
  }
  
  const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (isoRegex.test(str)) {
    const timestamp = Date.parse(str);
    if (!isNaN(timestamp)) {
      const year = new Date(timestamp).getFullYear();
      if (year >= 1950 && year <= 2040) return true;
    }
  }

  const timestamp = Date.parse(str);
  if (isNaN(timestamp)) return false;
  const year = new Date(timestamp).getFullYear();
  return year >= 1950 && year <= 2040;
}

export async function GET() {
  return executeFreshImport();
}

export async function POST() {
  return executeFreshImport();
}

async function executeFreshImport() {
  try {
    await dbConnect();

    // 1. Drop old collection records to perform a clean, fresh bulk import
    await Student.deleteMany({});

    // 2. Ensure indexes on admissionNo and srId
    try {
      await Student.collection.createIndex({ admissionNo: 1 }, { sparse: true });
      await Student.collection.createIndex({ srId: 1 }, { sparse: true });
    } catch (idxErr) {
      console.warn("Index warning:", idxErr.message);
    }

    // 3. Read assets/student_import.json
    const filePath = path.join(process.cwd(), "assets", "student_import.json");
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ message: "File student_import.json not found at " + filePath, success: false }, { status: 404 });
    }

    const fileContent = fs.readFileSync(filePath, "utf8");
    const rawData = JSON.parse(fileContent);

    if (!Array.isArray(rawData)) {
      return NextResponse.json({ message: "JSON content is not an array!", success: false }, { status: 400 });
    }

    const existingAdmissionNos = new Set();
    const totalRecords = rawData.length;
    let imported = 0;
    let skipped = 0;
    let failed = 0;

    const details = {
      skipped: [],
      failed: []
    };

    const validStudentsToInsert = [];

    // 4. Process each student record
    for (let i = 0; i < rawData.length; i++) {
      const item = rawData[i];

      const admissionNo = item.admissionNo != null && String(item.admissionNo).trim() !== "" 
        ? String(item.admissionNo).trim() 
        : null;
      
      const srId = item.srId != null && String(item.srId).trim() !== "" 
        ? String(item.srId).trim() 
        : null;
      
      const admissionDate = item.admissionDate != null && String(item.admissionDate).trim() !== "" 
        ? String(item.admissionDate).trim() 
        : null;
      
      const studentName = item.studentName != null && String(item.studentName).trim() !== "" 
        ? String(item.studentName).trim() 
        : null;
      
      const fatherName = item.fatherName != null && String(item.fatherName).trim() !== "" 
        ? String(item.fatherName).trim() 
        : null;
      
      const motherName = item.motherName != null && String(item.motherName).trim() !== "" 
        ? String(item.motherName).trim() 
        : null;
      
      const studentClass = item.class != null && String(item.class).trim() !== "" 
        ? String(item.class).trim() 
        : "1";
      
      const section = item.section != null && String(item.section).trim() !== "" 
        ? String(item.section).trim() 
        : "A";
      
      const dob = item.dob != null && String(item.dob).trim() !== "" 
        ? String(item.dob).trim() 
        : null;
      
      const houseNo = item.houseNo != null && String(item.houseNo).trim() !== "" 
        ? String(item.houseNo).trim() 
        : null;
      
      const mohalla = item.mohalla != null && String(item.mohalla).trim() !== "" 
        ? String(item.mohalla).trim() 
        : null;
      
      const post = item.post != null && String(item.post).trim() !== "" 
        ? String(item.post).trim() 
        : null;

      // Requirement 4: Validate dates before importing
      if (admissionDate !== null && !isValidDate(admissionDate)) {
        failed++;
        details.failed.push({
          index: i + 1,
          admissionNo,
          studentName,
          reason: `Invalid admissionDate format: '${admissionDate}'`
        });
        continue;
      }

      if (dob !== null && !isValidDate(dob)) {
        failed++;
        details.failed.push({
          index: i + 1,
          admissionNo,
          studentName,
          reason: `Invalid dob format: '${dob}'`
        });
        continue;
      }

      // Mandatory field
      if (!studentName) {
        failed++;
        details.failed.push({
          index: i + 1,
          admissionNo,
          studentName: null,
          reason: "Missing mandatory studentName"
        });
        continue;
      }

      // Requirement 2: Skip duplicate Admission Numbers
      if (admissionNo !== null && existingAdmissionNos.has(admissionNo)) {
        skipped++;
        details.skipped.push({
          index: i + 1,
          admissionNo,
          studentName,
          reason: `Duplicate Admission Number '${admissionNo}'`
        });
        continue;
      }

      if (admissionNo !== null) {
        existingAdmissionNos.add(admissionNo);
      }

      const addressParts = [houseNo, mohalla, post].filter(Boolean);
      const fullAddress = addressParts.length > 0 ? addressParts.join(", ") : null;

      const studentDoc = {
        name: studentName,
        rollNumber: String(validStudentsToInsert.length + 1),
        studentClass,
        studentSection: section,
        admissionNo,
        srId,
        admissionDate,
        fathersName: fatherName,
        mothersName: motherName,
        dob,
        houseNo,
        mohalla,
        post,
        address: fullAddress,
        route: "Local",
        cityVillage: mohalla || "Gorakhpur",
        feeCategory: "General",
        isActive: true,
        isDeleted: false
      };

      validStudentsToInsert.push(studentDoc);
    }

    // 6. Bulk import using MongoDB
    if (validStudentsToInsert.length > 0) {
      try {
        const insertedDocs = await Student.insertMany(validStudentsToInsert, { ordered: false });
        imported = insertedDocs.length;
      } catch (bulkErr) {
        if (bulkErr.insertedDocs) {
          imported = bulkErr.insertedDocs.length;
        }
        if (bulkErr.writeErrors) {
          for (const err of bulkErr.writeErrors) {
            failed++;
            details.failed.push({
              index: err.index,
              reason: err.errmsg || "Bulk insert write error"
            });
          }
        }
      }
    }

    const currentTotalInDB = await Student.countDocuments({ isDeleted: { $ne: true } });

    // 8. Return import summary after completion
    return NextResponse.json({
      success: true,
      message: `🎉 Bulk Import completed! Successfully imported ${imported} students into MongoDB.`,
      summary: {
        totalRecordsProcessed: totalRecords,
        totalImported: imported,
        totalSkipped: skipped,
        totalFailed: failed,
        totalActiveStudentsInMongoDB: currentTotalInDB
      },
      sampleFirstStudent: validStudentsToInsert[0] || null,
      sampleSecondStudent: validStudentsToInsert[1] || null,
      details: {
        failedCount: details.failed.length,
        skippedCount: details.skipped.length,
        failedSamples: details.failed.slice(0, 10),
        skippedSamples: details.skipped.slice(0, 10)
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Fresh import error:", error);
    return NextResponse.json({ success: false, message: error.message, stack: error.stack }, { status: 500 });
  }
}
