const asyncHandler = require("express-async-handler");
const cloudinary = require("cloudinary").v2;

const Student = require("../models/studentModel");
const GraduatedStudent = require("../models/graduatedStudentModel");
const CopyCheck = require("../models/copyCheckModel");

// Register Student
const registerStudent = asyncHandler(async (req, res) => {
  let data = req.body;

  if (!data.name) {
    return res
      .status(400)
      .json({ message: "Please provide the student name!", success: false });
  }
  if (!data.rollNumber) {
    return res.status(404).json({
      message: "Please provide the student roll number!",
      success: false,
    });
  }

  const rollNumber = data.rollNumber;
  const studentSection = data.studentSection;
  const admissionNumber = data.admissionNo;

  const studentExists = await Student.findOne({
    rollNumber,
    studentSection,
    admissionNumber,
  });

  if (
    studentExists &&
    studentExists.rollNumber == data.rollNumber &&
    studentExists.studentSection == data.studentSection &&
    studentExists.admissionNo == data.admissionNo
  ) {
    return res
      .status(409)
      .json({ message: "Student Already Exists!", success: false });
  }

  if (req.files !== null && req.files !== undefined) {
    console.log("file");

    const uploadedImages = {};

    const uploadImageToCloudinary = async (fieldName, currentImagePublicId) => {
      if (req.files[fieldName]) {
        if (currentImagePublicId) {
          await cloudinary.uploader.destroy(currentImagePublicId);
        }

        const uploadResponse = await cloudinary.uploader.upload(
          req.files[fieldName].tempFilePath,
          { folder: "D2C-Portal" }
        );
        return {
          public_id: uploadResponse.public_id,
          secure_url: uploadResponse.secure_url,
        };
      }
      // If no new image is provided, return null
      return null;
    };

    // Upload and update the 'studentAvatar' image if found
    const studentAvatar = await uploadImageToCloudinary(
      "studentAvatar",
      data?.studentAvatar?.public_id
    );
    if (studentAvatar) {
      uploadedImages.studentAvatar = studentAvatar;
    }
    // Upload and update the 'fatherPhoto' image if found
    const fatherPhoto = await uploadImageToCloudinary(
      "fatherPhoto",
      data?.fatherPhoto?.public_id
    );
    if (fatherPhoto) {
      uploadedImages.fatherPhoto = fatherPhoto;
    }

    // Upload and update the 'motherPhoto' image if found
    const motherPhoto = await uploadImageToCloudinary(
      "motherPhoto",
      data?.motherPhoto?.public_id
    );
    if (motherPhoto) {
      uploadedImages.motherPhoto = motherPhoto;
    }

    // Update the data with the uploaded images
    data = {
      ...data,
      ...uploadedImages,
    };
  } else {
    // If no new image is provided, use the existing data
    data = req.body;
  }

  const student = await Student.create(data);

  if (!student) {
    return res
      .status(400)
      .json({ message: "Erorr while creating student!", success: false });
  }

  // await CopyCheck.create({
  //   studentId: student._id,
  //   isCopyChecked: false,
  //   subject: "N/S",
  //   date: student.createdAt,
  // });

  res.status(201).json({ data: student, success: true });
});

// Login Student
// const loginStudent = asyncHandler(async (req, res) => {
//   const { email, password } = req?.body;

//   if (!email) {
//     res.status(400);
//     throw new Error("Please provide the email field!");
//   }
//   if (!password) {
//     res.status(400);
//     throw new Error("Please provide the password field!");
//   }

//   const Student = await Student.findOne({ email });

//   if (!Student) {
//     res.status(400);
//     throw new Error("Student Not Found!");
//   }

//   if (Student.email !== email) {
//     res.status(400);
//     throw new Error("Incorrect Email!");
//   }

//   if (Student.password !== password) {
//     res.status(400);
//     throw new Error("Incorrect Password!");
//   }

//   if (Student.isActive === false) {
//     res.status(400);
//     throw new Error("You don't have permission to login please contact Admin.");
//   }

//   if (Student && Student.email == email && Student.password == password) {
//     res.status(200).json({
//       _id: Student._id,
//       email: Student.email,
//       name: Student.name,
//       avatar: Student.avatar || null,
//       number: Student.number,
//       role: Student.role,
//       class: Student.class || null,
//       division: Student.division || null,
//       isActive: Student.isActive,
//       success: true,
//     });
//   } else {
//     res.status(401);
//     throw new Error("Invalid credentials");
//   }
// });

const getSingleStudent = asyncHandler(async (req, res) => {
  const id = req?.params?.id;

  const student = await Student.findOne({
    _id: id,
    isDeleted: { $ne: true },
  }).select("-password");

  if (!student) {
    res.status(404).json({ success: false, message: "Student Not Found!" });
  }

  res.status(200).json({ data: student, success: true });
});

const listAllStudents = asyncHandler(async (req, res) => {
  const page = parseInt(req?.query?.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  const students = await Student.find({ isDeleted: { $ne: true } })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select("-password");

  if (!students || students.length === 0) {
    res.status(404);
    throw new Error("Students not found!");
  }

  const count = await Student.countDocuments({ isDeleted: { $ne: true } });

  res.status(200).json({ data: students, count, success: true });
});

// Update Student
const updateStudent = asyncHandler(async (req, res) => {
  const id = req.params.id;

  if (!id) {
    res.status(404);
    throw new Error("Please provide the Student id.");
  }

  const studentExists = await Student.findById(id);

  if (!studentExists) {
    res.status(404);
    throw new Error("Student not exists!");
  }

  let data = req.body;

  if (req.files !== null && req.files !== undefined) {
    const uploadedImages = {};

    const uploadImageToCloudinary = async (fieldName, currentImagePublicId) => {
      if (req.files[fieldName]) {
        if (currentImagePublicId) {
          await cloudinary.uploader.destroy(currentImagePublicId);
        }

        const uploadResponse = await cloudinary.uploader.upload(
          req.files[fieldName].tempFilePath,
          { folder: "D2C-Portal" }
        );
        return {
          public_id: uploadResponse.public_id,
          secure_url: uploadResponse.secure_url,
        };
      }
      return null;
    };

    const studentAvatar = await uploadImageToCloudinary(
      "studentAvatar",
      data?.studentAvatar?.public_id
    );
    if (studentAvatar) uploadedImages.studentAvatar = studentAvatar;

    const fatherPhoto = await uploadImageToCloudinary(
      "fatherPhoto",
      data?.fatherPhoto?.public_id
    );
    if (fatherPhoto) uploadedImages.fatherPhoto = fatherPhoto;

    const motherPhoto = await uploadImageToCloudinary(
      "motherPhoto",
      data?.motherPhoto?.public_id
    );
    if (motherPhoto) uploadedImages.motherPhoto = motherPhoto;

    data = {
      ...data,
      ...uploadedImages,
    };
  } else {
    data = req.body;
  }

  const updatedStudent = await Student.findByIdAndUpdate(id, data, {
    new: true,
  });

  if (!updatedStudent) {
    res.status(400);
    throw new Error("Error while updating student!");
  }

  // ✅ Rearrange roll numbers after marking deleted
  // if (data.isDeleted) {
  //   const activeStudents = await Student.find({
  //     studentClass: updatedStudent.studentClass,
  //     studentSection: updatedStudent.studentSection,
  //     isDeleted: false,
  //   }).sort('rollNumber'); // Sorted ensures existing order

  //   let newRoll = 1;
  //   for (const student of activeStudents) {
  //     if (student.rollNumber !== newRoll) {
  //       student.rollNumber = newRoll;
  //       await student.save();
  //     }
  //     newRoll++;
  //   }
  // }

  res.status(200).json({ data: updatedStudent, success: true });
});

const deleteStudent = asyncHandler(async (req, res) => {
  const id = req.params.id;

  if (!id) {
    res.status(404);
    throw new Errpr("Please provide the student id.");
  }

  const studentExists = await Student.findById(id);

  if (!studentExists) {
    res.status(404);
    throw new Error("Student not exists!");
  }

  await Student.deleteOne({ _id: id });

  res.status(200).json({ success: true });
});

const filterStudents = asyncHandler(async (req, res) => {
  const page = parseInt(req?.query?.page) || 1;
  const limit = 15;
  const skip = (page - 1) * limit;

  const studentClass = req.query.studentClass;
  const studentSection = req.query.studentSection;

  let query = { isDeleted: { $ne: true } };

  if (studentClass === "all" && studentSection !== "all") {
    query.studentSection = studentSection;
  } else if (studentClass !== "all" && studentSection === "all") {
    query.studentClass = studentClass;
  } else if (studentClass !== "all" && studentSection !== "all") {
    query.studentClass = studentClass;
    query.studentSection = studentSection;
  }
  // When both are "all", query remains { isDeleted: { $ne: true } }
  
  const students = await Student.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ name: 1 });

  const count = await Student.countDocuments(query);

  if (!students || students.length === 0) {
    return res
      .status(404)
      .json({ message: "No Students Found!", success: false });
  }

  res.status(200).json({ data: students, count: count, success: true });
});

const filterStudentsByClasses = asyncHandler(async (req, res) => {
  const studentClass = req.query.studentClass;
  const studentSection = req.query.studentSection;

  let query = { isDeleted: { $ne: true }, isActive: true };
  let sections = [];

  // Step 1: Build query
  if (studentClass && studentClass !== "all") {
    query.studentClass = studentClass;
    sections = await Student.distinct("studentSection", { studentClass });
  } else {
    sections = await Student.distinct("studentSection");
  }

  if (studentSection && studentSection !== "all") {
    query.studentSection = studentSection;
  }

  // Step 2: Fetch students
  const students = await Student.find(query).sort({ name: 1 });

  const count = students.length;

  if (!students || students.length === 0) {
    return res
      .status(400)
      .json({ message: "No Students Found!", success: false });
  }

  res.status(200).json({
    data: students,
    count: count,
    sections: sections,
    success: true,
  });
});

const filterAllStudent = asyncHandler(async (req, res) => {
  const studentClass = req.query.studentClass;

  let query = { isDeleted: { $ne: true }, isActive: true };

  // Step 1: Build query
  if (studentClass && studentClass !== "all") {
    query.studentClass = studentClass;
  }

  // Step 2: Fetch students
  const students = await Student.find(query).sort({ name: 1 });
  const count = students.length;

  if (!students || students.length === 0) {
    return res
      .status(400)
      .json({ message: "No Students Found!", success: false });
  }

  res.status(200).json({
    data: students,
    count: count,
    success: true,
  });
});

const filterStudentsByClass = asyncHandler(async (req, res) => {
  const page = parseInt(req?.query?.page) || 1;
  const limit = 15;
  const skip = (page - 1) * limit;

  const studentClass = req.query.studentClass;
  const studentSection = req.query.studentSection;

  let query = { isDeleted: { $ne: true } };
  let sections = [];

  // Step 1: Build query
  if (studentClass && studentClass !== "all") {
    query.studentClass = studentClass;
    sections = await Student.distinct("studentSection", { studentClass });
  } else {
    sections = await Student.distinct("studentSection");
  }

  if (studentSection && studentSection !== "all") {
    query.studentSection = studentSection;
  }

  // Step 2: Fetch students
  const students = await Student.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ name: 1 });

  const count = await Student.countDocuments(query);

  if (!students || students.length === 0) {
    return res
      .status(400)
      .json({ message: "No Students Found!", success: false });
  }

  res.status(200).json({
    data: students,
    count: count,
    sections: sections,
    success: true,
  });
});
// Get last roll number
const lastRollNumber = asyncHandler(async (req, res) => {
  const selectedClass = req.query.selectedClass;
  const section = req.query.section;

  const student = await Student.findOne({
    studentClass: selectedClass,
    studentSection: section,
    isDeleted: { $ne: true },
  }).sort({ _id: -1 });

  if (!student) {
    return res
      .status(404)
      .json({ message: "No Student Found!", success: false });
  }

  res.status(200).json({ data: student.rollNumber, success: true });
});

// Get last admission number
const lastAdmissionNumber = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ isDeleted: { $ne: true } }).sort({
    _id: -1,
  });

  if (!student) {
    return res
      .status(404)
      .json({ message: "No Student Found!", success: false });
  }

  res.status(200).json({ data: student.admissionNo, success: true });
});

// Saerch
const searchStudents = asyncHandler(async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res
      .status(400)
      .json({ message: "Please enter a query", success: false });
  }

  const regexQuery = new RegExp(query, "i");

  const users = await Student.find({
    isDeleted: { $ne: true },
    isActive: { $ne: false },
    $or: [
      { name: { $regex: regexQuery } },
      { contactNumber: { $regex: regexQuery } },
      { rollNumber: { $regex: regexQuery } },
      { admissionNo: { $regex: regexQuery } },
      { fathersName: { $regex: regexQuery } },
      { mothersName: { $regex: regexQuery } },
      { fathersNo: { $regex: regexQuery } },
      { mothersNo: { $regex: regexQuery } },
      { dob: { $regex: regexQuery } },
    ],
  });

  if (!users || users.length === 0) {
    return res
      .status(404)
      .json({ message: "No students found!", success: false });
  }

  res.status(200).json({ data: users, success: true });
});

const fetchStudentsData = asyncHandler(async (req, res) => {
  const studentClass = req.query.studentClass;
  const studentSection = req.query.studentSection;

  let query = {
    studentClass: studentClass,
    studentSection: studentSection,
    isDeleted: { $ne: true },
  };

  const students = await Student.find(query).sort({ name: 1 });
  const count = students.length;

  if (!students || students.length === 0) {
    return res
      .status(400)
      .json({ message: "No Students Found!", success: false });
  }

  const transformedData = students.map((student) => {
    return {
      name: student.name,
      fatherName: student.fathersName,
      admissionNo: student.admissionNo,
      admissionDate: student.admissionDate,
      dob: student.dob,
      gender: student.gender,
    };
  });

  res.status(200).json({ data: transformedData, count: count, success: true });
});

const upgradeStudentClass = asyncHandler(async (req, res) => {
  const fromClass = req.query.fromClass;
  const toClass = req.query.toClass;
  // Perform aggregation to find documents to be updated
  const students = await Student.aggregate([
    {
      $match: {
        studentClass: fromClass,
        isDeleted: { $ne: true },
      },
    },
    {
      $set: {
        studentClass: toClass,
      },
    },
  ]);

  // Extract the IDs of the updated documents
  const studentIds = students.map((student) => student._id);

  // Update documents in the database
  const result = await Student.updateMany(
    {
      _id: { $in: studentIds },
      isDeleted: { $ne: true },
    },
    { $set: { studentClass: toClass } }
  );
  console.log(result);
  if (result) {
    res.status(200).json({ data: students, result: result, success: true });
  } else {
    res
      .status(500)
      .json({ message: "Failed to upgrade student class", success: false });
  }
});
const updateStudentStatus = async (req, res) => {
  try {
    const { id } = req.params; // Student ID from URL params
    const { isActive } = req.body; // Status field from request body (align with frontend)

    console.log("Received ID:", id); // Debug log
    console.log("Received status:", isActive); // Debug log

    // Validate input
    if (typeof isActive !== "boolean") {
      return res
        .status(400)
        .json({ message: "Status must be a boolean value" });
    }

    // Find student by _id (MongoDB convention)
    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Update status
    student.isActive = isActive; // Update the status field (align with frontend and schema)
    await student.save(); // Persist changes to the database

    // Send success response
    return res.status(200).json({
      success: true, // Match frontend expectation
      data: student, // Return updated student
    });
  } catch (error) {
    console.error("Error updating student status:", error); // Log error for debugging
    return res.status(500).json({ message: "Server error" });
  }
};
const deleteStudents = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const student = await Student.findById(id);
  if (!student) {
    res.status(404);
    throw new Error("Student not found.");
  }

  student.isDeleted = true;
  await student.save();

  // Rearrange roll numbers
  // const students = await Student.find({
  //   studentClass: student.studentClass,
  //   studentSection: student.studentSection,
  //   isDeleted: false,
  // }).sort('rollNumber');

  // let roll = 1;
  // for (const s of students) {
  //   if (s.rollNumber !== roll) {
  //     s.rollNumber = roll;
  //     await s.save();
  //   }
  //   roll++;
  // }

  res
    .status(200)
    .json({ message: "Deleted and roll numbers rearranged successfully." });
});

const arrangeStudentsAlphabetically = asyncHandler(async (req, res) => {
  const { studentClass, studentSection } = req.query;

  if (!studentClass || !studentSection) {
    return res.status(400).json({
      message: "Please provide studentClass and studentSection!",
      success: false,
    });
  }

  // Fetch all students (including deleted ones)
  let students = await Student.find({
    studentClass,
    studentSection,
  });

  if (!students || students.length === 0) {
    return res.status(404).json({
      message: "No students found for this class and section!",
      success: false,
    });
  }

  // Filter out deleted students before sorting and assigning roll numbers
  const activeStudents = students.filter((student) => !student.isDeleted);

  // Sort active students alphabetically by name
  activeStudents.sort((a, b) =>
    a.name.trim().toLowerCase().localeCompare(b.name.trim().toLowerCase())
  );

  // Assign roll numbers only to active (non-deleted) students
  for (let i = 0; i < activeStudents.length; i++) {
    activeStudents[i].rollNumber = (i + 1).toString();
    await activeStudents[i].save();
  }

  res.status(200).json({
    message:
      "Active students arranged alphabetically and roll numbers assigned successfully!",
    data: activeStudents, // return only active and updated students
    success: true,
  });
});

const CLASS_PROMOTION_MAP = {
  Nursery: "L.K.G",
  "L.K.G": "U.K.G",
  "U.K.G": "1",
  "1": "2",
  "2": "3",
  "3": "4",
  "4": "5",
  "5": "6",
  "6": "7",
  "7": "8",
  "8": "9",
  "9": "10",
};

const promoteClass = asyncHandler(async (req, res) => {
  const { studentClass } = req.body;

  if (!studentClass) {
    return res.status(400).json({ success: false, message: "Please provide studentClass" });
  }

  const toClass = CLASS_PROMOTION_MAP[studentClass];

  if (!toClass && studentClass !== "10") {
    return res.status(400).json({ success: false, message: `No promotion path found for class "${studentClass}"` });
  }

  // Class 10 -> move to graduated collection
  if (studentClass === "10") {
    const currentYear = new Date().getFullYear().toString();
    const students = await Student.find({ studentClass: "10", isDeleted: { $ne: true } }).lean();

    if (students.length === 0) {
      return res.status(404).json({ success: false, message: "No Class 10 students found" });
    }

    const graduatedDocs = students.map(({ _id, __v, createdAt, updatedAt, ...rest }) => ({
      ...rest,
      graduatedYear: currentYear,
    }));

    await GraduatedStudent.insertMany(graduatedDocs);
    await Student.deleteMany({ studentClass: "10", isDeleted: { $ne: true } });

    return res.status(200).json({
      success: true,
      message: `${students.length} Class 10 students moved to graduated collection.`,
      count: students.length,
    });
  }

  // All other classes -> update studentClass
  const result = await Student.updateMany(
    { studentClass, isDeleted: { $ne: true } },
    { $set: { studentClass: toClass } }
  );

  res.status(200).json({
    success: true,
    message: `${result.modifiedCount} students promoted from Class ${studentClass} to Class ${toClass}.`,
    count: result.modifiedCount,
  });
});

const listGraduatedStudents = asyncHandler(async (req, res) => {
  const { year } = req.query;
  const query = year ? { graduatedYear: year } : {};
  const students = await GraduatedStudent.find(query).sort({ name: 1 });
  res.status(200).json({ data: students, count: students.length, success: true });
});

// Fetch latest admission number
const getNextAdmissionNumber = asyncHandler(async (req, res) => {
  try {
    // Find all students that have an admissionNo, sort by createdAt descending
    const latestStudent = await Student.findOne({ admissionNo: { $exists: true, $ne: "" } })
      .sort({ createdAt: -1 });

    let nextAdno = "1001"; // Default starting number
    
    if (latestStudent && latestStudent.admissionNo) {
      // Try to parse the numeric part of the latest admission number
      const numericPart = parseInt(latestStudent.admissionNo.replace(/\D/g, ''), 10);
      if (!isNaN(numericPart)) {
        nextAdno = (numericPart + 1).toString();
      }
    }

    res.status(200).json({ data: nextAdno, success: true });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate admission number", success: false });
  }
});

module.exports = {
  registerStudent,
  updateStudentStatus,
  getSingleStudent,
  listAllStudents,
  updateStudent,
  deleteStudent,
  filterStudents,
  lastRollNumber,
  lastAdmissionNumber,
  searchStudents,
  fetchStudentsData,
  upgradeStudentClass,
  filterStudentsByClass,
  filterStudentsByClasses,
  deleteStudents,
  arrangeStudentsAlphabetically,
  filterAllStudent,
  promoteClass,
  listGraduatedStudents,
  getNextAdmissionNumber,
};
