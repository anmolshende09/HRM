const express = require("express");
const router = express.Router();
const {
  getTimesheets,
  getTimesheet,
  createTimesheet,
  updateTimesheet,
  reviewTimesheet,
  deleteTimesheet,
  exportTimesheets,
  importTimesheets,
} = require("../controllers/timesheetController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router.get("/export", exportTimesheets);
router.post("/import", importTimesheets);

router
  .route("/")
  .get(getTimesheets)
  .post(createTimesheet);

router
  .route("/:id")
  .get(getTimesheet)
  .put(updateTimesheet)
  .delete(deleteTimesheet);

router.put("/:id/review", authorize("admin", "hr_manager"), reviewTimesheet);

module.exports = router;
