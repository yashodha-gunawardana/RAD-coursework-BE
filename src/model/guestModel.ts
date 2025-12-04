import mongoose, { Document, Schema } from "mongoose";


export enum RSVPStatus {
    PENDING = "PENDING",
    GOING = "GOING",
    NOT_GOING = "NOT_GOING",
    MAYBE = "MAYBE"
}

// TypeScript structure
export interface IGuest extends Document {
    eventId: mongoose.Types.ObjectId
    name: string
    email: string
    phone?: string
    plusOne?: boolean
    rsvpStatus: RSVPStatus
    message?: string
}

// database structure
const guestSchema = new Schema<IGuest> (
    {
        eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String },
        plusOne: { type: Boolean, default: false },
        rsvpStatus: { type: String, enum: Object.values(RSVPStatus), default: RSVPStatus.PENDING },
        message: String
    },
    { timestamps: true }
)