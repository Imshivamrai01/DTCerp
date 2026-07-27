import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Lab from "@/models/labModel";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const lab = await Lab.findById(params.id);
    if (!lab) return NextResponse.json({ message: "Lab Assignment not found" }, { status: 404 });
    return NextResponse.json(lab, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const body = await req.json();
    const lab = await Lab.findByIdAndUpdate(params.id, body, { new: true });
    if (!lab) return NextResponse.json({ message: "Lab Assignment not found" }, { status: 404 });
    return NextResponse.json(lab, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const lab = await Lab.findByIdAndDelete(params.id);
    if (!lab) return NextResponse.json({ message: "Lab Assignment not found" }, { status: 404 });
    return NextResponse.json({ message: "Lab Assignment deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    await dbConnect();
    const lab = await Lab.findByIdAndUpdate(params.id, { isAcknowledged: true }, { new: true });
    if (!lab) return NextResponse.json({ message: "Lab Assignment not found" }, { status: 404 });
    return NextResponse.json(lab, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
