import { Router } from "express";
import { createEvent, getMyEvents, getEventById, updateEvent, deleteEvent } from "../controllers/eventController";
import { authenticate } from "../middleware/authMiddleware";
import { requiredRole } from "../middleware/roleMiddleware";
import { Role } from "../models/userModel";
import { handleMulterError, uploadEventImage } from "../middleware/upload";

const router = Router();


router.post("/", authenticate, requiredRole([Role.ADMIN]), uploadEventImage, handleMulterError, createEvent)
 
    router.post("/test-upload", uploadEventImage, (req, res) => {
        console.log("Test upload - body:", req.body);
        console.log("Test upload - file:", req.file);
        res.json({ body: req.body, file: req.file?.originalname });
    });

router.get("/",authenticate, getMyEvents)

router
    .route("/:id")
    .get(authenticate, getEventById)
    .put(authenticate, requiredRole([Role.ADMIN]), uploadEventImage, updateEvent)
    .delete(authenticate, requiredRole([Role.ADMIN]), deleteEvent)

export default router