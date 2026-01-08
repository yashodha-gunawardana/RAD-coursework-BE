"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBookingStatus = exports.getVendorBookings = exports.deleteBooking = exports.updateBooking = exports.getAllBookings = exports.getBookingById = exports.getMyBooking = exports.createBooking = void 0;
const eventModel_1 = __importDefault(require("../models/eventModel"));
const bookingModel_1 = __importStar(require("../models/bookingModel"));
const userModel_1 = require("../models/userModel");
const vendorModel_1 = __importDefault(require("../models/vendorModel"));
const userModel_2 = __importDefault(require("../models/userModel"));
function parseExtraItems(body) {
    if (!body.extraItems || !Array.isArray(body.extraItems))
        return [];
    return body.extraItems.map((item) => ({
        name: item.name?.trim(),
        unitPrice: Number(item.unitPrice) || 0,
        quantity: Number(item.quantity) || 1,
    }));
}
// new booking create function (event owner / admin only)
const createBooking = async (req, res) => {
    try {
        const { eventId, vendorId, notes, extraItems: rawExtraItems } = req.body;
        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }
        if (!eventId || !vendorId)
            return res.status(400).json({
                message: "Missing required fields"
            });
        const event = await eventModel_1.default.findById(eventId);
        if (!event)
            return res.status(404).json({
                message: "Event not found"
            });
        const vendor = await vendorModel_1.default.findById(vendorId);
        if (!vendor) {
            return res.status(404).json({
                message: "Vendor not found"
            });
        }
        const extraItems = parseExtraItems({ extraItems: rawExtraItems });
        const extrasTotal = extraItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
        const totalPrice = event.basePrice + extrasTotal;
        const newBooking = new bookingModel_1.default({
            eventId,
            vendorId,
            userId: req.user._id,
            notes,
            extraItems,
            totalPrice,
            status: "PENDING",
            bookedAt: new Date()
        });
        await newBooking.save();
        await newBooking.populate("eventId", "title date location");
        await newBooking.populate("vendorId", "name category image");
        return res.status(201).json({
            message: "Your booking successfully..",
            data: newBooking
        });
    }
    catch (err) {
        console.error("Create booking error:", err);
        return res.status(500).json({
            message: err?.message || "Internal server error"
        });
    }
};
exports.createBooking = createBooking;
// get all booking of user function (event owner / admin only)
// controllers/bookingController.ts → getMyBooking
const getMyBooking = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        // Commit: Admin sees ALL bookings, regular user sees only their own
        const query = user.roles.includes(userModel_1.Role.ADMIN)
            ? {} // Admin: no filter → all bookings
            : { userId: user._id }; // User: only their bookings
        const bookings = await bookingModel_1.default.find(query)
            .populate("eventId", "title date location basePrice")
            .populate("vendorId", "name category image")
            .sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings,
        });
    }
    catch (err) {
        console.error("getMyBooking error:", err);
        return res.status(500).json({ message: "Failed to fetch bookings" });
    }
};
exports.getMyBooking = getMyBooking;
// get booking by id function (event owner / admin only)
const getBookingById = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }
        const { id } = req.params;
        const booking = await bookingModel_1.default.findOne({ _id: id, userId: req.user._id })
            .populate("eventId", "title date location")
            .populate("vendorId", "name category image");
        if (!booking) {
            return res.status(404).json({
                message: "Booking not found.."
            });
        }
        return res.status(200).json({
            success: true,
            data: booking
        });
    }
    catch (err) {
        return res.status(500).json({
            message: err?.message
        });
    }
};
exports.getBookingById = getBookingById;
// Add this function to your bookingController.ts
/*export const getAllBookings = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user?.roles.includes(Role.ADMIN)) {
            return res.status(403).json({
                message: "Only admin can view all bookings"
            });
        }

        const page = Math.max(parseInt(req.query.page as string) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit as string) || 10, 1);
        const skip = (page - 1) * limit;

        const filter: any = {};

        if (req.query.status) {
            filter.status = req.query.status;
        }

        if (req.query.search) {
            filter.$or = [
                { customerName: { $regex: req.query.search, $options: "i" } },
                { customerEmail: { $regex: req.query.search, $options: "i" } },
                { 'event.title': { $regex: req.query.search, $options: "i" } }
            ];
        }

        const bookings = await Booking.find(filter)
            .populate("eventId", "title date location")
            .populate("vendorId", "name category")
            .populate("userId", "name email")
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip);

        const total = await Booking.countDocuments(filter);

        return res.status(200).json({
            success: true,
            page,
            limit,
            totalItems: total,
            totalPages: Math.ceil(total / limit),
            count: bookings.length,
            data: bookings
        });

    } catch (err: any) {
        console.error("Get all bookings error:", err);
        return res.status(500).json({
            message: err?.message || "Internal server error"
        });
    }
};*/
// SIMPLER VERSION of getAllBookings function
/*export const getAllBookings = async (req: AuthRequest, res: Response) => {
    try {
        console.log("getAllBookings called with query:", req.query);
        
        if (!req.user?.roles.includes(Role.ADMIN)) {
            return res.status(403).json({
                message: "Only admin can view all bookings"
            });
        }

        const page = Math.max(parseInt(req.query.page as string) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit as string) || 10, 1);
        const skip = (page - 1) * limit;

        const filter: any = {};

        if (req.query.status && req.query.status !== "all") {
            filter.status = req.query.status;
        }

        // Simple search - we'll filter after populating
        const searchTerm = req.query.search as string;

        // Get bookings with pagination
        const bookingsQuery = Booking.find(filter)
            .populate("eventId", "title date location basePrice")
            .populate("vendorId", "name category image")
            .populate("userId", "fullname email")
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip);

        const [bookings, total] = await Promise.all([
            bookingsQuery,
            Booking.countDocuments(filter)
        ]);

        // Filter by search term if provided
        let filteredBookings = bookings;
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filteredBookings = bookings.filter(booking => {
                const eventTitle = booking.eventId?.title?.toLowerCase() || '';
                const vendorName = booking.vendorId?.name?.toLowerCase() || '';
                const userName = booking.userId?.fullname?.toLowerCase() || '';
                const notes = booking.notes?.toLowerCase() || '';
                
                return eventTitle.includes(term) ||
                       vendorName.includes(term) ||
                       userName.includes(term) ||
                       notes.includes(term);
            });
        }

        return res.status(200).json({
            success: true,
            page,
            limit,
            totalItems: total,
            totalPages: Math.ceil(total / limit),
            count: filteredBookings.length,
            data: filteredBookings
        });

    } catch (err: any) {
        console.error("Get all bookings error:", err);
        console.error("Error stack:", err.stack);
        return res.status(500).json({
            message: err?.message || "Internal server error",
            error: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};*/
const getAllBookings = async (req, res) => {
    try {
        console.log("getAllBookings called with query:", req.query);
        if (!req.user?.roles.includes(userModel_1.Role.ADMIN)) {
            return res.status(403).json({
                message: "Only admin can view all bookings"
            });
        }
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit) || 10, 1);
        const skip = (page - 1) * limit;
        const filter = {};
        if (req.query.status && req.query.status !== "all") {
            filter.status = req.query.status;
        }
        const searchTerm = req.query.search;
        // Get all bookings first (we'll filter after populating)
        const bookings = await bookingModel_1.default.find(filter)
            .populate("eventId", "title date location basePrice")
            .populate("vendorId", "name category image")
            .populate("userId", "fullname email")
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip);
        const total = await bookingModel_1.default.countDocuments(filter);
        // Filter by search term if provided
        let filteredBookings = bookings;
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filteredBookings = bookings.filter(booking => {
                // Get values safely with fallbacks
                const eventTitle = (booking.eventId?.title || '').toLowerCase();
                const vendorName = (booking.vendorId?.name || '').toLowerCase();
                const userName = (booking.userId?.fullname || '').toLowerCase();
                const notes = (booking.notes || '').toLowerCase();
                // Check if search term matches any of the fields
                const matchesEventTitle = eventTitle.includes(term);
                const matchesVendorName = vendorName.includes(term);
                const matchesUserName = userName.includes(term);
                const matchesNotes = notes.includes(term);
                // Also check booking ID
                const matchesBookingId = booking._id.toString().includes(term);
                return matchesEventTitle ||
                    matchesVendorName ||
                    matchesUserName ||
                    matchesNotes ||
                    matchesBookingId;
            });
        }
        return res.status(200).json({
            success: true,
            page,
            limit,
            totalItems: total,
            totalPages: Math.ceil(total / limit),
            count: filteredBookings.length,
            data: filteredBookings
        });
    }
    catch (err) {
        console.error("Get all bookings error:", err);
        return res.status(500).json({
            message: err?.message || "Internal server error"
        });
    }
};
exports.getAllBookings = getAllBookings;
// update booking status function (event owner / admin only)
const updateBooking = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }
        const { id } = req.params;
        const { status, notes } = req.body;
        const query = req.user.roles?.includes(userModel_1.Role.ADMIN)
            ? { _id: id }
            : { _id: id, userId: req.user._id };
        const updated = await bookingModel_1.default.findOneAndUpdate({ _id: id, userId: req.user._id }, { status, notes }, { new: true });
        if (!updated) {
            return res.status(404).json({
                message: "Booking not found.."
            });
        }
        return res.status(200).json({
            message: "Booking updated successfully..",
            data: updated
        });
    }
    catch (err) {
        return res.status(500).json({
            message: err?.message
        });
    }
};
exports.updateBooking = updateBooking;
// delete booking function (event owner / admin only)
const deleteBooking = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }
        const { id } = req.params;
        const query = req.user.roles?.includes(userModel_1.Role.ADMIN)
            ? { _id: id }
            : { _id: id, userId: req.user._id };
        const deleted = await bookingModel_1.default.findOneAndDelete({ _id: id, userId: req.user._id });
        if (!deleted) {
            return res.status(404).json({
                message: "Booking not found.."
            });
        }
        return res.status(200).json({
            message: "Booking deleted successfully.."
        });
    }
    catch (err) {
        return res.status(500).json({
            message: err?.message
        });
    }
};
exports.deleteBooking = deleteBooking;
// get bookings assigned to logged-in vendor
const getVendorBookings = async (req, res) => {
    try {
        console.log("getVendorBookings called");
        console.log("User ID:", req.user?._id);
        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }
        // Check if user has VENDOR role
        if (!req.user.roles.includes(userModel_1.Role.VENDOR)) {
            return res.status(403).json({
                message: "Only vendors can view vendor bookings"
            });
        }
        let vendor = await vendorModel_1.default.findOne({ userId: req.user._id });
        console.log("Found by userId:", vendor?._id);
        if (!vendor) {
            vendor = await vendorModel_1.default.findOne({ addedBy: req.user._id });
            console.log("Found by addedBy:", vendor?._id);
        }
        if (!vendor) {
            console.log("Vendor profile not found, creating one...");
            const user = await userModel_2.default.findById(req.user._id);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            // Create vendor profile automatically
            vendor = new vendorModel_1.default({
                name: user.fullname,
                category: "OTHER",
                contact: user.email,
                priceRange: "Contact for pricing",
                description: "Auto-created vendor profile",
                isAvailable: true,
                addedBy: req.user._id, // Self as addedBy for now
                userId: req.user._id
            });
            await vendor.save();
            console.log("Auto-created vendor profile:", vendor._id);
        }
        console.log("Using vendor ID:", vendor._id);
        const bookings = await bookingModel_1.default.find({ vendorId: vendor._id })
            .populate({ path: "eventId", select: "title date location basePrice" })
            .populate({ path: "userId", select: "fullname email" })
            .sort({ createdAt: -1 });
        console.log("Found", bookings.length, "bookings");
        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    }
    catch (err) {
        console.error("Get vendor bookings error:", err);
        res.status(500).json({
            message: err?.message
        });
    }
};
exports.getVendorBookings = getVendorBookings;
// update status of a booking (vendor only)
/*export const updateBookingStatus = async (req: AuthRequest, res: Response) => {
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
}*/
// update status of a booking (vendor only)
/*export const updateBookingStatus = async (req: AuthRequest, res: Response) => {
    try {
        
                console.log("updateBookingStatus called");

        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        const bookingId = req.params.id;
        const { status } = req.body;

        if (!Object.values(BookingStatus).includes(status)) {
            return res.status(400).json({
                message: "Invalid status"
            });
        }

        let booking;

        if (req.user.roles?.includes(Role.ADMIN)) {
            // Admin can update any booking
            booking = await Booking.findById(bookingId);
        } else if (req.user.roles?.includes(Role.VENDOR)) {
            // Vendor can only update their own bookings
            // First, find the vendor profile
            let vendor = await Vendor.findOne({ userId: req.user._id });
            if (!vendor) {
                vendor = await Vendor.findOne({ addedBy: req.user._id });
            }
            
            if (!vendor) {
                return res.status(404).json({
                    message: "Vendor profile not found"
                });
            }
            
            // Find booking assigned to this vendor
            booking = await Booking.findOne({
                _id: bookingId,
                vendorId: vendor._id
            });
        } else {
            return res.status(403).json({
                message: "Only vendors or admins can update booking status"
            });
        }

        if (!booking) {
            return res.status(404).json({
                message: "Booking not found or not assigned to you"
            });
        }

        booking.status = status;
        await booking.save();

        res.status(200).json({
            success: true,
            message: "Booking status updated successfully",
            data: booking
        });

    } catch (err: any) {
        console.error("Update booking status error:", err);
        res.status(500).json({
            message: err?.message
        });
    }
};*/
const updateBookingStatus = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const bookingId = req.params.id;
        const { status } = req.body;
        // Validate status
        if (!Object.values(bookingModel_1.BookingStatus).includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }
        // Find vendor profile
        const vendor = await vendorModel_1.default.findOne({ userId: req.user._id });
        if (!vendor) {
            return res.status(404).json({ message: "Vendor profile not found" });
        }
        // Find booking assigned to this vendor
        const booking = await bookingModel_1.default.findOne({
            _id: bookingId,
            vendorId: vendor._id
        });
        if (!booking) {
            return res.status(404).json({
                message: "Booking not found or not assigned to you"
            });
        }
        // Update status
        booking.status = status;
        // Optional: Add timestamps for status changes
        if (status === bookingModel_1.BookingStatus.CONFIRMED) {
            booking.confirmedAt = new Date();
        }
        else if (status === bookingModel_1.BookingStatus.COMPLETED) {
            booking.completedAt = new Date();
        }
        await booking.save();
        return res.status(200).json({
            success: true,
            message: `Booking status updated to ${status}`,
            data: booking
        });
    }
    catch (err) {
        console.error("Update booking status error:", err);
        return res.status(500).json({ message: err?.message });
    }
};
exports.updateBookingStatus = updateBookingStatus;
