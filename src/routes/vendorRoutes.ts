import { Router } from "express";
import { getAllVendors, createVendor, updateVendor, deleteVendor } from "../controllers/vendorController";
import { authenticate } from "../middleware/authMiddleware";
import { requiredRole } from "../middleware/roleMiddleware";
import { Role } from "../model/userModel";


const router = Router();