import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Homework from "@/models/homeworkModel";
import cloudinary, { uploadToCloudinary } from "@/lib/cloudinary";

export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const id = params.id;
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

    const homework = await Homework.findById(id);
    if (!homework) {
      return NextResponse.json({ message: "Homework not found!", success: false }, { status: 404 });
    }

    const uploadedAttachments = [...(homework.attachments || [])];
    for (const file of fileEntries) {
      if (file.size > 0) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const uploaded = await uploadToCloudinary(buffer, "D2C-Portal/Homework");
        uploadedAttachments.push(uploaded);
      }
    }

    const updatedHomework = await Homework.findByIdAndUpdate(
      id,
      { ...data, attachments: uploadedAttachments },
      { new: true }
    );

    return NextResponse.json({ data: updatedHomework, success: true, message: "Homework updated successfully." }, { status: 200 });
  } catch (error) {
    console.error("UpdateHomework API Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const id = params.id;

    const homework = await Homework.findById(id);
    if (!homework) {
      return NextResponse.json({ message: "Homework not found!", success: false }, { status: 404 });
    }

    if (homework.attachments && homework.attachments.length > 0) {
      for (const attachment of homework.attachments) {
        if (attachment.public_id) {
          await cloudinary.uploader.destroy(attachment.public_id);
        }
      }
    }

    await Homework.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Homework deleted successfully." }, { status: 200 });
  } catch (error) {
    console.error("DeleteHomework API Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}
