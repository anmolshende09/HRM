const express = require("express");
const router = express.Router();
const {
  getRegularizations,
  createRegularization,
  reviewRegularization,
  deleteRegularization,
} = require("../controllers/regularizationController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router
  .route("/")
  .get(getRegularizations)
  .post(createRegularization);

router
  .route("/:id")
  .delete(deleteRegularization);

router.put("/:id/review", authorize("admin", "hr_manager"), reviewRegularization);

module.exports = router;
