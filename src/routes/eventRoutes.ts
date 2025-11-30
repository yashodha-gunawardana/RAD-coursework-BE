import { Router } from "express";
import { createEvent, getMyEvents, getEventById, updateEvent, deleteEvent } from "../controllers/eventController";
import { authenticate } from "../middleware/authMiddleware";
import { requiredRole } from "../middleware/roleMiddleware";
import { Role } from "../model/userModel";

const router = Router();

router
    .route("/")
    .post(authenticate, createEvent)
    .get(authenticate, getMyEvents)



export default router