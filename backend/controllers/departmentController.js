const Department = require("../models/Department");
const Employee = require("../models/Employee");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Create a department
// @route   POST /api/departments
// @access  Private (admin, hr_manager)
const createDepartment = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const department = await Department.create({ name, description });
  res.status(201).json({ success: true, data: department });
});

// @desc    Get all departments, with live employee counts
// @route   GET /api/departments
// @access  Private
const getDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find().sort({ name: 1 }).lean();

  const counts = await Employee.aggregate([
    { $group: { _id: "$department", count: { $sum: 1 } } },
  ]);
  const countMap = counts.reduce((acc, c) => {
    acc[c._id.toString()] = c.count;
    return acc;
  }, {});

  const withCounts = departments.map((d) => ({
    ...d,
    employeeCount: countMap[d._id.toString()] || 0,
  }));

  res.json({ success: true, count: withCounts.length, data: withCounts });
});

// @desc    Get a single department
// @route   GET /api/departments/:id
// @access  Private
const getDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id);
  if (!department) {
    return res.status(404).json({ success: false, message: "Department not found" });
  }
  const employeeCount = await Employee.countDocuments({ department: department._id });
  res.json({ success: true, data: { ...department.toObject(), employeeCount } });
});

// @desc    Update a department
// @route   PUT /api/departments/:id
// @access  Private (admin, hr_manager)
const updateDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name, description: req.body.description },
    { new: true, runValidators: true }
  );
  if (!department) {
    return res.status(404).json({ success: false, message: "Department not found" });
  }
  res.json({ success: true, data: department });
});

// @desc    Delete a department (blocked if employees still reference it)
// @route   DELETE /api/departments/:id
// @access  Private (admin)
const deleteDepartment = asyncHandler(async (req, res) => {
  const inUse = await Employee.countDocuments({ department: req.params.id });
  if (inUse > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete department: ${inUse} employee(s) are still assigned to it`,
    });
  }

  const department = await Department.findByIdAndDelete(req.params.id);
  if (!department) {
    return res.status(404).json({ success: false, message: "Department not found" });
  }
  res.json({ success: true, message: "Department deleted" });
});

module.exports = {
  createDepartment,
  getDepartments,
  getDepartment,
  updateDepartment,
  deleteDepartment,
};
