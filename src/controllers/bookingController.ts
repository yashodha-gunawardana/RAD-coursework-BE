import { Request, Response } from "express";
import Event from "../models/eventModel";
import Booking from "../models/bookingModel";
import { AuthRequest } from "../middleware/authMiddleware";


// new booking create function (event owner / admin only)
export const createBooking = async (req: AuthRequest, res: Response) => {
    try {

        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized"
            })
        }

        const { eventId, vendorId, notes } = req.body

        const event = await Event.findById(eventId)

        if (!event) {
            return res.status(404).json({
                message: "Event not found or not owned by you.."
            })
        }

        const newBooking = new Booking ({
            eventId,
            vendorId,
            userId: req.user._id,
            notes
        })
        await newBooking.save()

        const populatedBooking = await newBooking.populate(
            "vendorId",
            "name category priceRange image"
        )

        return res.status(201).json({
            message: "Your booking successfully..",
            data: populatedBooking
        })

    } catch (err: any) {
        return res.status(500).json({
            message: err?.message
        })

    }
}


// get all booking of user function (event owner / admin only)
export const getMyBooking = async (req: AuthRequest, res: Response) => {
    try {

        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized"
            })
        }

        const bookings = await Booking.find({ userId: req.user._id })
            .populate("eventId", "title date location")
            .populate("vendorId", "name category image")
            .sort({ createdAt: -1 })
         
        return res.status(200).json({
            count: bookings.length,
            data: bookings 
        })

    } catch (err: any) {
        return res.status(500).json({
            message: err?.message
        })
    }
}


// get booking by id function (event owner / admin only)
export const getBookingById = async (req: AuthRequest, res: Response) => {
    try {

        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized"
            })
        }

        const { id } = req.params

        const booking = await Booking.findOne({ _id: id, userId: req.user._id })
            .populate("eventId", "title date location")
            .populate("vendorId", "name category image")

        if (!booking) {
            return res.status(404).json({
                message: "Booking not found.."
            })
        }    

        return res.status(200).json({
            success: true,
            data: booking
        })
    } catch (err: any) {
        return res.status(500).json({
            message: err?.message
        })
    }
}


// update booking status function (event owner / admin only)
export const updateBooking = async (req: AuthRequest, res: Response) => {
    try {

        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized"
            })
        }

        const { id } = req.params // booking id
        const { status, notes } = req.body // new status

        const updated = await Booking.findOneAndUpdate({ id: id, userId: req.user._id}, { status, notes }, { new: true })

        if (!updated) {
            return res.status(404).json({
                message: "Booking not found.."
            })
        }

        return res.status(200).json({
            message: "Booking updated successfully..",
            data: updated
        })

    } catch (err: any) {
        return res.status(500).json({
            message: err?.message
        })
    }
}


// delete booking function (event owner / admin only)
export const deleteBooking = async (req: AuthRequest, res: Response) => {
    try {

        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized"
            })
        }

        const { id } = req.params

        const deleted = await Booking.findOneAndDelete({ _id: id, userId: req.user._id })

        if (!deleted) {
            return res.status(404).json({
                message: "Booking not found.."
            })
        }

        return res.status(200).json({
            message: "Booking deleted successfully.."
        })

    } catch (err: any) {
        return res.status(500).json({
            message: err?.message
        })
    }
}