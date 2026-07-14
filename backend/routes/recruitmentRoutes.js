const express = require("express");
const router = express.Router();
const {
  getJobCategories, createJobCategory, updateJobCategory, deleteJobCategory,
  getJobTypes, createJobType, updateJobType, deleteJobType,
  getJobPostings, getJobPosting, createJobPosting, updateJobPosting, deleteJobPosting,
  getCandidates, getCandidate, createCandidate, updateCandidate, deleteCandidate,
  getInterviews, createInterview, updateInterview, deleteInterview,
  getOffers, createOffer, updateOffer, deleteOffer,
  getOnboardings, createOnboarding, updateOnboarding, deleteOnboarding
} = require("../controllers/recruitmentController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

// 1. Categories
router.route("/categories").get(getJobCategories).post(authorize("admin", "hr_manager"), createJobCategory);
router.route("/categories/:id").put(authorize("admin", "hr_manager"), updateJobCategory).delete(authorize("admin"), deleteJobCategory);

// 2. Job Types
router.route("/types").get(getJobTypes).post(authorize("admin", "hr_manager"), createJobType);
router.route("/types/:id").put(authorize("admin", "hr_manager"), updateJobType).delete(authorize("admin"), deleteJobType);

// 3. Job Postings
router.route("/job-postings").get(getJobPostings).post(authorize("admin", "hr_manager"), createJobPosting);
router.route("/job-postings/:id").get(getJobPosting).put(authorize("admin", "hr_manager"), updateJobPosting).delete(authorize("admin"), deleteJobPosting);

// 4. Candidates
router.route("/candidates").get(getCandidates).post(authorize("admin", "hr_manager"), createCandidate);
router.route("/candidates/:id").get(getCandidate).put(authorize("admin", "hr_manager"), updateCandidate).delete(authorize("admin", "hr_manager"), deleteCandidate);

// 5. Interviews
router.route("/interviews").get(getInterviews).post(authorize("admin", "hr_manager"), createInterview);
router.route("/interviews/:id").put(authorize("admin", "hr_manager"), updateInterview).delete(authorize("admin", "hr_manager"), deleteInterview);

// 6. Offers
router.route("/offers").get(getOffers).post(authorize("admin", "hr_manager"), createOffer);
router.route("/offers/:id").put(authorize("admin", "hr_manager"), updateOffer).delete(authorize("admin", "hr_manager"), deleteOffer);

// 7. Onboardings
router.route("/onboardings").get(getOnboardings).post(authorize("admin", "hr_manager"), createOnboarding);
router.route("/onboardings/:id").put(authorize("admin", "hr_manager"), updateOnboarding).delete(authorize("admin", "hr_manager"), deleteOnboarding);

module.exports = router;
