"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllEventsForSelect = exports.deleteEvent = exports.updateEvent = exports.getEventById = exports.getAllEvents = exports.getMyEvents = exports.createEvent = void 0;
const eventModel_1 = __importDefault(require("../models/eventModel"));
const userModel_1 = require("../models/userModel");
function parseExtraItems(body) {
    if (!body.extraItems || !Array.isArray(body.extraItems))
        return [];
    return body.extraItems.map((item) => ({
        name: item.name?.trim(),
        unitPrice: Number(item.unitPrice) || 0,
        quantity: Number(item.quantity) || 1,
    }));
}
// create new event function (admin only)
const createEvent = async (req, res) => {
    try {
        /*if (!req.user?.roles.includes(Role.ADMIN)) {
            return res.status(403).json({ message: "Only admin can add events" });
        }*/
        const { title, type, date, time, location, description, status = "PLANNING", basePrice, isPackage = false } = req.body;
        const isAdmin = req.user?.roles.includes(userModel_1.Role.ADMIN);
        if (isPackage && !isAdmin) {
            return res.status(403).json({
                message: "Only admin can create packages"
            });
        }
        if (!title || !type || !date || !location || !basePrice) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        const extraItems = parseExtraItems(req.body);
        let image;
        if (req.file) {
            image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
        }
        const event = await eventModel_1.default.create({
            userId: req.user?._id,
            title: title.trim(),
            type,
            date: new Date(date),
            time: time || undefined,
            location: location.trim(),
            description: description?.trim(),
            basePrice: Number(basePrice),
            status,
            image,
            extraItems,
            isPackage,
            createdByAdmin: isAdmin
        });
        res.status(201).json({
            success: true,
            data: event,
        });
    }
    catch (err) {
        console.error("Create event error:", err);
        res.status(500).json({
            message: "Failed to create event"
        });
    }
};
exports.createEvent = createEvent;
// get own all events function
const getMyEvents = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit) || 6, 1);
        const skip = (page - 1) * limit;
        // Get filter parameters
        const searchTerm = req.query.search || '';
        const typeFilter = req.query.type || '';
        const statusFilter = req.query.status || '';
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({
                message: "User not authenticated"
            });
        }
        // Build query object
        const query = { userId };
        // Add search term filtering
        if (searchTerm) {
            query.$or = [
                { title: { $regex: searchTerm, $options: 'i' } },
                { location: { $regex: searchTerm, $options: 'i' } },
                { description: { $regex: searchTerm, $options: 'i' } }
            ];
        }
        // Add type filter
        if (typeFilter) {
            query.type = typeFilter;
        }
        // Add status filter
        if (statusFilter) {
            query.status = statusFilter;
        }
        const events = await eventModel_1.default.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const total = await eventModel_1.default.countDocuments(query);
        return res.status(200).json({
            success: true,
            page,
            limit,
            totalItems: total,
            totalPages: Math.ceil(total / limit),
            count: events.length,
            data: events,
        });
    }
    catch (err) {
        console.error("Get my events error:", err);
        res.status(500).json({
            message: err?.message
        });
    }
};
exports.getMyEvents = getMyEvents;
// get all event
const getAllEvents = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit) || 6, 1);
        const skip = (page - 1) * limit;
        const searchTerm = req.query.search || '';
        const typeFilter = req.query.type || '';
        const statusFilter = req.query.status || '';
        const query = {};
        if (searchTerm) {
            query.$or = [
                { title: { $regex: searchTerm, $options: 'i' } },
                { location: { $regex: searchTerm, $options: 'i' } },
                { description: { $regex: searchTerm, $options: 'i' } }
            ];
        }
        if (typeFilter) {
            query.type = typeFilter;
        }
        if (statusFilter) {
            query.status = statusFilter;
        }
        const events = await eventModel_1.default.find(query)
            .populate("userId", "name email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const total = await eventModel_1.default.countDocuments(query);
        res.status(200).json({
            success: true,
            page,
            limit,
            totalItems: total,
            totalPages: Math.ceil(total / limit),
            count: events.length,
            data: events
        });
    }
    catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};
exports.getAllEvents = getAllEvents;
// get event by id function (user or admin)
const getEventById = async (req, res) => {
    try {
        // retrieve event using id from url paramaeter
        const event = await eventModel_1.default.findById(req.params.id);
        if (!event) {
            return res.status(404).json({
                message: "Event not found.."
            });
        }
        const currentUserId = req.user?._id || req.user?.sub;
        const isOwner = event.userId.toString() === currentUserId?.toString();
        const isAdmin = req.user?.roles?.includes(userModel_1.Role.ADMIN);
        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                message: "Not authorized to access this event.."
            });
        }
        res.status(200).json({
            success: true,
            data: event
        });
    }
    catch (err) {
        res.status(500).json({
            message: err?.message
        });
    }
};
exports.getEventById = getEventById;
// update event function (admin only)
const updateEvent = async (req, res) => {
    try {
        /*if (!req.user?.roles.includes(Role.ADMIN)) {
            return res.status(403).json({ message: "Only admin can update events" });
        }*/
        const event = await eventModel_1.default.findById(req.params.id);
        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }
        const currentUserId = req.user?._id;
        const isOwner = event.userId.toString() === currentUserId?.toString();
        const isAdmin = req.user?.roles?.includes(userModel_1.Role.ADMIN);
        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                message: "Only owner or admin can update events"
            });
        }
        const updateData = {};
        if (req.body.title)
            updateData.title = req.body.title.trim();
        if (req.body.type)
            updateData.type = req.body.type;
        if (req.body.date)
            updateData.date = new Date(req.body.date);
        if (req.body.time)
            updateData.time = req.body.time;
        if (req.body.location)
            updateData.location = req.body.location.trim();
        if (req.body.description)
            updateData.description = req.body.description.trim();
        if (req.body.status)
            updateData.status = req.body.status;
        if (req.body.basePrice !== undefined)
            updateData.basePrice = Number(req.body.basePrice);
        const extraItems = parseExtraItems(req.body);
        updateData.extraItems = extraItems;
        if (req.body.imageRemoved === "true") {
            updateData.image = null;
        }
        if (req.file) {
            updateData.image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
        }
        const updated = await eventModel_1.default.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true });
        if (!updated) {
            return res.status(404).json({ message: "Event not found" });
        }
        res.json({ success: true, data: updated });
    }
    catch (err) {
        console.error("Update event error:", err);
        res.status(500).json({
            message: "Failed to update event"
        });
    }
};
exports.updateEvent = updateEvent;
// delete event function (admin)
/*export const deleteEvent = async (req: AuthRequest, res: Response) => {
    try {

        if (!req.user?.roles.includes(Role.ADMIN)) {
            return res.status(403).json({
                message: "Only admin can delete events.."
            })
        }

        const event = await Event.findById(req.params.id)

        if (!event) {
            return res.status(404).json({
                message: "Event not found.."
            });
        }

        await event.deleteOne()

        res.status(200).json({
            success: true,
            message: "Event deleted successfully.."
        })

    } catch (err: any) {
        res.status(500).json({
            message: err?.message
        })
    }
}*/
const deleteEvent = async (req, res) => {
    try {
        const event = await eventModel_1.default.findById(req.params.id);
        if (!event) {
            return res.status(404).json({
                message: "Event not found.."
            });
        }
        const currentUserId = req.user?._id;
        const isOwner = event.userId.toString() === currentUserId?.toString();
        const isAdmin = req.user?.roles?.includes(userModel_1.Role.ADMIN);
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: "Only owner or admin can delete events" });
        }
        await event.deleteOne();
        res.status(200).json({
            success: true,
            message: "Event deleted successfully.."
        });
    }
    catch (err) {
        res.status(500).json({
            message: err?.message
        });
    }
};
exports.deleteEvent = deleteEvent;
// all events for dropdown
const getAllEventsForSelect = async (req, res) => {
    try {
        if (!req.user?._id) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const events = await eventModel_1.default.find({
            userId: req.user._id,
            status: "PLANNING"
        })
            .select("_id title date location basePrice extraItems")
            .sort({ date: -1 });
        return res.status(200).json({
            success: true,
            count: events.length,
            data: events
        });
    }
    catch (err) {
        console.error("Get events for dropdown error:", err);
        res.status(500).json({
            message: err?.message
        });
    }
};
exports.getAllEventsForSelect = getAllEventsForSelect;
