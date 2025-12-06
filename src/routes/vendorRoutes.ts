import { Router } from "express";
import { getAllVendors, createVendor, getVendorById, updateVendor, deleteVendor } from "../controllers/vendorController";
import { authenticate } from "../middleware/authMiddleware";
import { requiredRole } from "../middleware/roleMiddleware";
import { Role } from "../model/userModel";


const router = Router();

// public
router.get("/", getAllVendors)
router.get("/:id", getVendorById)

// admin only
router.post("/", authenticate, requiredRole([Role.ADMIN]), createVendor)
router.put("/:id", authenticate, requiredRole([Role.ADMIN]), updateVendor)
router.delete("/:id", authenticate, requiredRole([Role.ADMIN]), deleteVendor)


export default router