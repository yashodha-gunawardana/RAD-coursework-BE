import { Request, Response } from "express";
import Event from "../models/eventModel";
import Booking, { BookingStatus }  from "../models/bookingModel";
import { AuthRequest } from "../middleware/authMiddleware";
import { Role } from "../models/userModel";


function parseExtraItems(body: any): any[] {
    if (!body.extraItems || !Array.isArray(body.extraItems)) return []
    return body.extraItems.map((item: any) => ({
        name: item.name?.trim(),
        unitPrice: Number(item.unitPrice) || 0,
        quantity: Number(item.quantity) || 1,
    }))
}


// new booking create function (event owner / admin only)
export const createBooking = async (req: AuthRequest, res: Response) => {
    try {

        const { eventId, vendorId, notes, extraItems: rawExtraItems } = req.body

        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized"
            })
        }

        if (!eventId || !vendorId) 
        return res.status(400).json({ 
            message: "Missing required fields" 
        })

        const event = await Event.findById(eventId)
        
        if (!event) 
        return res.status(404).json({ 
            message: "Event not found" 
        })


        if (!event) {
            return res.status(404).json({
                message: "Event not found or not owned by you.."
            })
        }

        const extraItems = parseExtraItems({ extraItems: rawExtraItems })

        const extrasTotal = extraItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
        const totalPrice = event.basePrice + extrasTotal

        const newBooking = new Booking ({
            eventId,
            vendorId,
            userId: req.user._id,
            notes,
            extraItems,
            totalPrice,
            status:BookingStatus.PENDING,
            bookedAt: new Date()
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

        const query = req.user.roles?.includes(Role.ADMIN) 
            ? {}  // all bookings
            : { userId: req.user._id }

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

        const updated = await Booking.findOneAndUpdate({ _id: id, userId: req.user._id}, { status, notes }, { new: true })

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

        const query = req.user.roles?.includes(Role.ADMIN)
            ? { _id: id }
            : { _id: id, userId: req.user._id }

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


// get bookings assigned to logged-in vendor
export const getVendorBookings = async (req: AuthRequest, res: Response) => {
    try {

        if (!req.user) {
            return res.status(401).json({ 
                message: "Unauthorized" 
            })
        }

        const vendorId = req.user._id

        const bookings = await Booking.find({ vendorId })
            .populate({ path: "eventId", select: "title date location" })
            .populate({ path: "userId", select: "name email" })
            .sort({ createdAt: -1 })

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });

    } catch (err: any) {
        console.error("Get vendor bookings error:", err)
        res.status(500).json({ 
            message: err?.message 
        })
    }
}

// update status of a booking (vendor only)
export const updateBookingStatus = async (req: AuthRequest, res: Response) => {
    try {
        
        if (!req.user) {
            return res.status(401).json({ 
                message: "Unauthorized" 
            })
        }

        const bookingId = req.params.id
        const { status } = req.body

        if (!Object.values(BookingStatus).includes(status)) {
            return res.status(400).json({ 
                message: "Invalid status" 
            })
        }

        let booking;

        if (req.user.roles?.includes(Role.ADMIN)) {
            booking = await Booking.findById(bookingId)

        } else {
            booking = await Booking.findOne({ _id: bookingId, vendorId: req.user._id })
        }

        if (!booking) {
            return res.status(404).json({ 
                message: "Booking not found or not assigned to you" 
            })
        }

        booking.status = status
        await booking.save()

        res.status(200).json({
            success: true,
            message: "Booking status updated successfully",
            data: booking
        })

    } catch (err: any) {
        console.error("Update booking status error:", err)
        res.status(500).json({ 
            message: err?.message 
        })
    }
}