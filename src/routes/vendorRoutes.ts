import { Router } from "express";
import { getAllVendors, createVendor, updateVendor, deleteVendor } from "../controllers/vendorController";
import { authenticate } from "../middleware/authMiddleware";
import { requiredRole } from "../middleware/roleMiddleware";
import { Role } from "../model/userModel";


const router = Router();

router.get("/", getAllVendors)

router.post("/", authenticate, requiredRole([Role.ADMIN]), createVendor)

router.put("/:id", authenticate, requiredRole([Role.ADMIN]), updateVendor)

router.delete("/:id", authenticate, requiredRole([Role.ADMIN]), deleteVendor)