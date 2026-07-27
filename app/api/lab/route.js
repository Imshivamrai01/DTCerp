import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Lab from "@/models/labModel";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await dbConnect();
    const labs = await Lab.find().sort({ createdAt: -1 });
    return NextResponse.json(labs, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const newLab = await Lab.create(body);
    return NextResponse.json(newLab, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
