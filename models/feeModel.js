const mongoose = require("mongoose");

const feeSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Types.ObjectId,
      ref: "Student",
    },
    session: {
      type: String,
    },
    feeMonth: {
      type: String,
    },
    isFeeDue: {
      type: Boolean,
    },
    dueFee: {
      type: String,
    },
    isLateFee: {
      type: Boolean,
    },
    lateFee: {
      type: String,
    },
    isBalance: {
      type: Boolean,
    },
    balanceDue: {
      type: String,
    },
    balanceMonth: {
      type: String,
    },
    balancePaid: {
      type: String,
    },
    totalFee: {
      type: String,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    isFeeConcc: {
      type: Boolean,
      default: false,
    },
    feeConcc: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Fee || mongoose.model("Fee", feeSchema);
