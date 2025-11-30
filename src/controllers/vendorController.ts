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


// create a vendor function (only admin)
export const createVendor = async (req: AuthRequest, res: Response) => {
    try {
        const { name, category, contact, priceRange, description, image } = req.body

        if (!req.user?.roles?.includes("admin")) {
            return res.status(403).json({
                message: "Only admin can add vendors.."
            })
        }

    } catch (err) {

    }
}