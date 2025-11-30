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

        const newVendor = new Vendor({
            name,
            category,
            contact,
            priceRange,
            description,
            image,
            addedBy: req.user._id // track which admin added the vendor
        })
        await newVendor.save()

        return res.status(201).json({
            message: "Vendor created successfully..",
            data: newVendor
        })

    } catch (err: any) {
        return res.status(500).json({
            message: err?.message
        })
    }
}


// update vendor function (only admin)'
export const updateVendor = async (req: AuthRequest, res: Response) => {
    try {

        if (!req.user?.roles?.includes("admin")) {
            return res.status(403).json({
                message: "Only admin can update vendors.."
            })
        }

        const vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, { new: true })

        if (!vendor) {
            return res.status(404).json({
                message: "Vendor not found.."
            })
        }

        return res.status(201).json({
            message: "Vendor updated successfully..",
            data: vendor
        })

    } catch (err) {

    }
}


// delete vendor function (only admin)
export const deleteVendor = async (req: AuthRequest, res: Response) => {
    try {

        if (!req.user?.roles?.includes("admin")) {
            return res.status(403).json({
                message: "Only admin can delete vendors.."
            })
        }

        const vendor = await Vendor.findById(req.params.id)

        if (!vendor) {
            return res.status(404).json({
                message: "Vendor not found.."
            })
        }

    } catch (err) {

    }
}