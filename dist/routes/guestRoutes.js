"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const guestController_1 = require("../controllers/guestController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const roleMiddleware_1 = require("../middleware/roleMiddleware");
const userModel_1 = require("../models/userModel");
const router = (0, express_1.Router)();
router.post("/", guestController_1.addGuest);
// owner only
router.get("/event/:id", authMiddleware_1.authenticate, (0, roleMiddleware_1.requiredRole)([userModel_1.Role.ADMIN, userModel_1.Role.USER]), guestController_1.getGuestByEvent);
// no login required
router.put("/rsvp", authMiddleware_1.authenticate, (0, roleMiddleware_1.requiredRole)([userModel_1.Role.ADMIN, userModel_1.Role.USER]), guestController_1.updateRSVP);
exports.default = router;
