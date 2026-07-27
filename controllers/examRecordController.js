const asyncHandler = require("express-async-handler");
const cloudinary = require("cloudinary").v2;

const ExamRecord = require("../models/examRecordModel");
const Student = require("../models/studentModel");

// Register Exam Record
const createExamRecord = asyncHandler(async (req, res) => {
  let data = req.body;
  console.log(req.body);

  if (!data.studentId) {
    return res
      .status(404)
      .json({ message: "Please provide the student ID!", success: false });
  }

  const dataExists = await ExamRecord.findOne({
    studentId: data.studentId,
    subject: data.subject,
    examType: data.examType,
  });

  console.log(dataExists);

  if (dataExists) {
    await ExamRecord.findByIdAndUpdate(dataExists._id, data, {
      new: true,
    });
    return res.status(200).json({ success: true, message: "Updated" });
  }

  const examRecord = await ExamRecord.create(data);

  if (!examRecord) {
    return res
      .status(400)
      .json({ message: "Erorr while creating exam record!", success: false });
  }

  res.status(201).json({ data: examRecord, success: true });
});

const listAllExamRecord = asyncHandler(async (req, res) => {
  const page = parseInt(req?.query?.page) || 1;
  const limit = 20;
  const skip = (page - 1) * limit;

  const examRecord = await ExamRecord.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("studentId");

  if (!examRecord || examRecord.length === 0) {
    return res.status(404).json({
      message: "Exam Record data not found!",
      success: false,
    });
  }
  const count = await ExamRecord.countDocuments();

  res.status(200).json({ data: examRecord, count, success: true });
});

// Update ExamRecord
const updateExamRecord = asyncHandler(async (req, res) => {
  const id = req.params.id;

  if (!id) {
    res
      .status(404)
      .json({ message: "Please provide the ExamRecord id.", success: false });
  }

  const examRecordExists = await ExamRecord.findById(id);

  if (!examRecordExists) {
    res.status(404);
    throw new Error("ExamRecord not exists!");
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

  const examRecord = await ExamRecord.findByIdAndUpdate(id, data, {
    new: true,
  });

  if (!examRecord) {
    res.status(400);
    throw new Error("Error while updating exam record!");
  }

  res.status(200).json({ data: examRecord, success: true });
});

module.exports = {
  createExamRecord,
  listAllExamRecord,
  updateExamRecord,
};
