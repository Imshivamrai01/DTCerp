import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/userModel";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ message: "Please enter a query", success: false }, { status: 400 });
    }

    const users = await User.find({
      $or: [
        { email: { $regex: query, $options: "i" } },
        { name: { $regex: query, $options: "i" } },
      ],
    });

    if (!users || users.length === 0) {
      return NextResponse.json({ message: "No users found!", success: false }, { status: 404 });
    }

    return NextResponse.json({ data: users, success: true }, { status: 200 });
  } catch (error) {
    console.error("SearchUsers API Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}
