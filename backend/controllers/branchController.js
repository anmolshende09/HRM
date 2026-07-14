const Branch = require("../models/Branch");
const Company = require("../models/Company");
const asyncHandler = require("../utils/asyncHandler");

const getCompanyId = async (req) => {
  if (req.user.company) return req.user.company;
  if (req.user.employee) {
    const Employee = require("../models/Employee");
    const emp = await Employee.findById(req.user.employee);
    if (emp && emp.company) return emp.company;
  }
  const defaultCompany = await Company.findOne();
  return defaultCompany ? defaultCompany._id : null;
};

// @desc    Get all branches
// @route   GET /api/branches
const getBranches = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const { search, page = 1, limit = 10 } = req.query;

  const query = { company: companyId };
  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (pageNum - 1) * limitNum;

  const [branches, total] = await Promise.all([
    Branch.find(query).skip(skip).limit(limitNum).sort({ createdAt: -1 }),
    Branch.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: branches,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

// @desc    Get a single branch
// @route   GET /api/branches/:id
const getBranch = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const branch = await Branch.findOne({ _id: req.params.id, company: companyId });
  if (!branch) {
    return res.status(404).json({ success: false, message: "Branch not found" });
  }
  res.json({ success: true, data: branch });
});

// @desc    Create branch
// @route   POST /api/branches
const createBranch = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const payload = { ...req.body, company: companyId };
  const branch = await Branch.create(payload);
  res.status(201).json({ success: true, data: branch });
});

// @desc    Update branch
// @route   PUT /api/branches/:id
const updateBranch = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const branch = await Branch.findOneAndUpdate(
    { _id: req.params.id, company: companyId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!branch) {
    return res.status(404).json({ success: false, message: "Branch not found" });
  }
  res.json({ success: true, data: branch });
});

// @desc    Delete branch
// @route   DELETE /api/branches/:id
const deleteBranch = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const branch = await Branch.findOneAndDelete({ _id: req.params.id, company: companyId });
  if (!branch) {
    return res.status(404).json({ success: false, message: "Branch not found" });
  }
  res.json({ success: true, message: "Branch deleted successfully" });
});

module.exports = {
  getBranches,
  getBranch,
  createBranch,
  updateBranch,
  deleteBranch,
  getCompanyId,
};
