import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Lab from "@/models/labModel";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ message: "Please enter a query", success: false }, { status: 400 });
    }

    const regexQuery = new RegExp(query, "i");
    const labs = await Lab.find({
      $or: [
        { assignedBy: { $regex: regexQuery } },
        { inchargeName: { $regex: regexQuery } },
      ],
    });

    if (!labs || labs.length === 0) {
      return NextResponse.json({ message: "No labs found!", success: false }, { status: 404 });
    }

    return NextResponse.json({ data: labs, success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
