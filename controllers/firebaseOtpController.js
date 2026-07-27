const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

// Firebase Auth Login (following your previous project approach)
const login = asyncHandler(async (req, res) => {
  const { phone, firebaseUid } = req.body;
  console.log(phone);
  console.log(firebaseUid);

  try {
    let user = await User.findOne({ firebaseUid });
    console.log(user);

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

    res.cookie("logindata", firebaseUid, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    return res.json({
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
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
});

const logout = asyncHandler(async (req, res) => {
  try {
    res.clearCookie("logindata", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    return res.json({ success: true, message: "Logged Out" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
});

const checkUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}, "name email number role firebaseUid");
  res.json({ users, success: true });
});

module.exports = {
  login,
  logout,
  checkUsers,
};
