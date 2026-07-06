const express = require("express");
const router = express.Router();
const {
  markAttendance,
  getHistory,
  getToday,
  getPercentage,
} = require("../controllers/attendanceController");
const { protect, authorize } = require("../middleware/auth");
const { body } = require("express-validator");
const { validate } = require("../validators/authValidator");

router.use(protect);

const markRules = [
  body("employee").isMongoId().withMessage("A valid employee is required"),
  body("status").isIn(["present", "absent", "half_day", "on_leave"]).withMessage("Invalid attendance status"),
];

router.post("/", authorize("admin", "hr_manager", "employee"), markRules, validate, markAttendance);
router.get("/today", authorize("admin", "hr_manager"), getToday);
router.get("/history/:employeeId", getHistory);
router.get("/percentage/:employeeId", getPercentage);

module.exports = router;
