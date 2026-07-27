const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Student = require("../models/studentModel");

// Get students for a specific class and section, and flag if they have a parent registered
const getStudentsForParentRegistration = asyncHandler(async (req, res) => {
  const { studentClass, studentSection } = req.query;

  if (!studentClass || !studentSection) {
    return res.status(400).json({ message: "Class and Section are required", success: false });
  }

  // In some parts of the DB it might be stored as "3", in others as "Class 3" or "L.K.G"
  // So we will match both variants
  let classMatch = studentClass;
  if (!studentClass.startsWith("Class ") && !studentClass.includes("K.G")) {
    classMatch = { $in: [studentClass, `Class ${studentClass}`] };
  } else {
    classMatch = { $in: [studentClass, studentClass.replace("Class ", "")] };
  }

  // Fetch all students for the given class and section
  const students = await Student.find({ 
    studentClass: classMatch, 
    studentSection, 
    isDeleted: { $ne: true } 
  }).lean();

  if (!students || students.length === 0) {
    return res.status(200).json({ data: [], success: true });
  }

  // Get all parent users who have linked students
  const parentUsers = await User.find({ role: "Parent", linkedStudents: { $exists: true, $not: { $size: 0 } } }).lean();

  // Create a set of student IDs that already have a parent assigned
  const assignedStudentIds = new Set();
  parentUsers.forEach(parent => {
    if (parent.linkedStudents) {
      parent.linkedStudents.forEach(id => assignedStudentIds.add(id.toString()));
    }
  });

  // Map students and add hasParent flag
  const result = students.map(student => ({
    ...student,
    hasParent: assignedStudentIds.has(student._id.toString())
  }));

  res.status(200).json({ data: result, success: true });
});

// Register a new parent
const registerParent = asyncHandler(async (req, res) => {
  const { email, password, name, number, studentId } = req.body;

  if (!email || !password || !studentId) {
    return res.status(400).json({ message: "Email, password, and studentId are required", success: false });
  }

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(409).json({ message: "User with this login ID already exists", success: false });
  }

  // Create parent user
  const newParent = await User.create({
    email,
    password,
    name: name || "Parent",
    number: number || null,
    role: "Parent",
    linkedStudents: [studentId]
  });

  if (!newParent) {
    return res.status(400).json({ message: "Error while creating parent account", success: false });
  }

  res.status(201).json({ message: "Parent account created successfully", success: true, data: newParent });
});

// Get data for parent dashboard
const getParentStudents = asyncHandler(async (req, res) => {
  const parentId = req.query.parentId; // passed from frontend token or localstorage

  if (!parentId) {
    return res.status(400).json({ message: "Parent ID is required", success: false });
  }

  const parentUser = await User.findById(parentId).populate('linkedStudents');
  
  if (!parentUser || !parentUser.linkedStudents) {
    return res.status(404).json({ message: "Parent not found or no students linked", success: false });
  }

  res.status(200).json({ data: parentUser.linkedStudents, success: true });
});

// Get attendance for a linked student
const getStudentAttendance = asyncHandler(async (req, res) => {
  const { studentId, month, year } = req.query;

  if (!studentId || !month || !year) {
    return res.status(400).json({ message: "studentId, month, and year are required", success: false });
  }

  const numericMonth = parseInt(month) - 1;
  const startDate = new Date(year, numericMonth, 1);
  const endDate = new Date(year, numericMonth + 1, 0, 23, 59, 59, 999);

  const Attendance = require("../models/studentAttendenceModel");
  
  const records = await Attendance.find({
    student: studentId,
    date: { $gte: startDate, $lte: endDate }
  }).sort({ date: 1 });

  res.status(200).json({ data: records, success: true });
});

// Get copy checks for a linked student
const getStudentCopyChecks = asyncHandler(async (req, res) => {
  const { studentId } = req.query;

  if (!studentId) {
    return res.status(400).json({ message: "studentId is required", success: false });
  }

  const CopyCheck = require("../models/copyCheckModel");
  
  const records = await CopyCheck.find({ studentId }).sort({ createdAt: -1 });

  res.status(200).json({ data: records, success: true });
});

module.exports = {
  getStudentsForParentRegistration,
  registerParent,
  getParentStudents,
  getStudentAttendance,
  getStudentCopyChecks
};
