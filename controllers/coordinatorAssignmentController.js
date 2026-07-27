const asyncHandler = require("express-async-handler");
const CoordinatorAssignment = require("../models/coordinatorAssignmentModel");

// Create new assignment
const createAssignment = asyncHandler(async (req, res) => {
  const assignments = Array.isArray(req.body) ? req.body : [req.body];

  const createdAssignments = [];

  for (const assignmentData of assignments) {
    const {
      teacherName,
      teacherId,
      class: className,
      section,
      subject,
      assignedWorkType,
      projectedDate,
      coordinatorName,
      coordinatorId,
    } = assignmentData;

    if (
      !teacherName ||
      !teacherId ||
      !className ||
      !section ||
      !assignedWorkType?.length ||
      !projectedDate ||
      !coordinatorName ||
      !coordinatorId
    ) {
      return res.status(400).json({
        message: "All fields are required for each assignment!",
        success: false,
      });
    }

    const assignment = await CoordinatorAssignment.create({
      teacherName,
      teacherId,
      class: className,
      section,
      subject,
      assignedWorkType,
      projectedDate,
      coordinatorName,
      coordinatorId,
    });

    createdAssignments.push(assignment);
  }

  res.status(201).json({
    data: createdAssignments,
    success: true,
    message: `${createdAssignments.length} assignment(s) created successfully.`,
  });
});

// Get all assignments
const getAllAssignments = asyncHandler(async (req, res) => {
  const { coordinatorId } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = 25;
  const skip = (page - 1) * limit;

  let filter = {};
  if (coordinatorId) {
    filter.coordinatorId = coordinatorId;
  }

  const assignments = await CoordinatorAssignment.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalCount = await CoordinatorAssignment.countDocuments(filter);

  res.status(200).json({
    data: assignments,
    count: assignments.length,
    total: totalCount,
    page,
    totalPages: Math.ceil(totalCount / limit),
    success: true,
  });
});

// Update assignment
const updateAssignment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      message: "Assignment ID is required!",
      success: false,
    });
  }

  const assignment = await CoordinatorAssignment.findByIdAndUpdate(
    id,
    req.body,
    {
      new: true,
    }
  );

  if (!assignment) {
    return res.status(404).json({
      message: "Assignment not found!",
      success: false,
    });
  }

  res.status(200).json({
    data: assignment,
    success: true,
    message: "Assignment updated successfully.",
  });
});

// Get assignments by teacher ID
const getAssignmentsByTeacher = asyncHandler(async (req, res) => {
  const { teacherId } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  if (!teacherId) {
    return res.status(400).json({
      message: "Teacher ID is required!",
      success: false,
    });
  }

  const assignments = await CoordinatorAssignment.find({ teacherId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalCount = await CoordinatorAssignment.countDocuments({ teacherId });
  const pendingCount = await CoordinatorAssignment.countDocuments({
    teacherId,
    actualSubmissionDate: { $in: [null, ""] },
  });

  res.status(200).json({
    data: assignments,
    count: assignments.length,
    total: totalCount,
    pendingCount: pendingCount,
    page,
    totalPages: Math.ceil(totalCount / limit),
    success: true,
  });
});

// Update actual submission date (for teachers)
const updateSubmissionDate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { actualSubmissionDate } = req.body;

  if (!id) {
    return res.status(400).json({
      message: "Assignment ID is required!",
      success: false,
    });
  }

  if (!actualSubmissionDate) {
    return res.status(400).json({
      message: "Actual submission date is required!",
      success: false,
    });
  }

  const assignment = await CoordinatorAssignment.findByIdAndUpdate(
    id,
    { actualSubmissionDate },
    { new: true }
  );

  if (!assignment) {
    return res.status(404).json({
      message: "Assignment not found!",
      success: false,
    });
  }

  res.status(200).json({
    data: assignment,
    success: true,
    message: "Submission date updated successfully.",
  });
});

module.exports = {
  createAssignment,
  getAllAssignments,
  updateAssignment,
  getAssignmentsByTeacher,
  updateSubmissionDate,
};
