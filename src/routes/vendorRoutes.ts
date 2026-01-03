import { Router } from "express";
import { 
    getAllVendors, 
    createVendor, 
    getVendorById, 
    updateVendor, 
    deleteVendor, 
    updateOwnVendorProfile, 
    getAllVendorsForSelect
} from "../controllers/vendorController";
import { authenticate } from "../middleware/authMiddleware";
import { requiredRole } from "../middleware/roleMiddleware";
import { Role } from "../models/userModel";
import { handleMulterError, uploadImage } from "../middleware/upload";


const router = Router();

// public
router.get("/", getAllVendors)


// self
router.put("/me", authenticate, uploadImage, handleMulterError, updateOwnVendorProfile)


// public
router.get("/:id", getVendorById)

// admin only
router.post("/", authenticate, requiredRole([Role.ADMIN]), uploadImage, handleMulterError, createVendor)
router.put("/:id", authenticate, requiredRole([Role.ADMIN]), uploadImage, handleMulterError, updateVendor)
router.delete("/:id", authenticate, requiredRole([Role.ADMIN]), deleteVendor)


router.get("/all", authenticate, getAllVendorsForSelect)



export default router