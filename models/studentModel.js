const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    rollNumber: {
      type: String,
      required: true,
    },
    house: {
      type: String,
    },
    contactNumber: {
      type: String,
    },
    admissionNo: {
      type: String,
    },
    aadhaar: {
      type: String,
    },
    gender: {
      type: String,
    },
    religion: {
      type: String,
    },
    address: {
      type: String,
    },
    route: {
      type: String,
    },
    caste: {
      type: String,
    },
    bloodGroup: {
      type: String,
    },
    selectedDocumentation: {
      type: String,
    },
    fathersName: {
      type: String,
    },
    mothersName: {
      type: String,
    },
    fathersNo: {
      type: String,
    },
    mothersNo: {
      type: String,
    },
    fathersOccupation: {
      type: String,
    },
    mothersOccupation: {
      type: String,
    },
    previousSchoolName: {
      type: String,
    },
    previousSchoolAffiliatedWith: {
      type: String,
    },
    registrationNumber: {
      type: String,
    },
    lastExamGiven: {
      type: String,
    },
    lastExamYear: {
      type: String,
    },
    lastExamMarks: {
      type: String,
    },
    lastExamResult: {
      type: String,
    },
    nameOfLocalGuardian: {
      type: String,
    },
    addressOfLocalGuardian: {
      type: String,
    },
    studentSection: {
      type: String,
    },
    cityVillage: {
      type: String,
    },
    fathersQualification: {
      type: String,
    },
    fathersDob: {
      type: String,
    },
    mothersQualification: {
      type: String,
    },
    mothersDob: {
      type: String,
    },
    numberOfLocalGuardian: {
      type: String,
    },
    dob: {
      type: String,
    },
    admissionDate: {
      type: String,
    },
    phoneForSchoolSMS: {
      type: String,
    },
    transportFacility: {
      type: String,
    },
    studentClass: {
      type: String,
    },
    studentAvatar: {
      public_id: String,
      secure_url: String,
    },
    fatherPhoto: {
      public_id: String,
      secure_url: String,
    },
    motherPhoto: {
      public_id: String,
      secure_url: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    feeCategory: { type: String },
    srId: { type: String },
    houseNo: { type: String },
    mohalla: { type: String },
    post: { type: String },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },

  {
    timestamps: true,
  }
);

studentSchema.index({ admissionNo: 1 }, { sparse: true });
studentSchema.index({ srId: 1 }, { sparse: true });

module.exports = mongoose.models.Student || mongoose.model("Student", studentSchema);
