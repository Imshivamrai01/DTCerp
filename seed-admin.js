const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://hrjunecoinfotech_db_user:Shivam%402026@shivam.i1f8b3t.mongodb.net/D2C_Portal";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  name: { type: String },
  role: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", userSchema);

async function seedAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB...");

    // Check if admin exists
    let admin = await User.findOne({ role: "Admin" });
    if (admin) {
      console.log("Admin user already exists!");
      console.log("Email:", admin.email);
      console.log("Password:", admin.password);
    } else {
      console.log("No Admin found. Creating one...");
      admin = await User.create({
        email: "admin@d2c.com",
        password: "adminpassword",
        name: "Super Admin",
        role: "Admin",
        isActive: true
      });
      console.log("Admin created successfully!");
      console.log("Email:", admin.email);
      console.log("Password:", admin.password);
    }
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    mongoose.disconnect();
  }
}

seedAdmin();
