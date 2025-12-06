import { Router } from "express";
import { addGuest, getGuestByEvent, updateRSVP } from "../controllers/guestController";
import { authenticate } from "../middleware/authMiddleware";


const router = Router();


router.post("/", addGuest)

// owner only
router.get("/event/:id", authenticate, getGuestByEvent)

// no login required
router.put("/rsvp", updateRSVP)


export default router