import { Request, Response } from "express";
import Event from "../model/eventModel";
import Booking from "../model/bookingModel";
import { AuthRequest } from "../middleware/authMiddleware";
import { count } from "console";
import { data } from "react-router-dom";


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

        const newBooking = new Booking ({
            eventId,
            vendorId,
            userId: req.user._id,
            notes
        })
        await newBooking.save()

        const populatedBooking = await newBooking.populate(
            "vendorTd",
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


// get own booking function 
export const getMyBooking = async (req: AuthRequest, res: Response) => {
    try {
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


// get booking by id function
export const getBookingById = async (req: AuthRequest, res: Response) => {

}


// update booking status function
export const updateBooking = async (req: AuthRequest, res: Response) => {
    try {
        const { status } = req.body // new status
        const { id } = req.params // booking id

        const updated = await Booking.findByIdAndUpdate({ id: id, userId: req.user._id}, { status }, { new: true })

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


// delete booking function
export const deleteBooking = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params

        const deleted = await Booking.findByIdAndDelete({ _id: id, userId: req.user._id })

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