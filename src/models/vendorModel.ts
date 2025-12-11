import mongoose, { Document, Schema } from "mongoose";

export enum VendorCategory {
    PHOTOGRAPY = "PHOTOGRAPY",
    CATERING = "CATERING",
    DECORATION = "DECORATION",
    DJ = "DJ",
    VENUE = "VENUE",
    MAKEUP = "MAKEUP",
    FLORIST = "FLORIST",
    OTHER = "OTHER",
}

// TypeScript structure
export interface IVendor extends Document {
    name: string
    category: VendorCategory
    contact: string
    priceRange: string
    description?: string
    image?: string
    isAvailable: boolean
    addedBy: mongoose.Types.ObjectId
    createdAt: Date
    updatedAt: Date
}

// Database structure
const vendorSchema = new Schema<IVendor> (
    {
        name: { type: String, required: true, trim: true },
        category: { type: String, enum: Object.values(VendorCategory), required: true },
        contact: { type: String, required: true },
        priceRange: { type: String, required: true },
        description: { type: String },
        image: { type: String },
        isAvailable: { type: Boolean, default: true },
        addedBy: { type: Schema.Types.ObjectId, ref: "User", required: true }
    },
    { timestamps: true }
)

export default mongoose.model<IVendor>("Vendor", vendorSchema)