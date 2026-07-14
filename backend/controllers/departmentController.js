const Department = require("../models/Department");
const Employee = require("../models/Employee");
const { getCompanyId } = require("./branchController");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Create a department
// @route   POST /api/departments
// @access  Private (admin, hr_manager)
const createDepartment = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const { name, description, branch } = req.body;
  const department = await Department.create({ company: companyId, name, description, branch });
  res.status(201).json({ success: true, data: department });
});

// @desc    Get all departments, with live employee counts, search, and pagination
// @route   GET /api/departments
// @access  Private
const getDepartments = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const { search, branch, page, limit } = req.query;

  const query = { company: companyId };
  if (search) {
    query.name = { $regex: search, $options: "i" };
  }
  if (branch) {
    query.branch = branch;
  }

  // Handle optional pagination
  let departmentsQuery = Department.find(query).sort({ name: 1 }).populate("branch", "name");
  let total;
  let pageNum;
  let limitNum;

  if (page && limit) {
    pageNum = Math.max(parseInt(page, 10) || 1, 1);
    limitNum = Math.max(parseInt(limit, 10) || 10, 1);
    const skip = (pageNum - 1) * limitNum;
    departmentsQuery = departmentsQuery.skip(skip).limit(limitNum);
    total = await Department.countDocuments(query);
  }

  const departments = await departmentsQuery.lean();

  const counts = await Employee.aggregate([
    { $match: { company: companyId } },
    { $group: { _id: "$department", count: { $sum: 1 } } },
  ]);
  
  const countMap = counts.reduce((acc, c) => {
    if (c._id) {
      acc[c._id.toString()] = c.count;
    }
    return acc;
  }, {});

  const withCounts = departments.map((d) => ({
    ...d,
    employeeCount: countMap[d._id.toString()] || 0,
  }));

  const response = {
    success: true,
    count: withCounts.length,
    data: withCounts,
  };

  if (page && limit) {
    response.pagination = {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  res.json(response);
});

// @desc    Get a single department
// @route   GET /api/departments/:id
// @access  Private
const getDepartment = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const department = await Department.findOne({ _id: req.params.id, company: companyId }).populate("branch", "name");
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
  const companyId = await getCompanyId(req);
  const { name, description, branch } = req.body;
  const department = await Department.findOneAndUpdate(
    { _id: req.params.id, company: companyId },
    { name, description, branch },
    { new: true, runValidators: true }
  ).populate("branch", "name");

  if (!department) {
    return res.status(404).json({ success: false, message: "Department not found" });
  }
  res.json({ success: true, data: department });
});

// @desc    Delete a department (blocked if employees still reference it)
// @route   DELETE /api/departments/:id
// @access  Private (admin)
const deleteDepartment = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const inUse = await Employee.countDocuments({ department: req.params.id });
  if (inUse > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete department: ${inUse} employee(s) are still assigned to it`,
    });
  }

  const department = await Department.findOneAndDelete({ _id: req.params.id, company: companyId });
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
