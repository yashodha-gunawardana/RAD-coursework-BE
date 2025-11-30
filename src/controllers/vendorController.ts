import { Request, Response } from "express";
import Vendor from "../model/vendorModel";
import { AuthRequest } from "../middleware/authMiddleware";


// get all vendors function (anyone)
export const getAllVendors = async (req: Request, res: Response) => {
    try {
        const vendors = await Vendor.find({ isAvailable: true })
            .select("-addedBy")
            .sort({ createdAt: -1 })

    } catch (err) {

    }
}