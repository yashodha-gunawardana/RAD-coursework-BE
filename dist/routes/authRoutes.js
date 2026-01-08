"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const roleMiddleware_1 = require("../middleware/roleMiddleware");
const userModel_1 = require("../models/userModel");
// create a new Express Router object
const router = (0, express_1.Router)();
// register a normal user
router.post("/register", authController_1.registerUser);
router.post("/login", authController_1.loginUser);
// authenticate routes
router.get("/me", authMiddleware_1.authenticate, authController_1.getMyDetails);
router.post("/request/vendor", authMiddleware_1.authenticate, (0, roleMiddleware_1.requiredRole)([userModel_1.Role.USER]), authController_1.requestVendor);
// admin only routes
router.get("/users", authMiddleware_1.authenticate, (0, roleMiddleware_1.requiredRole)([userModel_1.Role.ADMIN]), authController_1.getAllUsers);
router.post("/users/approve/:id", authMiddleware_1.authenticate, (0, roleMiddleware_1.requiredRole)([userModel_1.Role.ADMIN]), authController_1.approveVendor);
router.post("/users/reject/:id", authMiddleware_1.authenticate, (0, roleMiddleware_1.requiredRole)([userModel_1.Role.ADMIN]), authController_1.rejectVendor);
router.delete("/users/:id", authMiddleware_1.authenticate, (0, roleMiddleware_1.requiredRole)([userModel_1.Role.ADMIN]), authController_1.deleteUser);
exports.default = router;
