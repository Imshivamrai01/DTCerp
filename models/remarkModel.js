const mongoose = require("mongoose");

const remarkSchema = new mongoose.Schema(
  {
    remarkBy: {
      type: String,
    },
    remarkById: {
      type: String,
    },
    remarkTo: {
      type: String,
    },
    remarkToId: {
      type: String,
    },
    isChecked: {
      type: Boolean,
      default: false,
    },
    remarkComment: {
      type: String,
    },
    remarkDate: {
      type: String,
    },
    remarkByRole: {
      type: String,
    },
    remarkToRole: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Remark || mongoose.model("Remark", remarkSchema);
