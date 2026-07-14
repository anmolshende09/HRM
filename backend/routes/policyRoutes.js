const express = require("express");
const router = express.Router();
const {
  getPolicies,
  getPolicy,
  createPolicy,
  updatePolicy,
  deletePolicy,
} = require("../controllers/policyController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router
  .route("/")
  .get(getPolicies)
  .post(authorize("admin", "hr_manager"), createPolicy);

router
  .route("/:id")
  .get(getPolicy)
  .put(authorize("admin", "hr_manager"), updatePolicy)
  .delete(authorize("admin"), deletePolicy);

module.exports = router;
