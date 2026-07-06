const Employee = require("../models/Employee");
const Department = require("../models/Department");
const Attendance = require("../models/Attendance");
const LeaveRequest = require("../models/LeaveRequest");
const Announcement = require("../models/Announcement");
const asyncHandler = require("../utils/asyncHandler");

const startOfDay = (d) => {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
};

// @desc    Aggregated dashboard data: stat cards + widgets in a single call
// @route   GET /api/dashboard
// @access  Private
const getDashboard = asyncHandler(async (req, res) => {
  const today = startOfDay(Date.now());

  const [
    totalEmployees,
    todaysAttendance,
    approvedLeaveToday,
    departmentCounts,
    departments,
    recentLeaves,
    announcements,
  ] = await Promise.all([
    Employee.countDocuments({ status: { $ne: "inactive" } }),
    Attendance.find({ date: today }).populate("employee", "name profilePicture"),
    LeaveRequest.find({
      status: "approved",
      startDate: { $lte: today },
      endDate: { $gte: today },
    }).populate("employee", "name profilePicture"),
    Employee.aggregate([{ $group: { _id: "$department", count: { $sum: 1 } } }]),
    Department.find().lean(),
    LeaveRequest.find().sort({ createdAt: -1 }).limit(5).populate("employee", "name"),
    Announcement.find().sort({ date: -1 }).limit(5),
  ]);

  const presentToday = todaysAttendance.filter((a) => a.status === "present").length;
  const absentToday = todaysAttendance.filter((a) => a.status === "absent").length;

  // "On Leave Today" is the union of two independent facts:
  //  1. an approved LeaveRequest whose date range covers today, and
  //  2. today's Attendance record explicitly marked as `on_leave`.
  // These are deliberately separate signals in the schema (an employee can be
  // marked on_leave for a day without ever filing a formal request, or have an
  // approved request without anyone marking attendance yet) — `absent` is
  // intentionally NOT included here, since an absence isn't the same fact as
  // being on leave. We dedupe by employee so someone covered by both shows once,
  // preferring the leave request's leaveType when both exist.
  const attendanceOnLeave = todaysAttendance.filter((a) => a.status === "on_leave" && a.employee);

  const onLeaveMap = new Map();
  approvedLeaveToday.forEach((leave) => {
    if (!leave.employee) return;
    onLeaveMap.set(leave.employee._id.toString(), {
      _id: leave._id,
      employee: leave.employee,
      leaveType: leave.leaveType,
      source: "leave_request",
    });
  });
  attendanceOnLeave.forEach((att) => {
    const key = att.employee._id.toString();
    if (!onLeaveMap.has(key)) {
      onLeaveMap.set(key, {
        _id: att._id,
        employee: att.employee,
        leaveType: null,
        source: "attendance",
      });
    }
  });
  const employeesOnLeave = Array.from(onLeaveMap.values());

  const deptMap = departments.reduce((acc, d) => {
    acc[d._id.toString()] = { name: d.name, count: 0 };
    return acc;
  }, {});
  departmentCounts.forEach((c) => {
    const key = c._id ? c._id.toString() : null;
    if (key && deptMap[key]) deptMap[key].count = c.count;
  });

  res.json({
    success: true,
    data: {
      cards: {
        totalEmployees,
        presentToday,
        absentToday,
        onLeaveToday: employeesOnLeave.length,
      },
      departmentDistribution: Object.values(deptMap),
      employeesOnLeave,
      recentLeaveRequests: recentLeaves,
      announcements,
    },
  });
});

module.exports = { getDashboard };
