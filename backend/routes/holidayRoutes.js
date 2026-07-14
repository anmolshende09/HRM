const express = require("express");
const router = express.Router();
const {
  getHolidays,
  getHoliday,
  createHoliday,
  updateHoliday,
  deleteHoliday,
  exportICal,
  exportPDF,
} = require("../controllers/holidayController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

// Specific export routes must be matched before resource ID routes
router.get("/export/ical", exportICal);
router.get("/export/pdf", exportPDF);

router
  .route("/")
  .get(getHolidays)
  .post(authorize("admin", "hr_manager"), createHoliday);

router
  .route("/:id")
  .get(getHoliday)
  .put(authorize("admin", "hr_manager"), updateHoliday)
  .delete(authorize("admin"), deleteHoliday);

module.exports = router;
