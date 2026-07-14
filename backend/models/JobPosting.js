const mongoose = require("mongoose");

const jobPostingSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    jobCode: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobCategory",
    },
    type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobType",
    },
    location: {
      type: String,
      trim: true,
    },
    salaryRange: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    deadline: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "draft", "published"],
      default: "published",
    },
    applicationsCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("JobPosting", jobPostingSchema);
