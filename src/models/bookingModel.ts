import mongoose, { Document, Schema } from "mongoose";

export enum BookingStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    CANCELLED = "CANCELLED",
    COMPLETED = "COMPLETED"
}

// TypeScript structure
export interface IBooking extends Document {
    eventId: mongoose.Types.ObjectId
    vendorId: mongoose.Types.ObjectId
    userId: mongoose.Types.ObjectId
    status : BookingStatus
    bookedAt: Date
    notes?: string
}

// Database structure
const bookingSchema = new Schema<IBooking> (
    {
        eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
        vendorId: { type: Schema.Types.ObjectId, ref: "Vendor", required: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        status: { type: String, enum: Object.values(BookingStatus), default: BookingStatus.PENDING },
        notes: String
    },
    { timestamps: true }
)

export default mongoose.model<IBooking>("Booking", bookingSchema)