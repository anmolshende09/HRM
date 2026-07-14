const JobCategory = require("../models/JobCategory");
const JobType = require("../models/JobType");
const JobPosting = require("../models/JobPosting");
const Candidate = require("../models/Candidate");
const Interview = require("../models/Interview");
const Offer = require("../models/Offer");
const Onboarding = require("../models/Onboarding");
const { getCompanyId } = require("./branchController");
const asyncHandler = require("../utils/asyncHandler");

// =========================================================================
// 1. JOB CATEGORIES
// =========================================================================
const getJobCategories = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const items = await JobCategory.find({ company: companyId }).sort({ name: 1 });
  res.json({ success: true, data: items });
});

const createJobCategory = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const item = await JobCategory.create({ ...req.body, company: companyId });
  res.status(201).json({ success: true, data: item });
});

const updateJobCategory = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const item = await JobCategory.findOneAndUpdate(
    { _id: req.params.id, company: companyId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!item) return res.status(404).json({ success: false, message: "Category not found" });
  res.json({ success: true, data: item });
});

const deleteJobCategory = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const item = await JobCategory.findOneAndDelete({ _id: req.params.id, company: companyId });
  if (!item) return res.status(404).json({ success: false, message: "Category not found" });
  res.json({ success: true, message: "Category deleted" });
});

// =========================================================================
// 2. JOB TYPES
// =========================================================================
const getJobTypes = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const items = await JobType.find({ company: companyId }).sort({ name: 1 });
  res.json({ success: true, data: items });
});

const createJobType = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const item = await JobType.create({ ...req.body, company: companyId });
  res.status(201).json({ success: true, data: item });
});

const updateJobType = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const item = await JobType.findOneAndUpdate(
    { _id: req.params.id, company: companyId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!item) return res.status(404).json({ success: false, message: "Job Type not found" });
  res.json({ success: true, data: item });
});

const deleteJobType = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const item = await JobType.findOneAndDelete({ _id: req.params.id, company: companyId });
  if (!item) return res.status(404).json({ success: false, message: "Job Type not found" });
  res.json({ success: true, message: "Job Type deleted" });
});

// =========================================================================
// 3. JOB POSTINGS
// =========================================================================
const getJobPostings = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const { search, category, type, status } = req.query;

  const query = { company: companyId };
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { jobCode: { $regex: search, $options: "i" } }
    ];
  }
  if (category) query.category = category;
  if (type) query.type = type;
  if (status) query.status = status;

  const list = await JobPosting.find(query)
    .populate("category", "name")
    .populate("type", "name")
    .sort({ createdAt: -1 });

  res.json({ success: true, data: list });
});

const getJobPosting = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const item = await JobPosting.findOne({ _id: req.params.id, company: companyId })
    .populate("category", "name")
    .populate("type", "name");
  if (!item) return res.status(404).json({ success: false, message: "Job Posting not found" });
  res.json({ success: true, data: item });
});

const createJobPosting = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const item = await JobPosting.create({ ...req.body, company: companyId });
  res.status(201).json({ success: true, data: item });
});

const updateJobPosting = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const item = await JobPosting.findOneAndUpdate(
    { _id: req.params.id, company: companyId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!item) return res.status(404).json({ success: false, message: "Job Posting not found" });
  res.json({ success: true, data: item });
});

const deleteJobPosting = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const item = await JobPosting.findOneAndDelete({ _id: req.params.id, company: companyId });
  if (!item) return res.status(404).json({ success: false, message: "Job Posting not found" });
  res.json({ success: true, message: "Job Posting deleted" });
});

// =========================================================================
// 4. CANDIDATES
// =========================================================================
const getCandidates = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const { search, jobPosting, status } = req.query;

  const query = { company: companyId };
  if (search) {
    query.name = { $regex: search, $options: "i" };
  }
  if (jobPosting) query.jobPosting = jobPosting;
  if (status) query.status = status;

  const list = await Candidate.find(query)
    .populate("jobPosting", "title jobCode")
    .sort({ createdAt: -1 });

  res.json({ success: true, data: list });
});

const getCandidate = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const item = await Candidate.findOne({ _id: req.params.id, company: companyId }).populate("jobPosting", "title jobCode");
  if (!item) return res.status(404).json({ success: false, message: "Candidate not found" });
  res.json({ success: true, data: item });
});

const createCandidate = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const item = await Candidate.create({ ...req.body, company: companyId });
  
  // increment application count
  if (req.body.jobPosting) {
    await JobPosting.findByIdAndUpdate(req.body.jobPosting, { $inc: { applicationsCount: 1 } });
  }

  res.status(201).json({ success: true, data: item });
});

const updateCandidate = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const item = await Candidate.findOneAndUpdate(
    { _id: req.params.id, company: companyId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!item) return res.status(404).json({ success: false, message: "Candidate not found" });
  res.json({ success: true, data: item });
});

const deleteCandidate = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const candidate = await Candidate.findOne({ _id: req.params.id, company: companyId });
  if (!candidate) return res.status(404).json({ success: false, message: "Candidate not found" });

  if (candidate.jobPosting) {
    await JobPosting.findByIdAndUpdate(candidate.jobPosting, { $inc: { applicationsCount: -1 } });
  }

  await candidate.deleteOne();
  res.json({ success: true, message: "Candidate deleted" });
});

// =========================================================================
// 5. INTERVIEWS
// =========================================================================
const getInterviews = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const { candidate, status } = req.query;

  const query = { company: companyId };
  if (candidate) query.candidate = candidate;
  if (status) query.status = status;

  const list = await Interview.find(query)
    .populate({
      path: "candidate",
      select: "name email phone",
      populate: { path: "jobPosting", select: "title" }
    })
    .sort({ dateTime: 1 });

  res.json({ success: true, data: list });
});

const createInterview = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const item = await Interview.create({ ...req.body, company: companyId });
  
  // update candidate status to interviewed
  await Candidate.findByIdAndUpdate(req.body.candidate, { status: "interviewed" });

  res.status(201).json({ success: true, data: item });
});

const updateInterview = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const item = await Interview.findOneAndUpdate(
    { _id: req.params.id, company: companyId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!item) return res.status(404).json({ success: false, message: "Interview not found" });
  res.json({ success: true, data: item });
});

const deleteInterview = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const item = await Interview.findOneAndDelete({ _id: req.params.id, company: companyId });
  if (!item) return res.status(404).json({ success: false, message: "Interview not found" });
  res.json({ success: true, message: "Interview deleted" });
});

// =========================================================================
// 6. OFFERS
// =========================================================================
const getOffers = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const list = await Offer.find({ company: companyId })
    .populate({
      path: "candidate",
      select: "name email phone",
      populate: { path: "jobPosting", select: "title" }
    })
    .sort({ createdAt: -1 });

  res.json({ success: true, data: list });
});

const createOffer = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const item = await Offer.create({ ...req.body, company: companyId });

  // update candidate status to offered
  await Candidate.findByIdAndUpdate(req.body.candidate, { status: "offered" });

  res.status(201).json({ success: true, data: item });
});

const updateOffer = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const item = await Offer.findOneAndUpdate(
    { _id: req.params.id, company: companyId },
    req.body,
    { new: true, runValidators: true }
  );

  if (req.body.status === "accepted" && item) {
    await Candidate.findByIdAndUpdate(item.candidate, { status: "hired" });
  }

  if (!item) return res.status(404).json({ success: false, message: "Offer not found" });
  res.json({ success: true, data: item });
});

const deleteOffer = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const item = await Offer.findOneAndDelete({ _id: req.params.id, company: companyId });
  if (!item) return res.status(404).json({ success: false, message: "Offer not found" });
  res.json({ success: true, message: "Offer deleted" });
});

// =========================================================================
// 7. ONBOARDINGS
// =========================================================================
const getOnboardings = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const list = await Onboarding.find({ company: companyId })
    .populate("candidate", "name email phone status")
    .populate("buddy", "name email")
    .sort({ createdAt: -1 });

  res.json({ success: true, data: list });
});

const createOnboarding = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  
  const checklist = [
    { task: "Collect Documents & ID Proofs", completed: false },
    { task: "Allocate Workstation & Laptop", completed: false },
    { task: "Create System Email & Slack ID", completed: false },
    { task: "Assign Work Buddy & Introduction Sync", completed: false }
  ];

  const item = await Onboarding.create({
    ...req.body,
    checklist: req.body.checklist || checklist,
    company: companyId
  });

  res.status(201).json({ success: true, data: item });
});

const updateOnboarding = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const item = await Onboarding.findOneAndUpdate(
    { _id: req.params.id, company: companyId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!item) return res.status(404).json({ success: false, message: "Onboarding not found" });
  res.json({ success: true, data: item });
});

const deleteOnboarding = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req);
  const item = await Onboarding.findOneAndDelete({ _id: req.params.id, company: companyId });
  if (!item) return res.status(404).json({ success: false, message: "Onboarding not found" });
  res.json({ success: true, message: "Onboarding deleted" });
});

module.exports = {
  // Categories
  getJobCategories,
  createJobCategory,
  updateJobCategory,
  deleteJobCategory,
  // Types
  getJobTypes,
  createJobType,
  updateJobType,
  deleteJobType,
  // Job Postings
  getJobPostings,
  getJobPosting,
  createJobPosting,
  updateJobPosting,
  deleteJobPosting,
  // Candidates
  getCandidates,
  getCandidate,
  createCandidate,
  updateCandidate,
  deleteCandidate,
  // Interviews
  getInterviews,
  createInterview,
  updateInterview,
  deleteInterview,
  // Offers
  getOffers,
  createOffer,
  updateOffer,
  deleteOffer,
  // Onboardings
  getOnboardings,
  createOnboarding,
  updateOnboarding,
  deleteOnboarding
};
