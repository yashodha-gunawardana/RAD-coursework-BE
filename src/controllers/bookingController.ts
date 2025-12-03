import { Request, Response } from "express";
import Event from "../model/eventModel";
import Booking from "../model/bookingModel";
import { AuthRequest } from "../middleware/authMiddleware";


// new booking create function
export const createBooking = async (req: AuthRequest, res: Response) => {
    try {
        const { eventId, vendorId, notes } = req.body

        const event = await Event.findOne({ _id: eventId, userId: req.user._id })

        if (!event) {
            return res.status(404).json({
                message: "Event not found or not owned by you.."
            })
        }
        
    } catch (err) {

    }
}