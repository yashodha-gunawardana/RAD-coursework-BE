import { Router } from "express";
import { addGuest, getGuestByEvent, updateRSVP } from "../controllers/guestController";
import { authenticate } from "../middleware/authMiddleware";
import { requiredRole } from "../middleware/roleMiddleware";
import { Role } from "../models/userModel"


const router = Router();


router.post("/", addGuest)

// owner only
router.get("/event/:id", authenticate, requiredRole([Role.ADMIN, Role.USER]), getGuestByEvent)

// no login required
router.put("/rsvp", authenticate, requiredRole([Role.ADMIN, Role.USER]), updateRSVP)


export default router