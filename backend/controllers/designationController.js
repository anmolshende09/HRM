const Designation = require("../models/Designation");
const { getCompanyId } = require("./branchController");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Get all designations
// @route   GET /api/designations
const getDesignations = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const { search, department, branch, page = 1, limit = 10 } = req.query;

  const query = { company: companyId };
  if (search) {
    query.name = { $regex: search, $options: "i" };
  }
  if (department) {
    query.department = department;
  }
  if (branch) {
    query.branch = branch;
  }

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (pageNum - 1) * limitNum;

  const [designations, total] = await Promise.all([
    Designation.find(query)
      .populate("department", "name")
      .populate("branch", "name")
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 }),
    Designation.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: designations,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

// @desc    Get a single designation
// @route   GET /api/designations/:id
const getDesignation = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const designation = await Designation.findOne({ _id: req.params.id, company: companyId })
    .populate("department", "name")
    .populate("branch", "name");

  if (!designation) {
    return res.status(404).json({ success: false, message: "Designation not found" });
  }
  res.json({ success: true, data: designation });
});

// @desc    Create designation
// @route   POST /api/designations
const createDesignation = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const payload = { ...req.body, company: companyId };
  const designation = await Designation.create(payload);
  res.status(201).json({ success: true, data: designation });
});

// @desc    Update designation
// @route   PUT /api/designations/:id
const updateDesignation = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const designation = await Designation.findOneAndUpdate(
    { _id: req.params.id, company: companyId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!designation) {
    return res.status(404).json({ success: false, message: "Designation not found" });
  }
  res.json({ success: true, data: designation });
});

// @desc    Delete designation
// @route   DELETE /api/designations/:id
const deleteDesignation = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const designation = await Designation.findOneAndDelete({ _id: req.params.id, company: companyId });
  if (!designation) {
    return res.status(404).json({ success: false, message: "Designation not found" });
  }
  res.json({ success: true, message: "Designation deleted successfully" });
});

module.exports = {
  getDesignations,
  getDesignation,
  createDesignation,
  updateDesignation,
  deleteDesignation,
};
