const express = require("express");
const router = express.Router();
const {
  getShifts,
  getShift,
  createShift,
  updateShift,
  deleteShift,
} = require("../controllers/shiftController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router
  .route("/")
  .get(getShifts)
  .post(authorize("admin", "hr_manager"), createShift);

router
  .route("/:id")
  .get(getShift)
  .put(authorize("admin", "hr_manager"), updateShift)
  .delete(authorize("admin"), deleteShift);

module.exports = router;
