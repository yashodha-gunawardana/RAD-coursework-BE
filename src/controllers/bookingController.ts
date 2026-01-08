import { Response } from "express";
import Event from "../models/eventModel";
import Booking, { BookingStatus }  from "../models/bookingModel";
import { AuthRequest } from "../middleware/authMiddleware";
import { Role } from "../models/userModel";
import Vendor from "../models/vendorModel";
import { sendEmail } from "../utils/email";


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

        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized"
            })
        }

        if (!req.user.roles.includes(Role.USER) &&
            !req.user.roles.includes(Role.ADMIN)) {

            return res.status(403).json({
                message: "Only users or admins can create bookings"
            })
        }

        const { eventId, vendorId, notes, extraItems: rawExtraItems } = req.body

        
        if (!eventId || !vendorId) 
        return res.status(400).json({ 
            message: "Missing required fields" 
        })

        const event = await Event.findById(eventId)
        
        if (!event) 
        return res.status(404).json({ 
            message: "Event not found" 
        })


        const vendor = await Vendor.findById(vendorId);
        if (!vendor) {
            return res.status(404).json({ 
                message: "Vendor not found" 
            });
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
            status: "PENDING",
            bookedAt: new Date()
        })

        await newBooking.save()


        await newBooking.populate("eventId", "title date location")
        await newBooking.populate("vendorId", "name category image")


        return res.status(201).json({
            message: "Your booking successfully..",
            data: newBooking
        })

    } catch (err: any) {
        console.error("Create booking error:", err)
        return res.status(500).json({
            message: err?.message || "Internal server error"
        })

    }
}


// get all booking of user function (event owner / admin only)
export const getMyBooking = async (req: AuthRequest, res: Response) => {
    try {

        const user = req.user;
        if (!user) {
            return res.status(401).json({ 
                message: "Unauthorized" 
            })
        }

        const query = user.roles.includes(Role.ADMIN)
            ? {} // all bookings
            : { userId: user._id } // only their bookings


        const bookings = await Booking.find(query)
            .populate("eventId", "title date location basePrice")
            .populate("vendorId", "name category image")
            .sort({ createdAt: -1 })


        return res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings,
        })

    } catch (err: any) {
        console.error("getMyBooking error:", err)
        return res.status(500).json({ 
            message: "Failed to fetch bookings" 
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

        const query = req.user.roles.includes(Role.ADMIN)
            ? { _id: id }
            : { _id: id, userId: req.user._id }


        const booking = await Booking.findOne(query)
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


// get all booking for admin
export const getAllBookings = async (req: AuthRequest, res: Response) => {
    try {

        console.log("getAllBookings called with query:", req.query)
        
        if (!req.user?.roles.includes(Role.ADMIN)) {
            return res.status(403).json({
                message: "Only admin can view all bookings"
            })
        }

        const page = Math.max(parseInt(req.query.page as string) || 1, 1)
        const limit = Math.max(parseInt(req.query.limit as string) || 6, 1)
        const skip = (page - 1) * limit


        const filter: any = {}

        if (req.query.status && req.query.status !== "all") {
            filter.status = req.query.status
        }

        const searchTerm = req.query.search as string;

         if (searchTerm) {
            const regex = { $regex: searchTerm, $options: "i" }
            filter.$or = [
                { notes: regex },
            ];
        }

        const totalItems = await Booking.countDocuments(filter)

        const pending = await Booking.countDocuments({ ...filter, status: "PENDING" })
        const confirmed = await Booking.countDocuments({ ...filter, status: "CONFIRMED" })
        const completed = await Booking.countDocuments({ ...filter, status: "COMPLETED" })
        const cancelled = await Booking.countDocuments({ ...filter, status: "CANCELLED" })


        // get all bookings first 
        const bookings = await Booking.find(filter)
            .populate("eventId", "title date location basePrice")
            .populate("vendorId", "name category image")
            .populate("userId", "fullname email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)


        return res.status(200).json({
            success: true,
            page,
            limit,
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
            count: bookings.length,
            stats: {
                totalBookings: totalItems,
                pending,
                confirmed,
                completed,
                cancelled
            },
            data: bookings
        })

    } catch (err: any) {
        console.error("Get all bookings error:", err)
        return res.status(500).json({
            message: err?.message || "Internal server error"
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

        if (req.user.roles.includes(Role.VENDOR)) {
            return res.status(403).json({
                message: "Vendors cannot update booking details"
            })
        }

        const { id } = req.params
        const { notes } = req.body

        // allows admins full access while restricting users to their own
        const query = req.user.roles?.includes(Role.ADMIN)
            ? { _id: id }
            : { _id: id, userId: req.user._id }


        const updated = await Booking.findOneAndUpdate(query, { notes }, { new: true })
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
        
            
        const deleted = await Booking.findOneAndDelete(query)
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
        
        console.log("getVendorBookings called")
        
        if (!req.user) {
            return res.status(401).json({ 
                message: "Unauthorized" 
            })
        }

        if (!req.user.roles.includes(Role.VENDOR)) {
            return res.status(403).json({
                message: "Only vendors can view vendor bookings"
            })
        }

        const vendor = await Vendor.findOne({ userId: req.user._id })
        console.log("Found by userId:", vendor?._id)
        

        if (!vendor) {
            return res.status(404).json({
                message: "Vendor profile not approved"
            })
        }
        

        console.log("Using vendor ID:", vendor._id)

        const bookings = await Booking.find({ vendorId: vendor._id })
            .populate({ path: "eventId", select: "title date location basePrice" })
            .populate({ path: "userId", select: "fullname email" })
            .sort({ createdAt: -1 })

        
        console.log("Found", bookings.length, "bookings")

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        })

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
        
        console.log("updateBookingStatus called")

        if (!req.user) {
            return res.status(401).json({ 
                message: "Unauthorized" 
            })
        }

        const bookingId = req.params.id
        const { status } = req.body;

        if (!Object.values(BookingStatus).includes(status)) {
            return res.status(400).json({ 
                message: "Invalid status" 
            })
        }

        let booking

        if (req.user.roles?.includes(Role.ADMIN)) {
            booking = await Booking.findById(bookingId)

        } else if (req.user.roles?.includes(Role.VENDOR)) {
            const vendor = await Vendor.findOne({ userId: req.user._id })

            if (!vendor) {
                return res.status(404).json({ 
                    message: "Vendor profile not found" 
                });
            }
            
            // find booking assigned to this vendor
            booking = await Booking.findOne({ 
                _id: bookingId, 
                vendorId: vendor._id
            })

        } else {
            return res.status(403).json({ 
                message: "Only vendors or admins can update booking status" 
            })
        }

        if (!booking) {
            return res.status(404).json({ 
                message: "Booking not found or not assigned to you" 
            })
        }

        booking.status = status
        await booking.save()

        try {
            const user = booking.userId as any
            const vendor = booking.vendorId as any

            if (status === BookingStatus.CONFIRMED) {
                await sendEmail(
                    user.email,
                    "Booking Confirmed",
                    `Hi ${user.fullname},\n\nYour booking for event "${booking.eventId}" has been CONFIRMED by vendor "${vendor.name}".`
                )

            } else if (status === BookingStatus.COMPLETED) {
                await sendEmail(
                    user.email,
                    "Booking Completed",
                    `Hi ${user.fullname},\n\nYour booking for event "${booking.eventId}" has been COMPLETED by vendor "${vendor.name}". Thank you for using our service!`
                )
            }

        } catch (err) {
            console.error("Booking status email failed:", err)
        }

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

