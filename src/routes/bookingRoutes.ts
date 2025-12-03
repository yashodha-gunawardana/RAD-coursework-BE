import { Router } from "express";
import { createBooking, getMyBooking, updateBooking, deleteBooking } from "../controllers/bookingController";
import { authenticate } from "../middleware/authMiddleware";


const router = Router();


router
    .route("/")
    .post(authenticate, createBooking)
    .get(authenticate, getMyBooking)

router
    .route("/:id")
    .put(authenticate, updateBooking)
    .delete(authenticate, deleteBooking)
    

export default router