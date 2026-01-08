"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bookingController_1 = require("../controllers/bookingController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const roleMiddleware_1 = require("../middleware/roleMiddleware");
const userModel_1 = require("../models/userModel");
const router = (0, express_1.Router)();
router.get("/all", authMiddleware_1.authenticate, (0, roleMiddleware_1.requiredRole)([userModel_1.Role.ADMIN]), bookingController_1.getAllBookings);
// Vendor dashboard routes
router.get("/vendor/my-bookings", authMiddleware_1.authenticate, (0, roleMiddleware_1.requiredRole)([userModel_1.Role.VENDOR]), bookingController_1.getVendorBookings);
router.put("/vendor/:id/status", authMiddleware_1.authenticate, (0, roleMiddleware_1.requiredRole)([userModel_1.Role.VENDOR, userModel_1.Role.ADMIN]), bookingController_1.updateBookingStatus);
router
    .route("/")
    .post(authMiddleware_1.authenticate, (0, roleMiddleware_1.requiredRole)([userModel_1.Role.ADMIN, userModel_1.Role.USER]), bookingController_1.createBooking)
    .get(authMiddleware_1.authenticate, (0, roleMiddleware_1.requiredRole)([userModel_1.Role.ADMIN, userModel_1.Role.USER]), bookingController_1.getMyBooking);
router
    .route("/:id")
    .get(authMiddleware_1.authenticate, (0, roleMiddleware_1.requiredRole)([userModel_1.Role.ADMIN, userModel_1.Role.USER]), bookingController_1.getBookingById)
    .put(authMiddleware_1.authenticate, (0, roleMiddleware_1.requiredRole)([userModel_1.Role.ADMIN, userModel_1.Role.USER]), bookingController_1.updateBooking)
    .delete(authMiddleware_1.authenticate, (0, roleMiddleware_1.requiredRole)([userModel_1.Role.ADMIN, userModel_1.Role.USER]), bookingController_1.deleteBooking);
exports.default = router;
