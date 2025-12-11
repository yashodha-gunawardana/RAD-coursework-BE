import mongoose, { Document, Schema } from "mongoose";

export enum EventType {
    WEDDING = "WEDDING",
    BIRTHDAY = "BIRTHDAY",
    CONFERENCE = "CONFERENCE",
    CORPORATE = "CORPORATE",
    PARTY = "PARTY",
    OTHER = "OTHER",
}

export enum EventStatus {
    PLANNING = "PLANNING",
    ONGOING = "ONGOING",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
}

// TypeScript structure
export interface IEvent extends Document {
    userId: mongoose.Types.ObjectId
    title: string
    type: EventType
    date: Date
    time?: string
    location: string
    description?: string
    image?: string
    basePrice: number
    extraItems?: {
        name: string
        unitPrice: number
        quantity?: number
    }[];
    status: EventStatus
    createdAt: Date
    updatedAt: Date
}

// Database structure for event
const eventSchema = new Schema<IEvent> (
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true, trim: true },
        type: { type: String, enum: Object.values(EventType), required: true},
        date: { type: Date, required: true },
        time: { type: String },
        location: { type: String, required: true },
        description: { type: String },
        image: { type: String },
        basePrice: { type: Number, required: true },
        extraItems: [
            {
                name : { type: String, required: true },
                unitPrice: { type: Number, required: true },
                quantity: { type: Number, default: 1 }
            }
        ],
        status: { type: String, enum: Object.values(EventStatus), default: EventStatus.PLANNING }
    },
    { timestamps: true }

)

export default mongoose.model<IEvent>('Event', eventSchema)