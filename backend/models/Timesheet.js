const mongoose = require("mongoose");

const timesheetSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    workingHours: {
      type: Number,
      required: [true, "Working hours are required"],
    },
    projectName: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    submissionDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Timesheet", timesheetSchema);
