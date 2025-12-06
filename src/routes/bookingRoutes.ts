import { Router } from "express";
import { createBooking, getMyBooking, getBookingById, updateBooking, deleteBooking } from "../controllers/bookingController";
import { authenticate } from "../middleware/authMiddleware";
import { requiredRole } from "../middleware/roleMiddleware";
import { Role } from "../model/userModel";


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


export default router