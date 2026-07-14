const AwardType = require("../models/AwardType");
const DocumentType = require("../models/DocumentType");
const { getCompanyId } = require("./branchController");
const asyncHandler = require("../utils/asyncHandler");

// Award Types
const getAwardTypes = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const items = await AwardType.find({ company: companyId }).sort({ name: 1 });
  res.json({ success: true, data: items });
});

const createAwardType = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const item = await AwardType.create({ ...req.body, company: companyId });
  res.status(201).json({ success: true, data: item });
});

const updateAwardType = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const item = await AwardType.findOneAndUpdate(
    { _id: req.params.id, company: companyId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!item) return res.status(404).json({ success: false, message: "Award Type not found" });
  res.json({ success: true, data: item });
});

const deleteAwardType = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const item = await AwardType.findOneAndDelete({ _id: req.params.id, company: companyId });
  if (!item) return res.status(404).json({ success: false, message: "Award Type not found" });
  res.json({ success: true, message: "Award Type deleted" });
});

// Document Types
const getDocumentTypes = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const items = await DocumentType.find({ company: companyId }).sort({ name: 1 });
  res.json({ success: true, data: items });
});

const createDocumentType = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const item = await DocumentType.create({ ...req.body, company: companyId });
  res.status(201).json({ success: true, data: item });
});

const updateDocumentType = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const item = await DocumentType.findOneAndUpdate(
    { _id: req.params.id, company: companyId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!item) return res.status(404).json({ success: false, message: "Document Type not found" });
  res.json({ success: true, data: item });
});

const deleteDocumentType = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const item = await DocumentType.findOneAndDelete({ _id: req.params.id, company: companyId });
  if (!item) return res.status(404).json({ success: false, message: "Document Type not found" });
  res.json({ success: true, message: "Document Type deleted" });
});

module.exports = {
  getAwardTypes,
  createAwardType,
  updateAwardType,
  deleteAwardType,
  getDocumentTypes,
  createDocumentType,
  updateDocumentType,
  deleteDocumentType,
};
