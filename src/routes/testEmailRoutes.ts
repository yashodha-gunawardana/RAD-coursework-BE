import { Router } from "express";
import { testSendEmail } from "../controllers/emailController"

const router = Router();

router.get("/test-email", testSendEmail);

export default router;
