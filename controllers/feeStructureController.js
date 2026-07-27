const asyncHandler = require("express-async-handler");
const FeeStructure = require("../models/feeStructureModel");

// Create
const createFeeStructure = asyncHandler(async (req, res) => {
  const data = req.body;

  const result = await FeeStructure.create(data);

  if (!result) {
    return res.status(400).json({ message: "Something went wrong" });
  }

  res.status(201).json({
    data: result,
    success: true,
    message: "Fee Structure created successfully",
  });
});

// Edit
const editFeeStructure = asyncHandler(async (req, res) => {
  const data = req.body;

  const result = await FeeStructure.findByIdAndUpdate(req.params.id, data, {
    new: true,
  });

  if (!result) {
    return res.status(400).json({ message: "Something went wrong" });
  }

  res.status(200).json({
    data: result,
    success: true,
    message: "Fee Structure updated successfully",
  });
});

// Get Single
const getSingleFeeStructure = asyncHandler(async (req, res) => {
  const result = await FeeStructure.findById(req.params.id);

  if (!result) {
    return res.status(400).json({ message: "Something went wrong" });
  }

  res.status(200).json({
    data: result,
    success: true,
    message: "Fee Structure fetched successfully",
  });
});

// Get All
const getAllFeeStructure = asyncHandler(async (req, res) => {
  const result = await FeeStructure.find();

  if (!result) {
    return res.status(400).json({ message: "Something went wrong" });
  }

  res.status(200).json({
    data: result,
    success: true,
    message: "Fee Structure fetched successfully",
  });
});

// Delete
const deleteFeeStructure = asyncHandler(async (req, res) => {
  const result = await FeeStructure.findByIdAndDelete(req.params.id);

  if (!result) {
    return res.status(400).json({ message: "Something went wrong" });
  }

  res.status(200).json({
    data: result,
    success: true,
    message: "Fee Structure deleted successfully",
  });
});

// Filter
const filterData = asyncHandler(async (req, res) => {
  const { className, category, route } = req.query;

  let query = {};

  if (className) {
    query.class = className;
  }

  if (category) {
    query.category = category;
  }

  if (route) {
    query.route = route;
  }

  const result = await FeeStructure.find(query);

  if (!result) {
    return res.status(400).json({ message: "No data found" });
  }

  res.status(200).json({
    data: result,
    success: true,
  });
});

module.exports = {
  createFeeStructure,
  editFeeStructure,
  getSingleFeeStructure,
  getAllFeeStructure,
  deleteFeeStructure,
  filterData,
};
