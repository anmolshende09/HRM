const mongoose = require("mongoose");

const attendancePolicySchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Policy name is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["standard", "flexible", "strict"],
      default: "standard",
    },
    lateArrivalGrace: {
      type: Number,
      default: 15, // in minutes
    },
    earlyDepartureGrace: {
      type: Number,
      default: 15, // in minutes
    },
    overtimeRate: {
      type: Number,
      default: 1.0, // multiplier
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AttendancePolicy", attendancePolicySchema);
