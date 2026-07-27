import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/userModel";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();
    
    const users = await User.find().sort({ name: 1 });

    if (!users || users.length === 0) {
      return NextResponse.json({ message: "Users not found!", success: false }, { status: 404 });
    }
    
    const count = await User.countDocuments();

    return NextResponse.json({ data: users, count, success: true }, { status: 200 });
  } catch (error) {
    console.error("GetAllUsers API Error:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
  }
}
