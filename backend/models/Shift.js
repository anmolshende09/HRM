const mongoose = require("mongoose");

const shiftSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Shift name is required"],
      trim: true,
    },
    startTime: {
      type: String,
      required: [true, "Start time is required (HH:MM)"],
    },
    endTime: {
      type: String,
      required: [true, "End time is required (HH:MM)"],
    },
    breakDuration: {
      type: Number,
      default: 60, // in minutes
    },
    workingHours: {
      type: Number,
      default: 8,
    },
    gracePeriod: {
      type: Number,
      default: 15, // in minutes
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shift", shiftSchema);
