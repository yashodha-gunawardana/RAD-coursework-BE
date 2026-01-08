"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const vendorController_1 = require("../controllers/vendorController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const roleMiddleware_1 = require("../middleware/roleMiddleware");
const userModel_1 = require("../models/userModel");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
// public
router.get("/", vendorController_1.getAllVendors);
router.get("/dropdown", vendorController_1.getAllVendorsForSelect);
// Get vendor details for the logged-in vendor
router.get("/by-user", authMiddleware_1.authenticate, vendorController_1.getVendorByUserId);
// self
router.get("/me", authMiddleware_1.authenticate, vendorController_1.getOwnVendorProfile);
router.put("/me", authMiddleware_1.authenticate, upload_1.uploadImage, upload_1.handleMulterError, vendorController_1.updateOwnVendorProfile);
// public
router.get("/:id", vendorController_1.getVendorById);
// admin only
router.post("/", authMiddleware_1.authenticate, (0, roleMiddleware_1.requiredRole)([userModel_1.Role.ADMIN]), upload_1.uploadImage, upload_1.handleMulterError, vendorController_1.createVendor);
router.put("/:id", authMiddleware_1.authenticate, (0, roleMiddleware_1.requiredRole)([userModel_1.Role.ADMIN]), upload_1.uploadImage, upload_1.handleMulterError, vendorController_1.updateVendor);
router.delete("/:id", authMiddleware_1.authenticate, (0, roleMiddleware_1.requiredRole)([userModel_1.Role.ADMIN]), vendorController_1.deleteVendor);
exports.default = router;
