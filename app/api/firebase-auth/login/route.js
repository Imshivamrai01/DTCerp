import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/userModel";
import { cookies } from "next/headers";

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { phone, firebaseUid } = body;

    let user = await User.findOne({ firebaseUid });

    if (!user) {
      user = new User({
        number: phone,
        firebaseUid,
        email: `${phone}@temp.com`,
        password: "firebase_auth",
        name: "Firebase User",
        role: "Teacher",
        isActive: true,
      });
      await user.save();
    }

    const response = NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar || null,
        number: user.number,
        role: user.role,
        secondaryRole: user.secondaryRole || null,
        class: user.class || null,
        division: user.section || null,
        assignedSubjects: user.assignedSubjects || null,
        assignedClasses: user.assignedClasses || null,
        assignedSections: user.assignedSections || null,
        assignedWings: user.assignedWings || null,
        isActive: user.isActive,
        firebaseUid: user.firebaseUid,
      },
    });

    response.cookies.set("logindata", firebaseUid, {
      maxAge: 7 * 24 * 60 * 60,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
