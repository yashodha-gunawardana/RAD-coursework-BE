"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const eventController_1 = require("../controllers/eventController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const roleMiddleware_1 = require("../middleware/roleMiddleware");
const userModel_1 = require("../models/userModel");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
// router.post("/", authenticate, requiredRole([Role.ADMIN]), uploadImage, handleMulterError, createEvent)
router.post("/", authMiddleware_1.authenticate, upload_1.uploadImage, upload_1.handleMulterError, eventController_1.createEvent);
router.post("/test-upload", upload_1.uploadImage, (req, res) => {
    console.log("Test upload - body:", req.body);
    console.log("Test upload - file:", req.file);
    res.json({ body: req.body, file: req.file?.originalname });
});
router.get("/my", authMiddleware_1.authenticate, eventController_1.getMyEvents);
router.get("/all", authMiddleware_1.authenticate, (0, roleMiddleware_1.requiredRole)([userModel_1.Role.ADMIN]), eventController_1.getAllEvents);
router.get("/dropdown", authMiddleware_1.authenticate, eventController_1.getAllEventsForSelect);
router
    .route("/:id")
    .get(authMiddleware_1.authenticate, eventController_1.getEventById)
    .put(authMiddleware_1.authenticate, (0, roleMiddleware_1.requiredRole)([userModel_1.Role.ADMIN]), upload_1.uploadImage, eventController_1.updateEvent)
    .delete(authMiddleware_1.authenticate, (0, roleMiddleware_1.requiredRole)([userModel_1.Role.ADMIN]), eventController_1.deleteEvent);
exports.default = router;
