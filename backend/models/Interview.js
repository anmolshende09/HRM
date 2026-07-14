const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
    },
    roundName: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["Technical", "HR", "Managerial", "Panel"],
      default: "Technical",
    },
    dateTime: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      trim: true,
      default: "Zoom Meeting",
    },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },
    feedback: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Interview", interviewSchema);
