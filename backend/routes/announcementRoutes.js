const express = require("express");
const router = express.Router();
const {
  createAnnouncement,
  getAnnouncements,
  updateAnnouncement,
  markRead,
  deleteAnnouncement,
} = require("../controllers/announcementController");
const { protect, authorize } = require("../middleware/auth");
const { body } = require("express-validator");
const { validate } = require("../validators/authValidator");

router.use(protect);

const announcementRules = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
];

router
  .route("/")
  .get(getAnnouncements)
  .post(authorize("admin", "hr_manager"), announcementRules, validate, createAnnouncement);

router
  .route("/:id")
  .put(authorize("admin", "hr_manager"), updateAnnouncement)
  .delete(authorize("admin", "hr_manager"), deleteAnnouncement);

router.post("/:id/read", markRead);

module.exports = router;
