import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Student from "@/models/studentModel";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const id = params.id;

    const student = await Student.findOne({
      _id: id,
      isDeleted: { $ne: true },
    }).select("-password");

    if (!student) {
      return NextResponse.json({ success: false, message: "Student Not Found!" }, { status: 404 });
    }

    return NextResponse.json({ data: student, success: true }, { status: 200 });
  } catch (error) {
    console.error("GetSingleStudent API Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const id = params.id;

    if (!id) {
      return NextResponse.json({ message: "Please provide the Student id.", success: false }, { status: 400 });
    }

    const studentExists = await Student.findById(id);
    if (!studentExists) {
      return NextResponse.json({ message: "Student not exists!", success: false }, { status: 404 });
    }

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

    const updatedStudent = await Student.findByIdAndUpdate(id, data, { new: true });

    if (!updatedStudent) {
      return NextResponse.json({ message: "Error while updating student!", success: false }, { status: 400 });
    }

    return NextResponse.json({ data: updatedStudent, success: true }, { status: 200 });
  } catch (error) {
    console.error("UpdateStudent API Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const id = params.id;

    if (!id) {
      return NextResponse.json({ message: "Please provide the student id.", success: false }, { status: 400 });
    }

    const student = await Student.findById(id);
    if (!student) {
      return NextResponse.json({ message: "Student not found.", success: false }, { status: 404 });
    }

    // Soft delete
    student.isDeleted = true;
    await student.save();

    return NextResponse.json({ message: "Deleted successfully.", success: true }, { status: 200 });
  } catch (error) {
    console.error("DeleteStudent API Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}
