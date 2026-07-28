const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

async function fixUserIndex() {
  try {
    const mongoUri = process.env.MONGO_URI;
    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri, { dbName: "D2C_Portal" });
    console.log("Connected successfully!");

    const db = mongoose.connection.db;
    const collection = db.collection("users");

    // List all indexes on users collection
    const indexes = await collection.indexes();
    console.log("Current indexes on users collection:", JSON.stringify(indexes, null, 2));

    // Check if id_1 index exists
    const hasIdIndex = indexes.some(idx => idx.name === "id_1");
    if (hasIdIndex) {
      console.log("Dropping index id_1...");
      try {
        await collection.dropIndex("id_1");
        console.log("Successfully dropped index id_1!");
      } catch (err) {
        console.error("Error dropping index id_1:", err.message);
      }
    }

    // Assign unique `id` to any users missing an `id` field or having `id: null`
    const usersWithoutId = await collection.find({ $or: [{ id: null }, { id: { $exists: false } }] }).toArray();
    console.log(`Found ${usersWithoutId.length} users missing an 'id' field.`);

    for (const u of usersWithoutId) {
      const generatedId = "usr-" + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
      await collection.updateOne({ _id: u._id }, { $set: { id: generatedId } });
      console.log(`Updated user ${u.name || u.email || u._id} with id: ${generatedId}`);
    }

    // Re-create id_1 index with sparse: true
    console.log("Re-creating index id_1 with sparse: true...");
    await collection.createIndex({ id: 1 }, { unique: true, sparse: true });
    console.log("Successfully created sparse unique index id_1!");

    process.exit(0);
  } catch (error) {
    console.error("Fix script error:", error);
    process.exit(1);
  }
}

fixUserIndex();
