import { Router } from "express";
import { 
    getAllVendors, 
    createVendor, 
    getVendorById, 
    updateVendor, 
    deleteVendor, 
    updateOwnVendorProfile, 
    getAllVendorsForSelect,
    getOwnVendorProfile,
    getVendorByUserId
} from "../controllers/vendorController";
import { authenticate } from "../middleware/authMiddleware";
import { requiredRole } from "../middleware/roleMiddleware";
import { Role } from "../models/userModel";
import { handleMulterError, uploadImage } from "../middleware/upload";


const router = Router();


// public
router.get("/", getAllVendors)

// public
router.get("/:id", getVendorById)

// Get vendor details for the logged-in vendor
router.get("/by-user", authenticate, getVendorByUserId);

router.get("/dropdown", authenticate, getAllVendorsForSelect)

// self
router.get("/me", authenticate, getOwnVendorProfile)
router.put("/me", authenticate, uploadImage, handleMulterError, updateOwnVendorProfile)

// admin only
router.post("/", authenticate, requiredRole([Role.ADMIN]), uploadImage, handleMulterError, createVendor)
router.put("/:id", authenticate, requiredRole([Role.ADMIN]), uploadImage, handleMulterError, updateVendor)
router.delete("/:id", authenticate, requiredRole([Role.ADMIN]), deleteVendor)





export default router