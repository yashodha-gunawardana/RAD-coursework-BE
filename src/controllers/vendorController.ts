import { Request, Response } from "express";
import Vendor from "../models/vendorModel";
import { AuthRequest } from "../middleware/authMiddleware";
import { Role } from "../models/userModel";


// create a vendor function (only admin)
export const createVendor = async (req: AuthRequest, res: Response) => {
    try {

        if (!req.user?.roles.includes(Role.ADMIN)) {
            return res.status(403).json({
                message: "Only admin can add vendors.."
            })
        }

        const { name, category, contact, priceRange, description, isAvailable } = req.body

        if (!name || !category || !contact || !priceRange) {
            return res.status(400).json({
                message: "Required fields: name, category, contact, priceRange"
            })
        }


        let image: string | undefined
        if (req.file) {
            image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`
        }

        const newVendor = new Vendor({
            name,
            category,
            contact,
            priceRange,
            description:description || undefined,
            image,
            isAvailable: isAvailable !== undefined
                ? isAvailable === "true" || isAvailable === true
                : true,
            addedBy: req.user._id // track which admin added the vendor
        })
        await newVendor.save()

        return res.status(201).json({
            message: "Vendor created successfully..",
            data: newVendor
        })

    } catch (err: any) {
        console.error("Create vendor: ", err)
        return res.status(500).json({
            message: err?.message
        })
    }
}


// get all vendors function (public)
export const getAllVendors = async (req: AuthRequest, res: Response) => {
    try {

        const page = Math.max(parseInt(req.query.page as string) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit as string) || 6, 1);
        const skip = (page - 1) * limit;


        const filter: any = {};

        if (req.query.search) {
            filter.$or = [
                { name: { $regex: req.query.search, $options: "i" } },
                { contact: { $regex: req.query.search, $options: "i" } },
                { description: { $regex: req.query.search, $options: "i" } },
            ]
        }

        if (req.query.category) {
            filter.category = req.query.category
        }

        if (req.query.isAvailable !== undefined) {
            filter.isAvailable = req.query.isAvailable === "true"
        }
    
        const vendors = await Vendor.find(filter)
            .select("-addedBy")
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip)

        
        const total = await Vendor.countDocuments(filter)

        return res.status(200).json({
            success: true,
            page,
            limit,
            totalItems: total,
            totalPages: Math.ceil(total / limit),
            count: vendors.length,
            data: vendors
        })    

    } catch (err: any) {
        console.error("Get all vendors error:", err)
        return res.status(500).json({
            message: err?.message
        })
    }
}


// get vendor by id function (public)
export const getVendorById = async (req: AuthRequest, res: Response) => {
    try {
        const vendor = await Vendor.findById(req.params.id).select("-addedBy")

        if (!vendor) {
            return res.status(404).json({
                message: "Vendor not found.."
            })
        }

        return res.status(200).json({
            success: true,
            data: vendor
        })

    } catch (err: any) {
        console.error("Get vendor by ID error:", err)
        return res.status(500).json({
            message: err?.message
        })
    }
}


// update vendor function (only admin)'
export const updateVendor = async (req: AuthRequest, res: Response) => {
    try {

        if (!req.user?.roles?.includes(Role.ADMIN)) {
            return res.status(403).json({
                message: "Only admin can update vendors.."
            })
        }

        // find vendor by id
        const vendor = await Vendor.findById(req.params.id)

        if (!vendor) {
            return res.status(404).json({
                message: "Vendor not found.."
            })
        }

        const { name, category, contact, priceRange, description, isAvailable, imageRemoved } = req.body

        if (name !== undefined) vendor.name = name
        if (category !== undefined) vendor.category = category
        if (contact !== undefined) vendor.contact = contact
        if (priceRange !== undefined) vendor.priceRange = priceRange
        if (description !== undefined) vendor.description = description

        if (isAvailable !== undefined) {
            vendor.isAvailable = isAvailable === "true" || isAvailable === true
        }
        

        if (imageRemoved === "true") {
            vendor.image = undefined

        } else if (req.file) {
            // New image uploaded
            vendor.image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`
        }
        

        await vendor.save()

        return res.status(201).json({
            message: "Vendor updated successfully..",
            data: vendor
        })

    } catch (err: any) {
        console.error("Update vendor error:", err)
        return res.status(500).json({
            message: err?.message
        })
    }
}


// vendor update own profile
export const updateOwnVendorProfile = async (req: AuthRequest, res: Response) => {
    try {

        const vendor = await Vendor.findOne({ addedBy: req.user?._id })

        if (!vendor) {
            return res.status(404).json({
                message: "Vendor profile not found.."
            })
        }

        const { name, category, contact, priceRange, description, isAvailable } = req.body
        
        if (name !== undefined) vendor.name = name
        if (category !== undefined) vendor.category = category
        if (contact !== undefined) vendor.contact = contact
        if (priceRange !== undefined) vendor.priceRange = priceRange
        if (description !== undefined) vendor.description = description

        if (isAvailable !== undefined) {
            vendor.isAvailable = isAvailable === "true" || isAvailable === true
        }

        if (req.file) {
            vendor.image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
        }

        await vendor.save()

        return res.status(200).json({
            message: "Vendor profile updated successfully..",
            data: vendor
        })

    } catch (err: any) {
        console.error("Update own vendor error:", err)
        return res.status(500).json({ 
            message: err?.message 
        })
    }
}


// delete vendor function (only admin)
export const deleteVendor = async (req: AuthRequest, res: Response) => {
    try {

        if (!req.user?.roles?.includes(Role.ADMIN)) {
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
        
        await vendor.deleteOne()

        return res.status(201).json({
            message: "Vendor deleted successfully.."
        })

    } catch (err: any) {
        console.error("Delete vendor error:", err)
        return res.status(500).json({
            message: err?.message
        })
    }
}