import { Router } from "express";
import { registerUser, loginUser } from "../controllers/authController";
import { authenticate } from "../middleware/authMiddleware";
import { requiredRole } from "../middleware/roleMiddleware";
import { Role } from "../model/userModel";

// create a new Express Router object
const router = Router();

// register a normal user
router.post("/register", registerUser)
router.post("/login", loginUser)

export default router