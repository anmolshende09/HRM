const AttendancePolicy = require("../models/AttendancePolicy");
const { getCompanyId } = require("./branchController");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Get all policies
// @route   GET /api/policies
const getPolicies = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const policies = await AttendancePolicy.find({ company: companyId }).sort({ name: 1 });
  res.json({ success: true, data: policies });
});

// @desc    Get single policy
// @route   GET /api/policies/:id
const getPolicy = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const policy = await AttendancePolicy.findOne({ _id: req.params.id, company: companyId });
  if (!policy) {
    return res.status(404).json({ success: false, message: "Policy not found" });
  }
  res.json({ success: true, data: policy });
});

// @desc    Create policy
// @route   POST /api/policies
const createPolicy = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const payload = { ...req.body, company: companyId };
  const policy = await AttendancePolicy.create(payload);
  res.status(201).json({ success: true, data: policy });
});

// @desc    Update policy
// @route   PUT /api/policies/:id
const updatePolicy = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const policy = await AttendancePolicy.findOneAndUpdate(
    { _id: req.params.id, company: companyId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!policy) {
    return res.status(404).json({ success: false, message: "Policy not found" });
  }
  res.json({ success: true, data: policy });
});

// @desc    Delete policy
// @route   DELETE /api/policies/:id
const deletePolicy = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const policy = await AttendancePolicy.findOneAndDelete({ _id: req.params.id, company: companyId });
  if (!policy) {
    return res.status(404).json({ success: false, message: "Policy not found" });
  }
  res.json({ success: true, message: "Policy deleted successfully" });
});

module.exports = {
  getPolicies,
  getPolicy,
  createPolicy,
  updatePolicy,
  deletePolicy,
};
