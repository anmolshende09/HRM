const Shift = require("../models/Shift");
const { getCompanyId } = require("./branchController");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Get all shifts
// @route   GET /api/shifts
const getShifts = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const { search } = req.query;

  const query = { company: companyId };
  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  const shifts = await Shift.find(query).sort({ name: 1 });
  res.json({ success: true, data: shifts });
});

// @desc    Get single shift
// @route   GET /api/shifts/:id
const getShift = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const shift = await Shift.findOne({ _id: req.params.id, company: companyId });
  if (!shift) {
    return res.status(404).json({ success: false, message: "Shift not found" });
  }
  res.json({ success: true, data: shift });
});

// @desc    Create shift
// @route   POST /api/shifts
const createShift = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const payload = { ...req.body, company: companyId };
  const shift = await Shift.create(payload);
  res.status(201).json({ success: true, data: shift });
});

// @desc    Update shift
// @route   PUT /api/shifts/:id
const updateShift = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const shift = await Shift.findOneAndUpdate(
    { _id: req.params.id, company: companyId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!shift) {
    return res.status(404).json({ success: false, message: "Shift not found" });
  }
  res.json({ success: true, data: shift });
});

// @desc    Delete shift
// @route   DELETE /api/shifts/:id
const deleteShift = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const shift = await Shift.findOneAndDelete({ _id: req.params.id, company: companyId });
  if (!shift) {
    return res.status(404).json({ success: false, message: "Shift not found" });
  }
  res.json({ success: true, message: "Shift deleted successfully" });
});

module.exports = {
  getShifts,
  getShift,
  createShift,
  updateShift,
  deleteShift,
};
