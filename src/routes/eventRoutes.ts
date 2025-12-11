import { Router } from "express";
import { createEvent, getMyEvents, getEventById, updateEvent, deleteEvent } from "../controllers/eventController";
import { authenticate } from "../middleware/authMiddleware";
import { requiredRole } from "../middleware/roleMiddleware";
import { Role } from "../models/userModel";

const router = Router();

router
    .route("/")
    .post(authenticate, requiredRole([Role.ADMIN]), createEvent)
    .get(authenticate, getMyEvents)

router
    .route("/:id")
    .get(authenticate, getEventById)
    .put(authenticate, requiredRole([Role.ADMIN]), updateEvent)
    .delete(authenticate, requiredRole([Role.ADMIN]), deleteEvent)

export default router