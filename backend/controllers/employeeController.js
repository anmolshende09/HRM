const Employee = require("../models/Employee");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Create an employee
// @route   POST /api/employees
// @access  Private (admin, hr_manager)
const createEmployee = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (req.file) {
    payload.profilePicture = `/uploads/employees/${req.file.filename}`;
  }
  const employee = await Employee.create(payload);
  const populated = await employee.populate("department", "name");
  res.status(201).json({ success: true, data: populated });
});

// @desc    Get employees with search + pagination
// @route   GET /api/employees?search=&department=&status=&page=&limit=
// @access  Private
const getEmployees = asyncHandler(async (req, res) => {
  const { search, department, status, page = 1, limit = 10 } = req.query;

  const query = {};
  if (search) {
    query.$text = { $search: search };
  }
  if (department) query.department = department;
  if (status) query.status = status;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (pageNum - 1) * limitNum;

  const [employees, total] = await Promise.all([
    Employee.find(query)
      .populate("department", "name")
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
  const employee = await Employee.findById(req.params.id).populate("department", "name");
  if (!employee) {
    return res.status(404).json({ success: false, message: "Employee not found" });
  }
  res.json({ success: true, data: employee });
});

// @desc    Update an employee
// @route   PUT /api/employees/:id
// @access  Private (admin, hr_manager)
const updateEmployee = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (req.file) {
    payload.profilePicture = `/uploads/employees/${req.file.filename}`;
  }

  const employee = await Employee.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
  }).populate("department", "name");

  if (!employee) {
    return res.status(404).json({ success: false, message: "Employee not found" });
  }
  res.json({ success: true, data: employee });
});

// @desc    Delete an employee
// @route   DELETE /api/employees/:id
// @access  Private (admin)
const deleteEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findByIdAndDelete(req.params.id);
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
