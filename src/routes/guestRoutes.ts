import { Router } from "express";
import { addGuest, getGuestByEvent, updateRSVP } from "../controllers/guestController";
import { authenticate } from "../middleware/authMiddleware";


const router = Router();


router.post("/", authenticate, addGuest)

router.get("/event/:eventId", authenticate, getGuestByEvent)

router.put("/rsvp/:guestId", updateRSVP)


export default router