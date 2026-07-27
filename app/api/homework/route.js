import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Homework from "@/models/homeworkModel";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(req) {
  try {
    await dbConnect();
    const contentType = req.headers.get("content-type") || "";
    let data = {};
    let fileEntries = [];

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          fileEntries.push(value);
        } else {
          data[key] = value;
        }
      }
    } else {
      data = await req.json();
    }

    if (!data.description || !data.className || !data.section || !data.subject || !data.dueDate || !data.teacherId || !data.teacherName) {
      return NextResponse.json({ message: "Please provide all required fields!", success: false }, { status: 400 });
    }

    const uploadedAttachments = [];
    for (const file of fileEntries) {
      if (file.size > 0) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const uploaded = await uploadToCloudinary(buffer, "D2C-Portal/Homework");
        uploadedAttachments.push(uploaded);
      }
    }

    const homework = await Homework.create({ ...data, attachments: uploadedAttachments });

    return NextResponse.json({ data: homework, success: true, message: "Homework assigned successfully." }, { status: 201 });
  } catch (error) {
    console.error("CreateHomework API Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}
