const asyncHandler = require("express-async-handler");
const cloudinary = require("cloudinary").v2;
const mongoose = require("mongoose");

const CopyCheck = require("../models/copyCheckModel");
const Student = require("../models/studentModel");
const User = require("../models/userModel");
// Register Copy Check

const createCopyCheck = asyncHandler(async (req, res) => {
  const data = req.body;

  // Verify user data exists in request
  if (!data.user || !data.user._id || !data.user.role) {
    return res.status(400).json({
      message: "User information missing!",
      success: false,
    });
  }

  // Check user roles (primary and secondary)
  const userRoles = [data.user.role];
  if (data.user.secondaryRole) {
    userRoles.push(data.user.secondaryRole);
  }

  const isTeacher = userRoles.includes("Teacher");
  const isCoordinator =
    userRoles.includes("Junior Coordinator") ||
    userRoles.includes("Senior Coordinator");

  // Find existing record
  const existingRecord = await CopyCheck.findOne({
    studentId: data.studentId,
    subject: data.subject,
    date: data.date,
    submitType: data.submitType,
  });

  if (existingRecord) {
    let message = "";
    let updated = false;

    // Handle teacher role check
    if (isTeacher && !existingRecord.checkedByTeacher) {
      existingRecord.checkedByTeacher = `${data.user.name} (Teacher)`;
      existingRecord.isCopyChecked = true;
      existingRecord.teacherCheckedAt = new Date();
      message = "Copy checked by teacher successfully.";
      updated = true;
    }

    // Handle coordinator role check
    if (isCoordinator && !existingRecord.checkedByCoordinator) {
      const coordinatorRole = userRoles.find(
        (role) => role === "Junior Coordinator" || role === "Senior Coordinator"
      );
      existingRecord.checkedByCoordinator = `${data.user.name} (${coordinatorRole})`;
      existingRecord.isCoordinatorCopyChecked = true;
      existingRecord.coordinatorCheckedAt = new Date();
      message = updated
        ? "Copy checked by both teacher and coordinator."
        : "Copy checked by coordinator successfully.";
      updated = true;
    }

    if (!updated) {
      return res.status(200).json({
        data: existingRecord,
        success: false,
        message: "Copy already checked for your role(s).",
      });
    }

    await existingRecord.save();
    return res.status(200).json({
      data: existingRecord,
      success: true,
      message: message,
    });
  }

  // Create new record
  const newRecord = {
    studentId: data.studentId,
    date: data.date,
    subject: data.subject,
    submitType: data.submitType,
  };

  // Set fields based on user roles
  if (isTeacher) {
    newRecord.checkedByTeacher = `${data.user.name} (Teacher)`;
    newRecord.isCopyChecked = true;
    newRecord.teacherCheckedAt = new Date();
  }

  if (isCoordinator) {
    const coordinatorRole = userRoles.find(
      (role) => role === "Junior Coordinator" || role === "Senior Coordinator"
    );
    newRecord.checkedByCoordinator = `${data.user.name} (${coordinatorRole})`;
    newRecord.isCoordinatorCopyChecked = true;
    newRecord.coordinatorCheckedAt = new Date();
  }

  const copyCheck = await CopyCheck.create(newRecord);
  res.status(201).json({
    data: copyCheck,
    success: true,
    message: "Copy check recorded successfully.",
  });
});

const listAllCopyCheck = asyncHandler(async (req, res) => {
  // const page = parseInt(req?.query?.page) || 1;
  // const limit = 10;
  // const skip = (page - 1) * limit;
  const dateData = req.query.date;

  if (!dateData) {
    return res
      .status(400)
      .json({ message: "Please provide the date!", success: false });
  }

  const copyCheck = await CopyCheck.find({ date: dateData });
  // .sort({ createdAt: -1 })
  // .skip(skip)
  // .limit(limit);

  // if (!copyCheck || copyCheck.length === 0) {
  //   return res.status(404).json({
  //     data: [],
  //   });
  // }
  const count = copyCheck.length;

  res.status(200).json({ data: copyCheck, count, success: true });
});

// Update CopyCheck
const updateCopyCheck = asyncHandler(async (req, res) => {
  const id = req.params.id;

  if (!id) {
    res
      .status(404)
      .json({ message: "Please provide the CopyCheck id.", success: false });
  }

  const copyCheckExists = await CopyCheck.findById(id);

  if (!copyCheckExists) {
    res.status(404);
    throw new Error("CopyCheck not exists!");
  }

  let data = req.body;

  if (!data.studentId) {
    return res
      .status(400)
      .json({ message: "Please provide the student ID", success: false });
  }

  const studentExists = await Student.findById(data.studentId);

  if (!studentExists) {
    return res
      .status(404)
      .json({ message: "Student not found!", success: false });
  }

  const copyCheck = await CopyCheck.findByIdAndUpdate(id, data, {
    new: true,
  });

  if (!copyCheck) {
    res.status(400);
    throw new Error("Error while updating copy check!");
  }

  res.status(200).json({ data: copyCheck, success: true });
});

module.exports = {
  createCopyCheck,
  listAllCopyCheck,
  updateCopyCheck,
};
