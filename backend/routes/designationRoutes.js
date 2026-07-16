const express = require("express");
const router = express.Router();
const {
  createDesignation,
  getDesignations,
  getDesignation,
  updateDesignation,
  deleteDesignation,
} = require("../controllers/designationController");
const { protect, authorize } = require("../middleware/auth");
const { designationRules, validate } = require("../validators/designationValidator");

router.use(protect);

router
  .route("/")
  .get(getDesignations)
  .post(authorize("admin", "hr_manager"), designationRules, validate, createDesignation);

router
  .route("/:id")
  .get(getDesignation)
  .put(authorize("admin", "hr_manager"), designationRules, validate, updateDesignation)
  .delete(authorize("admin"), deleteDesignation);

module.exports = router;
