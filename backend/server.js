require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorHandler");

// Route modules
const authRoutes = require("./routes/authRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

// New route modules
const branchRoutes = require("./routes/branchRoutes");
const designationRoutes = require("./routes/designationRoutes");
const holidayRoutes = require("./routes/holidayRoutes");
const timesheetRoutes = require("./routes/timesheetRoutes");
const shiftRoutes = require("./routes/shiftRoutes");
const policyRoutes = require("./routes/policyRoutes");
const regularizationRoutes = require("./routes/regularizationRoutes");
const recruitmentRoutes = require("./routes/recruitmentRoutes");
const miscRoutes = require("./routes/miscRoutes");

connectDB();

const app = express();

// Core middleware
app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// Static file serving for uploaded profile pictures
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "HRMS API is running" });
});

// Feature routes
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/dashboard", dashboardRoutes);

// New Feature routes
app.use("/api/branches", branchRoutes);
app.use("/api/designations", designationRoutes);
app.use("/api/holidays", holidayRoutes);
app.use("/api/timesheets", timesheetRoutes);
app.use("/api/shifts", shiftRoutes);
app.use("/api/policies", policyRoutes);
app.use("/api/regularizations", regularizationRoutes);
app.use("/api/recruitment", recruitmentRoutes);
app.use("/api/misc", miscRoutes);

// 404 + error handling (must be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`HRMS API server listening on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
});

module.exports = app;
