import { Router } from "express";
import { 
    createBooking, 
    getMyBooking, 
    getBookingById, 
    updateBooking, 
    deleteBooking,
    getVendorBookings,
    updateBookingStatus
} from "../controllers/bookingController";
import { authenticate } from "../middleware/authMiddleware";
import { requiredRole } from "../middleware/roleMiddleware";
import { Role } from "../models/userModel";


const router = Router();


router
    .route("/")
    .post(authenticate, requiredRole([Role.ADMIN, Role.USER]), createBooking)
    .get(authenticate, requiredRole([Role.ADMIN, Role.USER]), getMyBooking)

router
    .route("/:id")
    .get(authenticate, requiredRole([Role.ADMIN, Role.USER]), getBookingById)
    .put(authenticate, requiredRole([Role.ADMIN, Role.USER]), updateBooking)
    .delete(authenticate, requiredRole([Role.ADMIN, Role.USER]), deleteBooking)


// Vendor dashboard routes
router
    .get("/vendor/bookings", authenticate, requiredRole([Role.VENDOR]), getVendorBookings)
    .put("/vendor/bookings/:id/status", authenticate, requiredRole([Role.VENDOR, Role.ADMIN]), updateBookingStatus)



export default router