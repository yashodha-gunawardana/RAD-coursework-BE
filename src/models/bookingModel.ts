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
    extraItems?: {
        name: string
        unitPrice: number
        quantity: number
    }[]
    totalPrice?: number
    
}

// Database structure
const bookingSchema = new Schema<IBooking> (
    {
        eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
        vendorId: { type: Schema.Types.ObjectId, ref: "Vendor", required: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        status: { type: String, enum: Object.values(BookingStatus), default: BookingStatus.PENDING },
        bookedAt: { type: Date, default: Date.now },  
        notes: String,
        extraItems: [
            {
                name: { type: String, required: true },
                unitPrice: { type: Number, required: true },
                quantity: { type: Number, required: true, default: 1 },
                _id: false
            }
        ],
        totalPrice: { type: Number, required: true, default: 0 }
    },
    { timestamps: true }
)
bookingSchema.index({ userId: 1, eventId: 1, vendorId: 1 }, { unique: true });

export default mongoose.model<IBooking>("Booking", bookingSchema)