import { Document, Schema } from "mongoose";

export enum Role {
    ADMIN = "ADMIN",
    VENDOR = "VENDOR",
    USER = "USER"
}

export enum Status {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED"
}