// models/homeworkModel.js
const mongoose = require("mongoose");

const homeworkSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
    },
    className: {
      type: String,
      required: true,
    },
    section: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    teacherName: {
      type: String,
    },
    attachments: [
      {
        public_id: String,
        secure_url: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Homework || mongoose.model("Homework", homeworkSchema);
