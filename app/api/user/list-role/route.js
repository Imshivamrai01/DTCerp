import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/userModel";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");

    if (!role) {
      return NextResponse.json({ message: "Please provide a role", success: false }, { status: 400 });
    }

    const users = await User.find({
      $or: [{ role: role }, { secondaryRole: role }],
    }).select("name role secondaryRole");

    if (!users || users.length === 0) {
      return NextResponse.json({ message: "No users found!", success: false }, { status: 404 });
    }

    return NextResponse.json({ data: users, success: true }, { status: 200 });
  } catch (error) {
    console.error("ListByRole API Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}
