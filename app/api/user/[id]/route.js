import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/userModel";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const id = params.id;

    if (!id) {
      return NextResponse.json({ message: "Please provide the user id.", success: false }, { status: 400 });
    }

    const userExists = await User.findById(id);
    if (!userExists) {
      return NextResponse.json({ message: "User not exists!", success: false }, { status: 404 });
    }

    const contentType = req.headers.get("content-type") || "";
    let data = {};
    let avatarFile = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      for (const [key, value] of formData.entries()) {
        if (key === "avatar") {
          avatarFile = value;
        } else {
          data[key] = value;
        }
      }
    } else {
      data = await req.json();
    }

    if (avatarFile && avatarFile.size > 0) {
      const arrayBuffer = await avatarFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const uploaded = await uploadToCloudinary(buffer, "D2C-Portal", data?.avatar?.public_id);
      if (uploaded) {
        data.avatar = uploaded;
      }
    }

    // Explicit boolean parsing for isActive
    if (data.isActive !== undefined) {
      data.isActive = data.isActive === 'true' || data.isActive === true;
    }

    const user = await User.findByIdAndUpdate(id, data, { new: true });

    if (!user) {
      return NextResponse.json({ message: "Error while updating user!", success: false }, { status: 400 });
    }

    return NextResponse.json({ data: user, success: true }, { status: 200 });
  } catch (error) {
    console.error("UpdateUser API Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const id = params.id;

    if (!id) {
      return NextResponse.json({ message: "Please provide the user id.", success: false }, { status: 400 });
    }

    const userExists = await User.findById(id);
    if (!userExists) {
      return NextResponse.json({ message: "User not exists!", success: false }, { status: 404 });
    }

    await User.deleteOne({ _id: id });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("DeleteUser API Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}
