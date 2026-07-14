const AttendanceRegularization = require("../models/AttendanceRegularization");
const Attendance = require("../models/Attendance");
const { getCompanyId } = require("./branchController");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Get regularization requests
// @route   GET /api/regularizations
const getRegularizations = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const { status, employee } = req.query;

  const query = { company: companyId };
  if (status) query.status = status;

  if (req.user.role === "employee" && req.user.employee) {
    query.employee = req.user.employee;
  } else if (employee) {
    query.employee = employee;
  }

  const list = await AttendanceRegularization.find(query)
    .populate("employee", "name email employeeId")
    .sort({ createdAt: -1 });

  res.json({ success: true, data: list });
});

// @desc    Request a regularization
// @route   POST /api/regularizations
const createRegularization = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  
  let employeeId = req.body.employee;
  if (req.user.role === "employee") {
    employeeId = req.user.employee;
  }

  if (!employeeId) {
    return res.status(400).json({ success: false, message: "Employee reference is required" });
  }

  const payload = {
    ...req.body,
    employee: employeeId,
    company: companyId,
    status: "pending",
  };

  const reqObj = await AttendanceRegularization.create(payload);
  res.status(201).json({ success: true, data: reqObj });
});

// @desc    Review regularization request
// @route   PUT /api/regularizations/:id/review
const reviewRegularization = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const { status } = req.body; // approved or rejected

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }

  const reqObj = await AttendanceRegularization.findOne({ _id: req.params.id, company: companyId });
  if (!reqObj) {
    return res.status(404).json({ success: false, message: "Request not found" });
  }

  reqObj.status = status;
  await reqObj.save();

  // If approved, update or create Attendance record
  if (status === "approved") {
    // We update attendance for that employee and date
    // Note that standard attendance status might be marked "present" when regularized
    await Attendance.findOneAndUpdate(
      { employee: reqObj.employee, date: reqObj.date },
      {
        company: companyId,
        employee: reqObj.employee,
        date: reqObj.date,
        status: "present", // Regularized translates to present
        markedBy: req.user._id,
        remarks: `Regularized from punches: ${reqObj.requestedClockIn.toLocaleTimeString()} - ${reqObj.requestedClockOut.toLocaleTimeString()}`,
      },
      { upsert: true, new: true }
    );
  }

  res.json({ success: true, data: reqObj });
});

// @desc    Delete regularization request
// @route   DELETE /api/regularizations/:id
const deleteRegularization = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const query = { _id: req.params.id, company: companyId };

  if (req.user.role === "employee") {
    query.employee = req.user.employee;
    query.status = "pending";
  }

  const reqObj = await AttendanceRegularization.findOneAndDelete(query);
  if (!reqObj) {
    return res.status(404).json({ success: false, message: "Request not found or cannot be deleted" });
  }

  res.json({ success: true, message: "Request deleted successfully" });
});

module.exports = {
  getRegularizations,
  createRegularization,
  reviewRegularization,
  deleteRegularization,
};
