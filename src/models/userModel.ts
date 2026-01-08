import mongoose, { Document, Schema } from "mongoose";

export enum Role {
    ADMIN = "ADMIN",
    VENDOR = "VENDOR",
    USER = "USER"
}

export enum VendorStatus {
    NOT_REQUESTED = "NOT_REQUESTED",
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
    roles: Role[]  // array of roles assigned to user
    vendorStatus: VendorStatus
    createdAt: Date
}

// Database structure
const userSchema = new Schema<IUser>(
    {
        fullname: { type: String, required: true },
        email: { type: String, unique: true, lowercase: true, required: true },
        password: { type: String, required: true },
        roles: { type: [String], enum: Object.values(Role), default: [Role.USER] },
        vendorStatus: { type: String, enum: Object.values(VendorStatus), default: VendorStatus.NOT_REQUESTED }
    },
    { timestamps: true }
)

export default mongoose.model<IUser>("User", userSchema)