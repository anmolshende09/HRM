const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Candidate name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Candidate email is required"],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    jobPosting: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobPosting",
    },
    source: {
      type: String,
      trim: true,
      default: "LinkedIn",
    },
    experience: {
      type: String,
      trim: true,
    },
    expectedSalary: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["applied", "shortlisted", "interviewed", "offered", "hired", "rejected"],
      default: "applied",
    },
    isEmployeeConverted: {
      type: Boolean,
      default: false,
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Candidate", candidateSchema);
