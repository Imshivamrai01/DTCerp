const mongoose = require("mongoose");

const copyCheckSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Types.ObjectId,
      ref: "Student",
    },
    isCopyChecked: {
      type: Boolean,
      default: false,
    },
       checkedByTeacher: {
      type: String, // or mongoose.Types.ObjectId if you want to reference a User model
      default: null,
    },
    checkedByCoordinator: {
      type: String, // or mongoose.Types.ObjectId if you want to reference a User model
      default: null,
    },
    isCoordinatorCopyChecked: {
      type: Boolean,
      default: false,
    },
    subject: {
      type: String,
    },
    date: {
      type: String,
    },
    submitType: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Copy_Check || mongoose.model("Copy_Check", copyCheckSchema);
