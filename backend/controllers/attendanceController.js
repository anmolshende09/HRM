const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");
const asyncHandler = require("../utils/asyncHandler");

const startOfDay = (d) => {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
};

// @desc    Mark attendance for an employee on a given date (present/absent/etc.)
//          Upserts so re-marking the same day updates the existing record.
// @route   POST /api/attendance
// @access  Private (admin, hr_manager); employees may mark their own if enabled
const markAttendance = asyncHandler(async (req, res) => {
  const { employee, date, status, remarks } = req.body;
  const day = startOfDay(date || Date.now());

  const record = await Attendance.findOneAndUpdate(
    { employee, date: day },
    { employee, date: day, status, remarks, markedBy: req.user._id },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  res.status(201).json({ success: true, data: record });
});

// @desc    Get attendance history for an employee (or the logged-in employee)
// @route   GET /api/attendance/history/:employeeId?from=&to=
// @access  Private
const getHistory = asyncHandler(async (req, res) => {
  const { employeeId } = req.params;
  const { from, to } = req.query;

  const query = { employee: employeeId };
  if (from || to) {
    query.date = {};
    if (from) query.date.$gte = startOfDay(from);
    if (to) query.date.$lte = startOfDay(to);
  }

  const records = await Attendance.find(query).sort({ date: -1 });
  res.json({ success: true, count: records.length, data: records });
});

// @desc    Get today's attendance across all employees (dashboard summary)
// @route   GET /api/attendance/today
// @access  Private (admin, hr_manager)
const getToday = asyncHandler(async (req, res) => {
  const today = startOfDay(Date.now());
  const totalEmployees = await Employee.countDocuments({ status: { $ne: "inactive" } });

  const records = await Attendance.find({ date: today }).populate("employee", "name employeeId department");

  const present = records.filter((r) => r.status === "present").length;
  const absent = records.filter((r) => r.status === "absent").length;
  const onLeave = records.filter((r) => r.status === "on_leave").length;

  res.json({
    success: true,
    data: {
      date: today,
      totalEmployees,
      present,
      absent,
      onLeave,
      unmarked: Math.max(totalEmployees - records.length, 0),
      records,
    },
  });
});

// @desc    Get attendance percentage for an employee over a date range
// @route   GET /api/attendance/percentage/:employeeId?from=&to=
// @access  Private
const getPercentage = asyncHandler(async (req, res) => {
  const { employeeId } = req.params;
  const { from, to } = req.query;

  const query = { employee: employeeId };
  if (from || to) {
    query.date = {};
    if (from) query.date.$gte = startOfDay(from);
    if (to) query.date.$lte = startOfDay(to);
  }

  const records = await Attendance.find(query);
  const total = records.length;
  const presentCount = records.filter((r) => r.status === "present").length;
  const percentage = total > 0 ? Math.round((presentCount / total) * 10000) / 100 : 0;

  res.json({ success: true, data: { totalDays: total, presentDays: presentCount, percentage } });
});

module.exports = { markAttendance, getHistory, getToday, getPercentage };
