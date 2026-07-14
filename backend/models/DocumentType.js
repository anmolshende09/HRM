const mongoose = require("mongoose");

const documentTypeSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Document type name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    required: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DocumentType", documentTypeSchema);
