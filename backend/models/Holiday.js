const mongoose = require("mongoose");

const holidaySchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Holiday title is required"],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Holiday date is required"],
    },
    category: {
      type: String,
      enum: ["national", "company_specific", "religious"],
      default: "national",
    },
    branches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Holiday", holidaySchema);
