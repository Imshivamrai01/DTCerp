import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/userModel";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const conn = await connectDB();
    const db = conn.connection.db;
    const collection = db.collection("users");

    // 1. Get current indexes
    const indexes = await collection.indexes();
    console.log("Current indexes on users collection:", indexes);

    // 2. Drop legacy id_1, rfid_1, firebaseUid_1 indexes if present
    const indexNamesToDrop = ["id_1", "rfid_1", "firebaseUid_1"];
    const dropped = [];

    for (const name of indexNamesToDrop) {
      if (indexes.some(idx => idx.name === name)) {
        try {
          await collection.dropIndex(name);
          dropped.push(name);
        } catch (err) {
          console.error(`Error dropping index ${name}:`, err.message);
        }
      }
    }

    // 3. Find and update all users missing a unique id
    const nullIdUsers = await collection.find({
      $or: [
        { id: null },
        { id: "" },
        { id: { $exists: false } }
      ]
    }).toArray();

    let updatedCount = 0;
    for (const u of nullIdUsers) {
      const generatedId = "usr-" + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
      await collection.updateOne({ _id: u._id }, { $set: { id: generatedId } });
      updatedCount++;
    }

    // 4. Also clean up any empty strings for rfid and firebaseUid
    await collection.updateMany({ rfid: "" }, { $unset: { rfid: "" } });
    await collection.updateMany({ firebaseUid: "" }, { $unset: { firebaseUid: "" } });

    // 5. Re-create sparse unique indexes
    await collection.createIndex({ id: 1 }, { unique: true, sparse: true });
    await collection.createIndex({ rfid: 1 }, { unique: true, sparse: true });
    await collection.createIndex({ firebaseUid: 1 }, { unique: true, sparse: true });

    return NextResponse.json({
      success: true,
      message: "MongoDB Indexes successfully cleaned up and updated!",
      droppedIndexes: dropped,
      updatedUsersCount: updatedCount
    }, { status: 200 });

  } catch (error) {
    console.error("Fix indexes error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
