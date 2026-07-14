const express = require("express");
const router = express.Router();
const {
  getAwardTypes, createAwardType, updateAwardType, deleteAwardType,
  getDocumentTypes, createDocumentType, updateDocumentType, deleteDocumentType
} = require("../controllers/miscController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

// Award Types
router.route("/award-types").get(getAwardTypes).post(authorize("admin", "hr_manager"), createAwardType);
router.route("/award-types/:id").put(authorize("admin", "hr_manager"), updateAwardType).delete(authorize("admin"), deleteAwardType);

// Document Types
router.route("/document-types").get(getDocumentTypes).post(authorize("admin", "hr_manager"), createDocumentType);
router.route("/document-types/:id").put(authorize("admin", "hr_manager"), updateDocumentType).delete(authorize("admin"), deleteDocumentType);

module.exports = router;
