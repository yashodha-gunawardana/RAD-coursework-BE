import { Router } from "express";
import {
    createOrUpdateBudget,
    getBudgetId,
    getAllUserBudgets,
    updateBudgetStatus,
    deleteBudget,
} from "../controllers/budgetController";
import { authenticate } from "../middleware/authMiddleware";
import { requiredRole } from "../middleware/roleMiddleware";
import { Role } from "../models/userModel";

const router = Router();

// middleware applied to all routes in this file
router.use(authenticate);

router.post("/", requiredRole([Role.USER, Role.ADMIN]), createOrUpdateBudget)
router.get("/", requiredRole([Role.USER, Role.ADMIN]), getAllUserBudgets)
router.get("/:budgetId", requiredRole([Role.USER, Role.ADMIN]), getBudgetId)
router.patch("/:budgetId/status", requiredRole([Role.USER, Role.ADMIN]), updateBudgetStatus)
router.delete("/:budgetId", requiredRole([Role.USER, Role.ADMIN]), deleteBudget)

export default router;