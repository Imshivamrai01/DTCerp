import mongoose from "mongoose";

const academicStructureSchema = new mongoose.Schema(
  {
    wingName: {
      type: String,
      required: true,
      trim: true,
      unique: true, // "Pre-Primary", "Primary", etc.
    },
    classes: [
      {
        className: {
          type: String,
          required: true,
          trim: true, // "Nursery", "Class 1", etc.
        },
        sections: [
          {
            type: String,
            trim: true, // "A", "B", "C"
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

// Prevent redefining the model if it already exists
const AcademicStructure = mongoose.models.AcademicStructure || mongoose.model("AcademicStructure", academicStructureSchema);

export default AcademicStructure;
