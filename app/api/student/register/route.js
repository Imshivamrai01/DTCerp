import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Student from "@/models/studentModel";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(req) {
  try {
    await dbConnect();
    const contentType = req.headers.get("content-type") || "";
    let data = {};
    let files = { studentAvatar: null, fatherPhoto: null, motherPhoto: null };

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      for (const [key, value] of formData.entries()) {
        if (["studentAvatar", "fatherPhoto", "motherPhoto"].includes(key)) {
          files[key] = value;
        } else {
          data[key] = value;
        }
      }
    } else {
      data = await req.json();
    }

    if (!data.name) {
      return NextResponse.json({ message: "Please provide the student name!", success: false }, { status: 400 });
    }
    if (!data.rollNumber) {
      return NextResponse.json({ message: "Please provide the student roll number!", success: false }, { status: 400 });
    }

    const { rollNumber, studentSection, admissionNo: admissionNumber } = data;

    const studentExists = await Student.findOne({ rollNumber, studentSection, admissionNumber });
    if (
      studentExists &&
      studentExists.rollNumber == rollNumber &&
      studentExists.studentSection == studentSection &&
      studentExists.admissionNo == admissionNumber
    ) {
      return NextResponse.json({ message: "Student Already Exists!", success: false }, { status: 409 });
    }

    const uploadedImages = {};
    const processUpload = async (fileKey) => {
      if (files[fileKey] && files[fileKey].size > 0) {
        const arrayBuffer = await files[fileKey].arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const currentId = data[fileKey]?.public_id;
        return await uploadToCloudinary(buffer, "D2C-Portal", currentId);
      }
      return null;
    };

    const studentAvatar = await processUpload("studentAvatar");
    if (studentAvatar) uploadedImages.studentAvatar = studentAvatar;

    const fatherPhoto = await processUpload("fatherPhoto");
    if (fatherPhoto) uploadedImages.fatherPhoto = fatherPhoto;

    const motherPhoto = await processUpload("motherPhoto");
    if (motherPhoto) uploadedImages.motherPhoto = motherPhoto;

    data = { ...data, ...uploadedImages };

    const student = await Student.create(data);

    if (!student) {
      return NextResponse.json({ message: "Error while creating student!", success: false }, { status: 400 });
    }

    return NextResponse.json({ data: student, success: true }, { status: 201 });
  } catch (error) {
    console.error("Register Student API Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}
