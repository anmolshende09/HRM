const express = require("express");
const router = express.Router();
const {
  createDepartment,
  getDepartments,
  getDepartment,
  updateDepartment,
  deleteDepartment,
} = require("../controllers/departmentController");
const { protect, authorize } = require("../middleware/auth");
const { body } = require("express-validator");
const { validate } = require("../validators/authValidator");

router.use(protect);

const departmentRules = [
  body("name").trim().notEmpty().withMessage("Department name is required"),
];

router
  .route("/")
  .get(getDepartments)
  .post(authorize("admin", "hr_manager"), departmentRules, validate, createDepartment);

router
  .route("/:id")
  .get(getDepartment)
  .put(authorize("admin", "hr_manager"), updateDepartment)
  .delete(authorize("admin"), deleteDepartment);

module.exports = router;
