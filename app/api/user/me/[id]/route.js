import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/userModel";

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const id = params.id;

    if (!id) {
      return NextResponse.json({ success: false, message: "User ID is required" }, { status: 400 });
    }

    const user = await User.findById(id).select("-password");

    if (!user) {
      return NextResponse.json({ success: false, message: "User Not Found!" }, { status: 404 });
    }

    return NextResponse.json({ user: user, success: true }, { status: 200 });
  } catch (error) {
    console.error("GetMe API Error:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
  }
}
