import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Student from "@/models/studentModel";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { students } = body;

    if (!students || !Array.isArray(students) || students.length === 0) {
      return NextResponse.json({ message: "No student records provided!", success: false }, { status: 400 });
    }

    const createdStudents = [];
    const skippedStudents = [];
    const errors = [];

    for (let i = 0; i < students.length; i++) {
      const s = students[i];
      try {
        const name = (s.name || s["Student Name"] || s["Name"] || "").toString().trim();
        let rollNumber = (s.rollNumber || s["Roll No"] || s["Roll Number"] || s["Roll"] || "").toString().trim();
        const studentClass = (s.studentClass || s["Class"] || s["Student Class"] || "").toString().trim();
        const studentSection = (s.studentSection || s["Section"] || s["Student Section"] || "A").toString().trim();
        let admissionNo = (s.admissionNo || s["Admission No"] || s["Admission Number"] || s["AdNo"] || "").toString().trim();

        if (!name) {
          errors.push(`Row ${i + 1}: Name is required`);
          continue;
        }

        // Auto-generate rollNumber or admissionNo if missing
        if (!rollNumber) {
          rollNumber = String(i + 1);
        }
        if (!admissionNo) {
          admissionNo = "ADM-" + Date.now().toString(36).slice(-4) + Math.random().toString(36).substring(2, 6);
        }

        const studentData = {
          name,
          rollNumber,
          studentClass: studentClass || "1",
          studentSection: studentSection || "A",
          admissionNo,
          fathersName: (s.fathersName || s["Father Name"] || s["Fathers Name"] || "").toString().trim(),
          mothersName: (s.mothersName || s["Mother Name"] || s["Mothers Name"] || "").toString().trim(),
          contactNumber: (s.contactNumber || s["Contact"] || s["Phone"] || s["Mobile"] || s["Contact Number"] || "").toString().trim(),
          gender: (s.gender || s["Gender"] || "").toString().trim(),
          dob: (s.dob || s["DOB"] || s["Date of Birth"] || "").toString().trim(),
          address: (s.address || s["Address"] || "").toString().trim(),
          route: (s.route || s["Route"] || "Local").toString().trim(),
          cityVillage: (s.cityVillage || s["City"] || s["Village"] || "Gorakhpur").toString().trim(),
          feeCategory: (s.feeCategory || s["Fee Category"] || "General").toString().trim(),
          isDeleted: false,
          isActive: true
        };

        const newStudent = await Student.create(studentData);
        if (newStudent) {
          createdStudents.push(newStudent);
        }
      } catch (rowErr) {
        console.error(`Error importing row ${i + 1}:`, rowErr);
        errors.push(`Row ${i + 1} (${s.name || 'Unknown'}): ${rowErr.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${createdStudents.length} students to MongoDB!`,
      totalCreated: createdStudents.length,
      errors
    }, { status: 200 });

  } catch (error) {
    console.error("Bulk Upload API Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}
