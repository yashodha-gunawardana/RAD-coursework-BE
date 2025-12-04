import mongoose, { Document, Schema } from "mongoose";


export enum RSVPStatus {
    PENDING = "PENDING",
    GOING = "GOING",
    NOT_GOING = "NOT_GOING",
    MAYBE = "MAYBE"
}

export interface IGuest extends Document {
    eventId: mongoose.Types.ObjectId
    name: string
    email: string
    phone?: string
    plusOne?: boolean
    rsvpStatus: RSVPStatus
    message?: string
}