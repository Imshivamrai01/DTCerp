import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const response = NextResponse.json({ success: true, message: "Logged Out" });
    response.cookies.set("logindata", "", {
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    return response;
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
