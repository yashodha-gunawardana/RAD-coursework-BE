import { Router } from "express";
import { 
    registerUser, 
    loginUser, 
    getMyDetails, 
    rejectVendor, 
    requestVendor, 
    getAllUsers, 
    approveVendor, 
    deleteUser 
} from "../controllers/authController";
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
router.post("/request/vendor", authenticate, requiredRole([Role.USER]), requestVendor)

// admin only routes
router.get("/admin", authenticate, requiredRole([Role.ADMIN]), getAllUsers);
router.post("/admin/approve/:id", authenticate, requiredRole([Role.ADMIN]), approveVendor)
router.post("/admin/reject/:id", authenticate, requiredRole([Role.ADMIN]), rejectVendor)
router.delete("/admin/:id", authenticate, requiredRole([Role.ADMIN]), deleteUser)


export default router