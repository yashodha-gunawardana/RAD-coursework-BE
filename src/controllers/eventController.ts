import { Request, Response } from "express";
import Event, { IEvent, EventStatus } from "../models/eventModel";
import { AuthRequest } from "../middleware/authMiddleware";
import { uploadEventImage } from "../middleware/upload";
import { Role } from "../models/userModel";



function parseExtraItems(body: any): any[] {
    const items: any[] = []
    let index = 0;

    while (body[`extraItems[${index}][name]`] !== undefined) {
        const name = body[`extraItems[${index}][name]`]?.trim();
        if (name) {  // only add if name not empty
            items.push({
                name,
                unitPrice: Number(body[`extraItems[${index}][unitPrice]`]) || 0,
                quantity: Number(body[`extraItems[${index}][quantity]`]) || 1,
            })
        }
        index++;
    }
    return items
}

// create new event function (admin only)
export const createEvent = async (req: AuthRequest, res: Response) => {
    try {

        if (!req.user?.roles.includes(Role.ADMIN)) {
            return res.status(403).json({ message: "Only admin can add events" });
        }

        const {
            title,
            type,
            date,
            time,
            location,
            description,
            status = "PLANNING",
            basePrice,
        } = req.body;


        if (!title || !type || !date || !location || !basePrice) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const extraItems = parseExtraItems(req.body);

        let image: string | undefined;
            if (req.file) {
                image = `data:${req.file.mimetype};base64,${req.file.buffer.toString(
                     "base64"
                )}`
            }

        const event = await Event.create({
            userId: req.user._id,
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
        })

        res.status(201).json({
            success: true,
            data: event,
        })

    } catch (err: any) {
        console.error("Create event error:", err);
        res.status(500).json({ 
            message: "Failed to create event" 
        })
    }
}


// get own all events function
export const getMyEvents = async (req: AuthRequest, res: Response) => {
    try {

        const page = Math.max(parseInt(req.query.page as string) || 1, 1)
        const limit = 6
        const skip = (page - 1) * limit


        const userId = req.user?._id;

        const [events, total] = await Promise.all([
            Event.find({ userId })
                .sort({ date: -1 })
                .skip(skip)
                .limit(limit),

            Event.countDocuments({ userId }),
        ])

        res.status(200).json({
            success: true,
            page,
            limit,
            totalItems: total,
            totalPages: Math.ceil(total / limit),
            count: events.length,
            data: events,
        })

    } catch (err: any) {
        res.status(500).json({
            message: err?.message
        })

    }
}


// get event by id function (user or admin)
export const getEventById = async (req: AuthRequest, res: Response) => {
    try {
        // retrieve event using id from url paramaeter
        const event = await Event.findById(req.params.id)

        if (!event) {
            return res.status(404).json({
                message: "Event not found.."
            })
        }

        const currentUserId = req.user?._id || (req.user as any)?.sub;

        const isOwner = event.userId.toString() === currentUserId?.toString()
        const isAdmin = req.user?.roles?.includes(Role.ADMIN)

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                message: "Not authorized to access this event.."
            })
        }

        res.status(200).json({
            success: true,
            data: event
        })

    } catch (err: any) {
        res.status(500).json({
            message: err?.message
        })

    }
}


// update event function (admin only)
export const updateEvent = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user?.roles.includes(Role.ADMIN)) {
            return res.status(403).json({ message: "Only admin can update events" });
        }

        const updateData: any = {};

        if (req.body.title) updateData.title = req.body.title.trim();
        if (req.body.type) updateData.type = req.body.type;
        if (req.body.date) updateData.date = new Date(req.body.date);
        if (req.body.time) updateData.time = req.body.time;
        if (req.body.location) updateData.location = req.body.location.trim();
        if (req.body.description) updateData.description = req.body.description.trim();
        if (req.body.status) updateData.status = req.body.status;
        if (req.body.basePrice !== undefined)
            updateData.basePrice = Number(req.body.basePrice);

        const extraItems = parseExtraItems(req.body);
        if (extraItems.length) updateData.extraItems = extraItems;


        if (req.body.imageRemoved === "true") {
            updateData.image = null;
        }
    
        if (req.file) {
            updateData.image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
        }
   

        const updated = await Event.findByIdAndUpdate(
            req.params.id,
                { $set: updateData },
                { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Event not found" });
        }

        res.json({ success: true, data: updated });

    } catch (err) {
        console.error("Update event error:", err);
        res.status(500).json({ 
            message: "Failed to update event" 
        });
    }
}


// delete event function (admin)
export const deleteEvent = async (req: AuthRequest, res: Response) => {
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
}