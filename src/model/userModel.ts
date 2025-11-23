import mongoose, { Document, Schema } from "mongoose";

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

// TypeScript structure
export interface IUser extends Document {
    _id: mongoose.Types.ObjectId
    fullname: string
    email: string
    password: string
    address?: string
    phone?: string
    roles: Role[]  // array of roles assigned to user
    approved: Status
}

// Database structure
const userSchema = new Schema<IUser>(
    {
        fullname: { type: String, required: true },
        email: { type: String, unique: true, lowercase: true },
        password: { type: String, required: true },
        address: { type: String, required: true },
        phone: { type: String, required: true },
        roles: { type: [String], enum: Object.values(Role), default: [Role.USER] },
        approved: { type: String, enum: Object.values(Status), default: Status.PENDING }
    },
    { timestamps: true }
)

export const User = mongoose.model<IUser>("User", userSchema)