import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/userModel";

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { email, password, name, number, studentId } = body;

    if (!email || !password || !studentId) {
      return NextResponse.json({ message: "Email, password, and studentId are required", success: false }, { status: 400 });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return NextResponse.json({ message: "User with this login ID already exists", success: false }, { status: 409 });
    }

    const newParent = await User.create({
      email,
      password,
      name: name || "Parent",
      number: number || null,
      role: "Parent",
      linkedStudents: [studentId]
    });

    if (!newParent) {
      return NextResponse.json({ message: "Error while creating parent account", success: false }, { status: 400 });
    }

    return NextResponse.json({ message: "Parent account created successfully", success: true, data: newParent }, { status: 201 });
  } catch (error) {
    console.error("RegisterParent API Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}
