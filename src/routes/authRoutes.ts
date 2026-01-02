import { Router } from "express";
import { registerUser, loginUser, getMyDetails, rejectVendor, requestVendor, getAllUsers, approveVendor } from "../controllers/authController";
import { authenticate } from "../middleware/authMiddleware";
import { requiredRole } from "../middleware/roleMiddleware";
import { Role } from "../models/userModel";

// create a new Express Router object
const router = Router();

// register a normal user
router.post("/register", registerUser)
router.post("/login", loginUser)

// authenticate routes
router.get("/me", authenticate, getMyDetails)
router.post("/request/vendor", authenticate, requiredRole([Role.USER]), requestVendor);

// admin only routes
router.get("/users", authenticate, requiredRole([Role.ADMIN]), getAllUsers);
router.post("/users/approve/:id", authenticate, requiredRole([Role.ADMIN]), approveVendor);
router.post("/users/reject/:id", authenticate, requiredRole([Role.ADMIN]), rejectVendor);


export default router