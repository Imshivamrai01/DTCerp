import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/userModel';

export async function POST(request) {
  try {
    const body = await request.json();
    console.log("API received body:", body);
    const { email, password } = body;

    if (!email) {
      console.log("Failed: Missing email");
      return NextResponse.json({ message: "Please provide the email field!" }, { status: 400 });
    }
    if (!password) {
      console.log("Failed: Missing password");
      return NextResponse.json({ message: "Please provide the password field!" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email }).lean();

    if (!user) {
      console.log("Failed: User Not Found for email", email);
      return NextResponse.json({ message: "User Not Found!" }, { status: 400 });
    }

    if (user.password !== password) {
      console.log("Failed: Incorrect Password");
      return NextResponse.json({ message: "Incorrect Password!" }, { status: 400 });
    }

    if (user.isActive === false) {
      console.log("Failed: User is inactive");
      return NextResponse.json({ message: "You don't have permission to login please contact Admin." }, { status: 400 });
    }

    const responseData = {
      _id: user._id.toString(),
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
    };

    // Safely parse/stringify to remove any MongoDB BSON types from nested arrays
    const safeData = JSON.parse(JSON.stringify(responseData));

    return NextResponse.json(safeData, { status: 200 });

  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
