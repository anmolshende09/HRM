const express = require("express");
const router = express.Router();
const {
  getBranches,
  getBranch,
  createBranch,
  updateBranch,
  deleteBranch,
} = require("../controllers/branchController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router
  .route("/")
  .get(getBranches)
  .post(authorize("admin", "hr_manager"), createBranch);

router
  .route("/:id")
  .get(getBranch)
  .put(authorize("admin", "hr_manager"), updateBranch)
  .delete(authorize("admin"), deleteBranch);

module.exports = router;
