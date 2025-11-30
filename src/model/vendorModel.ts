import mongoose, { Document, Schema } from "mongoose";

export enum VendorCategory {
    PHOTOGRAPY = "PHOTOGRAPY",
    CATERING = "CATERING",
    DECORATION = "DECORATION",
    DJ = "DJ",
    VENUE = "VENUE",
    MAKEUP = "MAKEUP",
    FLORIST = "FLORIST",
    OTHER = "OTHER"
}

export interface IVendor extends Document {
    name: string
    category: VendorCategory
    contact: string
    priceRange: string
    description?: string
    image?: string
    isAvailable: boolean
    addedBy: mongoose.Types.ObjectId
}