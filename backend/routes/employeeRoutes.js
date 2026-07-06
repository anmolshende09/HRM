const express = require("express");
const router = express.Router();
const {
  createEmployee,
  getEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
} = require("../controllers/employeeController");
const { protect, authorize } = require("../middleware/auth");
const { employeeRules, validate } = require("../validators/employeeValidator");
const upload = require("../config/upload");

router.use(protect);

router
  .route("/")
  .get(getEmployees)
  .post(authorize("admin", "hr_manager"), upload.single("profilePicture"), employeeRules, validate, createEmployee);

router
  .route("/:id")
  .get(getEmployee)
  .put(authorize("admin", "hr_manager"), upload.single("profilePicture"), updateEmployee)
  .delete(authorize("admin"), deleteEmployee);

module.exports = router;
