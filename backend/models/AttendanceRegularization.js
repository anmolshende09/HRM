const mongoose = require("mongoose");

const attendanceRegularizationSchema = new mongoose.Schema(
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
    originalClockIn: {
      type: Date,
      default: null,
    },
    originalClockOut: {
      type: Date,
      default: null,
    },
    requestedClockIn: {
      type: Date,
      required: [true, "Requested clock-in is required"],
    },
    requestedClockOut: {
      type: Date,
      required: [true, "Requested clock-out is required"],
    },
    reason: {
      type: String,
      required: [true, "Reason is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    requestDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AttendanceRegularization", attendanceRegularizationSchema);
