import { Router } from "express";
import { 
    createBooking, 
    getMyBooking, 
    getBookingById, 
    updateBooking, 
    deleteBooking,
    getVendorBookings,
    updateBookingStatus,
    getAllBookings
} from "../controllers/bookingController";
import { authenticate } from "../middleware/authMiddleware";
import { requiredRole } from "../middleware/roleMiddleware";
import { Role } from "../models/userModel";


const router = Router();


router.get("/all", authenticate, requiredRole([Role.ADMIN]), getAllBookings)

// vendor dashboard routes
router.get("/vendor/my-bookings", authenticate, requiredRole([Role.VENDOR]), getVendorBookings)
router.put("/vendor/:id/status", authenticate, requiredRole([Role.VENDOR, Role.ADMIN]), updateBookingStatus)


router
    .route("/")
    .post(authenticate, requiredRole([Role.ADMIN, Role.USER]), createBooking)
    .get(authenticate, requiredRole([Role.ADMIN, Role.USER]), getMyBooking)

router
    .route("/:id")
    .get(authenticate, requiredRole([Role.ADMIN, Role.USER]), getBookingById)
    .put(authenticate, requiredRole([Role.ADMIN, Role.USER]), updateBooking)
    .delete(authenticate, requiredRole([Role.ADMIN, Role.USER]), deleteBooking)


export default router