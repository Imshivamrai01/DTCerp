import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/userModel";

export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const id = params.id;
    const body = await req.json();

    const { isActive } = body;

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { message: "Status must be a boolean value", success: false },
        { status: 400 }
      );
    }

    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json(
        { message: "User not found", success: false },
        { status: 404 }
      );
    }

    user.isActive = isActive;
    await user.save();

    return NextResponse.json(
      { data: user, success: true, message: "User status updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("UpdateUserStatus API Error:", error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error", success: false },
      { status: 500 }
    );
  }
}
