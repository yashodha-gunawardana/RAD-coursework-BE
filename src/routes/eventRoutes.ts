import { Router } from "express";
import { 
    createEvent, 
    getMyEvents, 
    getEventById, 
    updateEvent, 
    deleteEvent, 
    getAllEvents,
    getAllEventsForSelect
 } from "../controllers/eventController";
import { authenticate } from "../middleware/authMiddleware";
import { requiredRole } from "../middleware/roleMiddleware";
import { Role } from "../models/userModel";
import { handleMulterError, uploadImage } from "../middleware/upload";

const router = Router();


// router.post("/", authenticate, requiredRole([Role.ADMIN]), uploadImage, handleMulterError, createEvent)
 router.post("/", authenticate, uploadImage, handleMulterError, createEvent)
 
    router.post("/test-upload", uploadImage, (req, res) => {
        console.log("Test upload - body:", req.body);
        console.log("Test upload - file:", req.file);
        res.json({ body: req.body, file: req.file?.originalname });
    });

router.get("/my",authenticate, getMyEvents)
router.get("/all", authenticate, requiredRole([Role.ADMIN]), getAllEvents)


router.get("/dropdown", authenticate, getAllEventsForSelect)

router
    .route("/:id")
    .get(authenticate, getEventById)
    .put(authenticate, requiredRole([Role.ADMIN]), uploadImage, updateEvent)
    .delete(authenticate, requiredRole([Role.ADMIN]), deleteEvent)

export default router