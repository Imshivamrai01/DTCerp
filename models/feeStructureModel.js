const mongoose = require("mongoose");

const feeStructureSchema = new mongoose.Schema(
  {
    class: {
      type: String,
    },
    category: {
      type: String,
    },
    route: {
      type: String,
    },
    feeObj: {
      type: [
        {
          feesName: {
            type: String,
          },
          frequency: {
            type: String,
          },
          months: {
            type: String,
          },
          feesValue: {
            type: String,
          },
          count: {
            type: String,
          },
          totalFees: {
            type: String,
          },
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Fee_Structure || mongoose.model("Fee_Structure", feeStructureSchema);
