import mongoose, { Document, Schema } from "mongoose";

export enum Type {
    WEDDING = "WEDDING",
    BIRTHDAY = "BIRTHDAY",
    CONFERENCE = "CONFERENCE",
    CORPORATE = "CORPORATE",
    PARTY = "PARTY",
    OTHER = "OTHER"
}

export enum Status {
    PLANNING = "PLANNING",
    ONGOING = "ONGOING",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}

export interface IEvent extends Document {
    userId: mongoose.Types.ObjectId
    title: string
    type: Type
    date: Date
    time?: string
    location: string
    description?: string
    image?: string
    status: Status
    createdAt: Date
}

const eventSchema = new Schema<IEvent> (
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true, trim: true },
        type: { type: String, enum: Object.values(Type), required: true},
        date: { type: Date, required: true },
        time: { type: String },
        location: { type: String, required: true },
        description: { type: String },
        image: { type: String },
        status: { type: String, enum: Object.values(Status), default: Status.PLANNING }
    },
    

)