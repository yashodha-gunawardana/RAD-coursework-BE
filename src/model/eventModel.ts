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
    
)