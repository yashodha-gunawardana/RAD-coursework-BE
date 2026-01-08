"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const budgetController_1 = require("../controllers/budgetController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const roleMiddleware_1 = require("../middleware/roleMiddleware");
const userModel_1 = require("../models/userModel");
const router = (0, express_1.Router)();
// Middleware applied to all routes in this file
router.use(authMiddleware_1.authenticate);
router.post("/", (0, roleMiddleware_1.requiredRole)([userModel_1.Role.USER, userModel_1.Role.ADMIN]), budgetController_1.createOrUpdateBudget);
router.get("/", (0, roleMiddleware_1.requiredRole)([userModel_1.Role.USER, userModel_1.Role.ADMIN]), budgetController_1.getAllUserBudgets);
router.get("/:budgetId", (0, roleMiddleware_1.requiredRole)([userModel_1.Role.USER, userModel_1.Role.ADMIN]), budgetController_1.getBudgetId);
router.patch("/:budgetId/status", (0, roleMiddleware_1.requiredRole)([userModel_1.Role.USER, userModel_1.Role.ADMIN]), budgetController_1.updateBudgetStatus);
router.delete("/:budgetId", (0, roleMiddleware_1.requiredRole)([userModel_1.Role.USER, userModel_1.Role.ADMIN]), budgetController_1.deleteBudget);
exports.default = router;
