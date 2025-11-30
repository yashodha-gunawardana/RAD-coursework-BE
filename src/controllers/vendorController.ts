import { Request, Response } from "express";
import Vendor from "../model/vendorModel";
import { AuthRequest } from "../middleware/authMiddleware";
import { count } from "console";


// get all vendors function (anyone)
export const getAllVendors = async (req: Request, res: Response) => {
    try {
        const vendors = await Vendor.find({ isAvailable: true })
            .select("-addedBy")
            .sort({ createdAt: -1 })

        return res.status(200).json({
            count: vendors.length,
            data: vendors
        })    

    } catch (err: any) {
        return res.status(500).json({
            message: err?.message
        })
    }
}