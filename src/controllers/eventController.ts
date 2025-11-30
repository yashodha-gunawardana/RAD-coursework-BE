import { Request, Response } from "express";
import Event, { IEvent, Status } from "../model/eventModel";
import { AuthRequest } from "../middleware/authMiddleware";


// create new event function
export const createEvent = async (req: AuthRequest, res: Response) => {
    try {
        const { title, type, date, time, location, description, image } = req.body

        // new Event object based on req data
        const newEvent = new Event({
            userId: req.user._id, // userId comes from logged-in user (JWT)
            title,
            type,
            date,
            time,
            location,
            description,
            image,
            status: Status.PLANNING,
        })
        await newEvent.save()

        res.status(201).json({
            message: "Event created successfully..",
            event: newEvent
        })

    } catch (err: any) {
        res.status(500).json({
            message: err?.message
        })
    }
}

// get all events function
export const getMyEvents = async (req: AuthRequest, res: Response) => {
    try {
        // fetch all event records from db
        const events = await Event.find({ userId: req.user._id }).sort({ date: -1 })
        res.status(200).json(events)

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

        const isOwner = event.userId.toString() === req.user._id.toString()
        const isAdmin = req.user.roles?.includes("admin")

        if (!isOwner && !isAdmin) {
            res.status(403).json({
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

// update event function (user or admin)
export const updateEvent = async (req: AuthRequest, res: Response) => {
    try {
        const event = await Event.findById(req.params.id)
        
        if (!event) {
            return res.status(404).json({
                message: "Event not found.."
            })
        }

        const isOwner = event.userId.toString() === req.user._id.toString()
        const isAdmin = req.user.roles?.includes("admin")

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                message: "Not authorized to update this event.."
            })
        }

        const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true })

        res.status(200).json({
            success: true,
            data: updatedEvent
        })

    } catch (err: any) {
        res.status(500).json({
            message: err?.message
        })

    }
}

// delete event function (user or admin)
export const deleteEvent = async (req: AuthRequest, res: Response) => {
    try {
        const event = await Event.findById(req.params.id)

        if (!event) {
            return res.status(404).json({
                message: "Event not found.."
            });
        }

        const isOwner = event.userId.toString() === req.user._id.toString()
        const isAdmin = req.user.roles?.includes("admin")

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                message: "Not authorized to delete this event"
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