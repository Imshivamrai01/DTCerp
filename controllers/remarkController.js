const asyncHandler = require("express-async-handler");
const Remark = require("../models/remarkModel");

const saveRemark = asyncHandler(async (req, res) => {
  const data = req.body;

  const remark = await Remark.create(data);

  if (!remark) {
    return res
      .status(400)
      .json({ message: "Error occured while saving remark.", success: false });
  }

  res.status(201).json({ data: remark, success: true });
});

const updateRemark = asyncHandler(async (req, res) => {
  const data = req.body;
  const remark = await Remark.findByIdAndUpdate(req.params.id, data, {
    new: true,
  });

  if (!remark) {
    return res.status(400).json({
      message: "Error occured while updating remark.",
      success: false,
    });
  }

  res.status(200).json({ data: remark, success: true });
});

// Get Remarks with Remark To Id and Remark Date.
const getRemarkswithRemarkToId = asyncHandler(async (req, res) => {
  const remarkToId = req.query.remarkToId;
  const remarkDate = req.query.remarkDate;

  const remark = await Remark.find({
    remarkToId: remarkToId,
    remarkDate: remarkDate,
  });

  if (!remark || remark.length === 0) {
    return res
      .status(404)
      .json({ message: "No Remark Found!", success: false });
  }

  res.status(200).json({ data: remark, success: true });
});

// Get Remarks with Remark By Id and Remark Date.
const getRemarkswithRemarkById = asyncHandler(async (req, res) => {
  const remarkById = req.query.remarkById;
  const remarkDate = req.query.remarkDate;

  const remark = await Remark.find({
    remarkById: remarkById,
    remarkDate: remarkDate,
  });

  if (!remark || remark.length === 0) {
    return res
      .status(404)
      .json({ message: "No Remark Found!", success: false });
  }

  res.status(200).json({ data: remark, success: true });
});

// Get Remarks with Remark Date.
const getRemarkswithRemarkDate = asyncHandler(async (req, res) => {
  const remarkDate = req.query.remarkDate;

  const remark = await Remark.find({
    remarkDate: remarkDate,
  });

  if (!remark || remark.length === 0) {
    return res
      .status(404)
      .json({ message: "No Remark Found!", success: false });
  }

  res.status(200).json({ data: remark, success: true });
});

// Get Remark
// Get Remarks with Remark To Id
const getRemarkswithId = asyncHandler(async (req, res) => {
  const remarkToId = req.params.id;

  const remark = await Remark.find({
    remarkToId: remarkToId,
  });

  if (!remark || remark.length === 0) {
    return res
      .status(404)
      .json({ message: "No Remark Found!", success: false });
  }

  res.status(200).json({ data: remark, success: true });
});

module.exports = {
  saveRemark,
  updateRemark,
  getRemarkswithRemarkToId,
  getRemarkswithRemarkById,
  getRemarkswithRemarkDate,
  getRemarkswithId,
};
