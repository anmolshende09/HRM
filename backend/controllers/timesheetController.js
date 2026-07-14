const Timesheet = require("../models/Timesheet");
const Employee = require("../models/Employee");
const { getCompanyId } = require("./branchController");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Get all timesheets
// @route   GET /api/timesheets
const getTimesheets = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const { search, employee, status, project, startDate, endDate, page = 1, limit = 10 } = req.query;

  const query = { company: companyId };

  if (employee) {
    query.employee = employee;
  }

  if (status) {
    query.approvalStatus = status;
  }

  if (project) {
    query.projectName = { $regex: project, $options: "i" };
  }

  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  // If normal employee, only allow viewing their own timesheet
  if (req.user.role === "employee" && req.user.employee) {
    query.employee = req.user.employee;
  }

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (pageNum - 1) * limitNum;

  // Let's implement search by employee name if search is provided
  if (search) {
    const matchingEmployees = await Employee.find({
      company: companyId,
      name: { $regex: search, $options: "i" },
    }).select("_id");
    
    const empIds = matchingEmployees.map((e) => e._id);
    
    query.$or = [
      { employee: { $in: empIds } },
      { projectName: { $regex: search, $options: "i" } }
    ];
  }

  const [timesheets, total] = await Promise.all([
    Timesheet.find(query)
      .populate("employee", "name email profilePicture")
      .skip(skip)
      .limit(limitNum)
      .sort({ date: -1 }),
    Timesheet.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: timesheets,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

// @desc    Get a single timesheet
// @route   GET /api/timesheets/:id
const getTimesheet = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const timesheet = await Timesheet.findOne({ _id: req.params.id, company: companyId }).populate("employee", "name email");
  if (!timesheet) {
    return res.status(404).json({ success: false, message: "Timesheet not found" });
  }
  res.json({ success: true, data: timesheet });
});

// @desc    Create a timesheet
// @route   POST /api/timesheets
const createTimesheet = asyncHandler(async (req, res) => {
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
    approvalStatus: req.user.role === "employee" ? "pending" : req.body.approvalStatus || "pending"
  };

  const timesheet = await Timesheet.create(payload);
  const populated = await timesheet.populate("employee", "name email");
  res.status(201).json({ success: true, data: populated });
});

// @desc    Update a timesheet
// @route   PUT /api/timesheets/:id
const updateTimesheet = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const timesheet = await Timesheet.findOne({ _id: req.params.id, company: companyId });

  if (!timesheet) {
    return res.status(404).json({ success: false, message: "Timesheet not found" });
  }

  // Prevent employees from editing approved/rejected timesheets or editing other's timesheets
  if (req.user.role === "employee") {
    if (timesheet.employee.toString() !== req.user.employee?.toString()) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    if (timesheet.approvalStatus !== "pending") {
      return res.status(400).json({ success: false, message: "Cannot edit reviewed timesheet" });
    }
    delete req.body.approvalStatus; // cannot override approval
  }

  Object.assign(timesheet, req.body);
  await timesheet.save();
  const populated = await timesheet.populate("employee", "name email");

  res.json({ success: true, data: populated });
});

// @desc    Approve/Reject a timesheet
// @route   PUT /api/timesheets/:id/review
const reviewTimesheet = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const { status } = req.body; // approved or rejected

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }

  const timesheet = await Timesheet.findOneAndUpdate(
    { _id: req.params.id, company: companyId },
    { approvalStatus: status },
    { new: true }
  ).populate("employee", "name email");

  if (!timesheet) {
    return res.status(404).json({ success: false, message: "Timesheet not found" });
  }

  res.json({ success: true, data: timesheet });
});

// @desc    Delete a timesheet
// @route   DELETE /api/timesheets/:id
const deleteTimesheet = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const query = { _id: req.params.id, company: companyId };

  if (req.user.role === "employee") {
    query.employee = req.user.employee;
    query.approvalStatus = "pending"; // employee can only delete pending
  }

  const timesheet = await Timesheet.findOneAndDelete(query);
  if (!timesheet) {
    return res.status(404).json({ success: false, message: "Timesheet not found or cannot be deleted" });
  }

  res.json({ success: true, message: "Timesheet deleted successfully" });
});

// @desc    Export timesheets as CSV
// @route   GET /api/timesheets/export
const exportTimesheets = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const timesheets = await Timesheet.find({ company: companyId }).populate("employee", "name email");

  let csvContent = "Employee Name,Email,Date,Hours Worked,Project,Status,Submitted On\n";
  timesheets.forEach((t) => {
    const formattedDate = new Date(t.date).toLocaleDateString();
    const formattedSub = new Date(t.submissionDate).toLocaleDateString();
    csvContent += `"${t.employee?.name || ''}","${t.employee?.email || ''}","${formattedDate}",${t.workingHours},"${t.projectName}","${t.approvalStatus}","${formattedSub}"\n`;
  });

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=timesheets.csv");
  res.send(csvContent);
});

// @desc    Import timesheets via CSV upload
// @route   POST /api/timesheets/import
const importTimesheets = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const { data } = req.body; // array of timesheet objects

  if (!Array.isArray(data)) {
    return res.status(400).json({ success: false, message: "Invalid payload, must be an array" });
  }

  const imported = [];
  for (const row of data) {
    // Find employee by email or employee ID
    let employee;
    if (row.email) {
      employee = await Employee.findOne({ email: row.email.toLowerCase(), company: companyId });
    }
    if (!employee && row.employeeId) {
      employee = await Employee.findOne({ employeeId: row.employeeId, company: companyId });
    }

    if (!employee) continue; // skip row if employee not found

    const timesheet = await Timesheet.create({
      company: companyId,
      employee: employee._id,
      date: new Date(row.date || Date.now()),
      workingHours: parseFloat(row.workingHours) || 8.0,
      projectName: row.projectName || "Project Work",
      approvalStatus: row.approvalStatus || "pending",
    });

    imported.push(timesheet);
  }

  res.json({ success: true, count: imported.length, data: imported });
});

module.exports = {
  getTimesheets,
  getTimesheet,
  createTimesheet,
  updateTimesheet,
  reviewTimesheet,
  deleteTimesheet,
  exportTimesheets,
  importTimesheets,
};
