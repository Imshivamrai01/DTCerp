const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
    },
    number: {
      type: Number,
    },
    firebaseUid: {
      type: String,
      unique: true,
      sparse: true,
    },
    rfid: {
      type: String,
      unique: true,
      sparse: true,
    },
    avatar: {
      public_id: String,
      secure_url: String,
    },
    role: {
      type: String,
      enum: ["Admin", "Teacher", "Senior Coordinator", "Junior Coordinator","Lab Instructor", "Parent"],
    },
    secondaryRole: {
      type: String,
      enum: ["Teacher", "Senior Coordinator", "Junior Coordinator","Lab Instructor", "Parent"],
    },
    linkedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    class: {
      type: String,
    },
    section: {
      type: String,
    },
 assignedSubjects: {
  type: [
    {
      subject: {
        label: { type: String },
        value: { type: String },
      },
      class: {
        label: { type: String },
        value: { type: String },
      },
      section: {
        label: { type: String },
        value: { type: String },
      },
    }
  ],
  default: [],
},

    isActive: {
      type: Boolean,
      default: true,
    },
    assignedClasses: {
      type: [
        {
          label: { type: String },
          value: { type: String },
          sections: {
            type: [
              {
                label: { type: String },
                value: { type: String },
              },
            ],
            default: [],
          },
        },
      ],
    },

    assignedSections: {
      type: [
        {
          label: { type: String },
          value: { type: String },
        },
      ],
    },
    classTeacher: {
      class: {
        type: String,
      },
      section: {
        type: String,
      },
    },
    assignedWings: {
      type: [
        {
          label: { type: String },
          value: { type: String },
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
