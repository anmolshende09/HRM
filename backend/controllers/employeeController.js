const Employee = require("../models/Employee");
const Department = require("../models/Department");
const { getCompanyId } = require("./branchController");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Create an employee
// @route   POST /api/employees
// @access  Private (admin, hr_manager)
const createEmployee = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const payload = { ...req.body, company: companyId };
  if (req.file) {
    payload.profilePicture = `/uploads/employees/${req.file.filename}`;
  }
  const employee = await Employee.create(payload);
  const populated = await employee.populate([
    { path: "department", select: "name" },
    { path: "branch", select: "name" },
    { path: "designation", select: "name description grade" },
    { path: "reportingManager", select: "name email" }
  ]);
  res.status(201).json({ success: true, data: populated });
});

// @desc    Get employees with search + pagination + advanced filters
// @route   GET /api/employees
// @access  Private
const getEmployees = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const { search, department, branch, designation, status, page = 1, limit = 10 } = req.query;

  const query = { company: companyId };
  
  if (search) {
    // If text index search fails or is empty, we fall back to regex
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { employeeId: { $regex: search, $options: "i" } },
    ];
  }
  if (department) query.department = department;
  if (branch) query.branch = branch;
  if (designation) query.designation = designation;
  if (status) query.status = status;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (pageNum - 1) * limitNum;

  const [employees, total] = await Promise.all([
    Employee.find(query)
      .populate("department", "name")
      .populate("branch", "name")
      .populate("designation", "name description grade")
      .populate("reportingManager", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Employee.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: employees,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

// @desc    Get a single employee
// @route   GET /api/employees/:id
// @access  Private
const getEmployee = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const employee = await Employee.findOne({ _id: req.params.id, company: companyId })
    .populate("department", "name")
    .populate("branch", "name")
    .populate("designation", "name description grade")
    .populate("reportingManager", "name email");

  if (!employee) {
    return res.status(404).json({ success: false, message: "Employee not found" });
  }
  res.json({ success: true, data: employee });
});

// @desc    Update an employee
// @route   PUT /api/employees/:id
// @access  Private (admin, hr_manager)
const updateEmployee = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const payload = { ...req.body };
  if (req.file) {
    payload.profilePicture = `/uploads/employees/${req.file.filename}`;
  }

  const employee = await Employee.findOneAndUpdate(
    { _id: req.params.id, company: companyId },
    payload,
    { new: true, runValidators: true }
  )
    .populate("department", "name")
    .populate("branch", "name")
    .populate("designation", "name description grade")
    .populate("reportingManager", "name email");

  if (!employee) {
    return res.status(404).json({ success: false, message: "Employee not found" });
  }
  res.json({ success: true, data: employee });
});

// @desc    Delete an employee
// @route   DELETE /api/employees/:id
// @access  Private (admin)
const deleteEmployee = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const employee = await Employee.findOneAndDelete({ _id: req.params.id, company: companyId });
  if (!employee) {
    return res.status(404).json({ success: false, message: "Employee not found" });
  }
  res.json({ success: true, message: "Employee deleted" });
});

module.exports = {
  createEmployee,
  getEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
};
