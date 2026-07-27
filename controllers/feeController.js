const asyncHandler = require("express-async-handler");
const Fee = require("../models/feeModel");

// Add Fee
const addFee = asyncHandler(async (req, res) => {
  const data = req.body;

  if (!data.studentId) {
    return res
      .status(400)
      .json({ message: "Student Id is required", success: false });
  }

  const checkFeeExists = await Fee.findOne({
    studentId: data.studentId,
    session: data.session,
    feeMonth: data.feeMonth,
  });

  if (checkFeeExists) {
    return res
      .status(400)
      .json({ message: "Fee already exists", success: false });
  }

  const fee = await Fee.create(data);

  if (fee) {
    return res
      .status(201)
      .json({ data: fee, message: "Fee added successfully", success: true });
  } else {
    return res
      .status(400)
      .json({ message: "Error while adding fee!", success: false });
  }
});

// Edit Fee
const editFee = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const data = req.body;

  const checkFeeExists = await Fee.findById(id);

  if (!checkFeeExists) {
    return res.status(400).json({ message: "Fee not found!", success: false });
  }

  const fee = await Fee.findByIdAndUpdate(id, data, { new: true });

  if (fee) {
    return res
      .status(201)
      .json({ data: fee, message: "Fee updated successfully", success: true });
  } else {
    return res
      .status(400)
      .json({ message: "Error while updating fee!", success: false });
  }
});

// Get Fee Due
const getDueFee = asyncHandler(async (req, res) => {
  const fee = await Fee.find({ isFeeDue: true })
    .populate([
      {
        path: "studentId",
        select:
          "name fathersName rollNumber contactNumber fathersNo studentClass studentSection",
      },
    ])
    .select(
      "-session -feeMonth -admissionFee -tutionFee -othersFee -boardFee -discount -isFeeDue -feeDue -gst -createdAt -updatedAt"
    );

  if (fee) {
    return res.status(200).json({ data: fee, success: true });
  } else {
    return res.status(400).json({ message: "Fee not found!", success: false });
  }
});

// Get Quarterly Fee Data
const getQaurterlyFee = asyncHandler(async (req, res) => {
  const session = req.query.session;
  const studentId = req.query.studentId;
  const feeMonth = req.query.feeMonth;

  const fee = await Fee.findOne({
    session: session,
    studentId: studentId,
    feeMonth: feeMonth,
  });

  if (fee) {
    return res.status(200).json({ data: fee, success: true });
  } else {
    return res.status(400).json({ message: "Fee not found!", success: false });
  }
});

// Get Pending Fee Quarterly Data
const getPendingFee = asyncHandler(async (req, res) => {
  const session = req.query.session;

  const fee = await Fee.find({
    session: session,
    isFeeDue: true,
  });

  if (fee) {
    return res.status(200).json({ data: fee, success: true });
  } else {
    return res.status(400).json({ message: "Fee not found!", success: false });
  }
});

// Get Due Fees for all months
const getDueFees = asyncHandler(async (req, res) => {
  const studentId = req.query.studentId;
  const session = req.query.session;

  if (!studentId || !session)
    return res.status(400).json({
      message: "Student Id and Session are required!",
      success: false,
    });

  const fee = await Fee.find({
    studentId: studentId,
    session: session,
    isFeeDue: true,
  });

  const transformFee = fee.map((item) => {
    return {
      feeId: item._id,
      feeMonth: item.feeMonth,
      dueFee: item.dueFee,
    };
  });

  if (fee) {
    return res.status(200).json({ data: transformFee, success: true });
  } else {
    return res.status(400).json({ message: "Fee not found!", success: false });
  }
});

module.exports = {
  addFee,
  editFee,
  getDueFee,
  getQaurterlyFee,
  getPendingFee,
  getDueFees,
};
