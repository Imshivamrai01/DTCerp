import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/userModel";

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { email, password } = body;

    if (!email) {
      return NextResponse.json({ message: "Please provide the email field!" }, { status: 400 });
    }
    if (!password) {
      return NextResponse.json({ message: "Please provide the password field!" }, { status: 400 });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: "User Not Found!" }, { status: 400 });
    }

    if (user.email !== email) {
      return NextResponse.json({ message: "Incorrect Email!" }, { status: 400 });
    }

    if (user.password !== password) {
      return NextResponse.json({ message: "Incorrect Password!" }, { status: 400 });
    }

    if (user.isActive === false) {
      return NextResponse.json({ message: "You don't have permission to login please contact Admin." }, { status: 400 });
    }

    return NextResponse.json({
      _id: user._id,
      email: user.email,
      name: user.name,
      avatar: user.avatar || null,
      number: user.number,
      role: user.role,
      secondaryRole: user.secondaryRole || null,
      class: user.class || null,
      division: user.section || null,
      classTeacher: user.classTeacher || null,
      assignedSubjects: user.assignedSubjects || null,
      assignedClasses: user.assignedClasses || null,
      assignedSections: user.assignedSections || null,
      assignedWings: user.assignedWings || null,
      isActive: user.isActive,
      success: true,
    }, { status: 200 });

  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
  }
}
