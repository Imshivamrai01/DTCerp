import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Remark from "@/models/remarkModel";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const remarkToId = params.id;

    const remark = await Remark.find({ remarkToId });

    if (!remark || remark.length === 0) {
      return NextResponse.json({ message: "No Remark Found!", success: false }, { status: 404 });
    }

    return NextResponse.json({ data: remark, success: true }, { status: 200 });
  } catch (error) {
    console.error("GetRemarksById API Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const id = params.id;
    const data = await req.json();

    const remark = await Remark.findByIdAndUpdate(id, data, { new: true });

    if (!remark) {
      return NextResponse.json({ message: "Error occured while updating remark.", success: false }, { status: 400 });
    }

    return NextResponse.json({ data: remark, success: true }, { status: 200 });
  } catch (error) {
    console.error("UpdateRemark API Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}
