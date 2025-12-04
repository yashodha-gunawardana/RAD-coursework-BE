import mongoose, { Document, Schema } from "mongoose";


export enum RSVPStatus {
    PENDING = "PENDING",
    GOING = "GOING",
    NOT_GOING = "NOT_GOING",
    MAYBE = "MAYBE"
}