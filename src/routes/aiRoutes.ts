import express from "express";
import { eventConsultantAI } from "../controllers/aiController";
import { authenticate } from "../middleware/authMiddleware";


const router = express.Router();

// AI endpoint
router.post("/event-consultant", authenticate, eventConsultantAI);

export default router;
