// controllers/homeworkController.js
const asyncHandler = require("express-async-handler");
const cloudinary = require("cloudinary").v2;

const Homework = require("../models/homeworkModel");
const User = require("../models/userModel");

// Create homework assignment
const createHomework = asyncHandler(async (req, res) => {
  const data = req.body;

  // Validate required fields
  if (
    !data.description ||
    !data.className ||
    !data.section ||
    !data.subject ||
    !data.dueDate ||
    !data.teacherId ||
    !data.teacherName
  ) {
    return res.status(400).json({
      message: "Please provide all required fields!",
      success: false,
    });
  }

  // Verify teacher exists
  // const teacher = await User.findById(data.teacherId);
  // if (
  //   !teacher ||
  //   !["Teacher", "Senior Coordinator", "Junior Coordinator"].includes(
  //     teacher.role
  //   )
  // ) {
  //   return res.status(404).json({
  //     message: "Teacher not found or invalid role!",
  //     success: false,
  //   });
  // }

  // Handle file uploads if any
  const uploadedAttachments = [];
  if (req.files && Object.keys(req.files).length > 0) {
    for (const key in req.files) {
      const file = req.files[key];
      const uploadResponse = await cloudinary.uploader.upload(
        file.tempFilePath,
        { folder: "D2C-Portal/Homework" }
      );
      uploadedAttachments.push({
        public_id: uploadResponse.public_id,
        secure_url: uploadResponse.secure_url,
      });
    }
  }

  // Create homework with teacher information
  const homework = await Homework.create({
    ...data,
    attachments: uploadedAttachments,
  });

  res.status(201).json({
    data: homework,
    success: true,
    message: "Homework assigned successfully.",
  });
});

// Get homework by teacher ID
const getHomeworkByTeacher = asyncHandler(async (req, res) => {
  const teacherId = req.params.teacherId;

  if (!teacherId) {
    return res.status(400).json({
      message: "Please provide teacher ID!",
      success: false,
    });
  }

  const homework = await Homework.find({ teacherId }).sort({ createdAt: -1 });

  if (!homework || homework.length === 0) {
    return res.status(404).json({
      message: "No homework assignments found for this teacher!",
      success: false,
    });
  }

  res.status(200).json({
    data: homework,
    success: true,
  });
});

// Get homework by class and section
const getHomeworkByClass = asyncHandler(async (req, res) => {
  const { className, section, date } = req.query;

if (!className || !section) {
  return res.status(400).json({
    message: "Please provide class and section!",
    success: false,
  });
}

const query = {
  className,
  section,
};

if (date) {
  // Use IST offset (+05:30) to correctly capture the start and end of the day in Indian local time
  const start = new Date(date + "T00:00:00.000+05:30");
  const end = new Date(date + "T23:59:59.999+05:30");

  query.createdAt = { $gte: start, $lte: end };
}

const homework = await Homework.find(query).sort({ createdAt: -1 });

  if (!homework || homework.length === 0) {
    return res.status(200).json({
      data: [],
      message: "No homework assignments found for this class on this date!",
      success: true,
    });
  }

res.status(200).json({
  data: homework,
  success: true,
});
});


// Update homework
const updateHomework = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const data = req.body;

  if (!id) {
    return res.status(400).json({
      message: "Please provide homework ID!",
      success: false,
    });
  }

  const homework = await Homework.findById(id);
  if (!homework) {
    return res.status(404).json({
      message: "Homework not found!",
      success: false,
    });
  }

  // Handle file uploads if any
  const uploadedAttachments = [...homework.attachments];
  if (req.files && Object.keys(req.files).length > 0) {
    for (const key in req.files) {
      const file = req.files[key];
      const uploadResponse = await cloudinary.uploader.upload(
        file.tempFilePath,
        { folder: "D2C-Portal/Homework" }
      );
      uploadedAttachments.push({
        public_id: uploadResponse.public_id,
        secure_url: uploadResponse.secure_url,
      });
    }
  }

  const updatedHomework = await Homework.findByIdAndUpdate(
    id,
    { ...data, attachments: uploadedAttachments },
    { new: true }
  );

  res.status(200).json({
    data: updatedHomework,
    success: true,
    message: "Homework updated successfully.",
  });
});

// Delete homework
const deleteHomework = asyncHandler(async (req, res) => {
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({
      message: "Please provide homework ID!",
      success: false,
    });
  }

  const homework = await Homework.findById(id);
  if (!homework) {
    return res.status(404).json({
      message: "Homework not found!",
      success: false,
    });
  }

  // Delete attachments from cloudinary if any
  if (homework.attachments && homework.attachments.length > 0) {
    for (const attachment of homework.attachments) {
      if (attachment.public_id) {
        await cloudinary.uploader.destroy(attachment.public_id);
      }
    }
  }

  await Homework.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "Homework deleted successfully.",
  });
});
const getHomeworkById = async (req, res) => {
  const { id } = req.params;
console.log("Fetching homework with ID:", id);
  try {
    const homework = await Homework.findById(id);

    if (!homework) {
      return res.status(404).json({
        success: false,
        message: 'Homework not found',
      });
    }

    res.status(200).json({
      success: true,
      data: homework,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

module.exports = {
  createHomework,
  getHomeworkByTeacher,
  getHomeworkByClass,
  updateHomework,
  deleteHomework,
  getHomeworkById
};
