import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/userModel";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(req) {
  try {
    await dbConnect();

    // The request might be JSON or FormData depending on the frontend.
    const contentType = req.headers.get("content-type") || "";
    let data = {};
    let avatarFile = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      // Convert formData to a plain object
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

    if (!data.email) {
      return NextResponse.json({ message: "Please provide the email field!", success: false }, { status: 400 });
    }
    if (!data.password) {
      return NextResponse.json({ message: "Please provide the password field!", success: false }, { status: 400 });
    }

    const email = data.email;
    const userExists = await User.findOne({ email });

    if (userExists) {
      return NextResponse.json({ message: "User Already Exists!", success: false }, { status: 409 });
    }

    // Handle Image Upload using memory buffer
    if (avatarFile && avatarFile.size > 0) {
      const arrayBuffer = await avatarFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const uploaded = await uploadToCloudinary(buffer, "D2C-Portal");
      if (uploaded) {
        data.avatar = uploaded;
      }
    }

    // Explicit boolean parsing for isActive if sent via FormData
    if (data.isActive !== undefined) {
      data.isActive = data.isActive === 'true' || data.isActive === true;
    }

    if (!data.id || data.id === "") {
      data.id = "usr-" + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    }
    if (!data.rfid || data.rfid === "") delete data.rfid;
    if (!data.firebaseUid || data.firebaseUid === "") delete data.firebaseUid;

    const user = await User.create(data);

    if (!user) {
      return NextResponse.json({ message: "Error while creating user!", success: false }, { status: 400 });
    }

    return NextResponse.json({ data: user, success: true }, { status: 201 });
  } catch (error) {
    console.error("Register API Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}
