import { Request, Response } from "express";
import Guest, { RSVPStatus } from "../model/guestModel";
import Event from "../model/eventModel";


// add new guest function
export const addGuest = async (req: Request, res: Response) => {
    try {
        const { eventId, name, email, phone, plusOne, message } = req.body
        const userId = (req as any).user._id

        const event = await Event.findOne({ _id: eventId, userId })

        if (!event) {
            return res.status(404).json({
                message: "Event not found or you don't own it.."
            })
        }

        const newGuest = new Guest({
            eventId,
            name,
            email,
            phone,
            plusOne,
            message,
            rsvpStatus: RSVPStatus.PENDING
        })
        await newGuest.save()

        return res.status(201).json({
            message: "Guest added successfully..",
            data: newGuest
        })

    } catch (err: any) {
        return res.status(500).json({
            message: err?.message
        })

    }
}


// get guest by event function
export const getGuestByEvent = async (req: Request, res: Response) => {
    try {
        const { id: eventId } = req.params
        const userId = (req as any).user._id

        const event = await Event.findOne({ _id: eventId, userId })

        if (!event) {
            return res.status(404).json({
                message: "Event not found.."
            })
        }

        const guests = await Guest.find({ eventId }).sort({ createdAt: -1 })

        const stats = {
            total: guests.length,
            going: guests.filter(g => g.rsvpStatus === RSVPStatus.GOING).length,
            notGoing: guests.filter(g => g.rsvpStatus === RSVPStatus.NOT_GOING).length,
            maybe: guests.filter(g => g.rsvpStatus === RSVPStatus.MAYBE).length,
            pending: guests.filter(g => g.rsvpStatus === RSVPStatus.PENDING).length
        }

        return res.json({
            success: true,
            stats,
            data: guests
        })

    } catch (err: any) {
        return res.status(500).json({
            message: err?.message
        })
    }
}


// update RSVP function
export const updateRSVP = async (req: Request, res: Response) => {
    try {
        const { id: guestId } = req.params
        const { rsvpStatus, plusOne } = req.body

        const guest = await Guest.findByIdAndUpdate(guestId, { rsvpStatus, plusOne }, { new: true })

        if (!guest) {
            return res.status(404).json({
                message: "Guest not found.."
            })
        }

        return res.status(200).json({
            message: "RSVP updated..",
            data: guest
        })

    } catch (err: any) {
        return res.status(500).json({
            message: err?.message
        })
    }
}