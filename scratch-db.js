const mongoose = require("mongoose");
const User = require("./models/userModel");

async function run() {
  await mongoose.connect("mongodb+srv://d2c-production:w5E8Fq46gqH7z6yB@d2c-cluster.i1f8b3t.mongodb.net/d2c-database?retryWrites=true&w=majority");
  
  const teachers = await User.find({ role: "Teacher" }).sort({ createdAt: -1 }).limit(2).lean();
  console.log(JSON.stringify(teachers, null, 2));
  process.exit(0);
}
run();
