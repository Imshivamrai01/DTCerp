import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import dbConnect from "@/lib/dbConnect";
import Student from "@/models/studentModel";

export const dynamic = "force-dynamic";

// Date validation helper
function isValidDate(dateStr) {
  if (!dateStr || dateStr === null || dateStr === "") return true; // Null/empty is valid as null
  const str = String(dateStr).trim();
  
  // Check ISO format YYYY-MM-DD
  const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (isoRegex.test(str)) {
    const timestamp = Date.parse(str);
    if (!isNaN(timestamp)) {
      const d = new Date(timestamp);
      const year = d.getFullYear();
      if (year >= 1950 && year <= 2040) {
        return true;
      }
    }
  }
  
  // Check if parseable Date
  const timestamp = Date.parse(str);
  if (isNaN(timestamp)) return false;
  
  const d = new Date(timestamp);
  const year = d.getFullYear();
  return year >= 1950 && year <= 2040;
}

export async function GET() {
  return handleImport();
}

export async function POST() {
  return handleImport();
}

async function handleImport() {
  try {
    await dbConnect();

    // 1. Create indexes on admissionNo and srId
    try {
      await Student.collection.createIndex({ admissionNo: 1 }, { sparse: true });
      await Student.collection.createIndex({ srId: 1 }, { sparse: true });
    } catch (idxErr) {
      console.warn("Index creation warning:", idxErr.message);
    }

    // Clear legacy test entries from trial scripts to ensure full clean import
    await Student.deleteMany({
      $or: [
        { name: "SR/ID No" },
        { name: "Student Name" },
        { name: "NAME OF STUDENT" },
        { name: "Adm.Date" },
        { dob: "MR. DHARMENDRA SHRMA" },
        { fathersName: "46119" }
      ]
    });

    // 2. Locate and read assets/student_import.json
    const filePath = path.join(process.cwd(), "assets", "student_import.json");
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({
        message: "File student_import.json not found at " + filePath,
        success: false
      }, { status: 404 });
    }

    const fileContent = fs.readFileSync(filePath, "utf8");
    const rawData = JSON.parse(fileContent);

    if (!Array.isArray(rawData)) {
      return NextResponse.json({
        message: "JSON content is not an array!",
        success: false
      }, { status: 400 });
    }

    // 3. Fetch existing admission numbers from MongoDB
    const existingDocs = await Student.find({}, "admissionNo").lean();
    const existingAdmissionNos = new Set(
      existingDocs
        .map(s => (s.admissionNo != null ? String(s.admissionNo).trim() : null))
        .filter(Boolean)
    );

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

      // Requirement: Student Name is mandatory
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

      // Track admissionNo in Set so duplicates within same file are skipped
      if (admissionNo !== null) {
        existingAdmissionNos.add(admissionNo);
      }

      // Build full address string
      const addressParts = [houseNo, mohalla, post].filter(Boolean);
      const fullAddress = addressParts.length > 0 ? addressParts.join(", ") : null;

      const studentDoc = {
        name: studentName,
        rollNumber: String(i + 1),
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
      message: "🎉 Student Import process completed successfully!",
      summary: {
        totalRecordsProcessed: totalRecords,
        totalImported: imported,
        totalSkipped: skipped,
        totalFailed: failed,
        totalActiveStudentsInMongoDB: currentTotalInDB
      },
      details: {
        skipped: details.skipped,
        failed: details.failed
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Import JSON Error:", error);
    return NextResponse.json({
      success: false,
      message: error.message || "Internal Server Error",
      stack: error.stack
    }, { status: 500 });
  }
}
