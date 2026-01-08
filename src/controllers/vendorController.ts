import { Request, Response } from "express";
import Vendor from "../models/vendorModel";
import { AuthRequest } from "../middleware/authMiddleware";
import { Role, VendorStatus } from "../models/userModel";
import User from "../models/userModel";
import mongoose from "mongoose";


// create a vendor function (only admin)
export const createVendor = async (req: AuthRequest, res: Response) => {
    try {

        if (!req.user?.roles.includes(Role.ADMIN)) {
            return res.status(403).json({
                message: "Only admin can add vendors.."
            })
        }

        const { userId, name, category, contact, priceRange, description, isAvailable } = req.body

        if (!userId) {
            return res.status(400).json({
                message: "userId is required when creating a vendor"
            })
        }

        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }


        if (!user.roles.includes(Role.VENDOR)) {
            user.roles.push(Role.VENDOR)
            user.vendorStatus = VendorStatus.APPROVED
            await user.save()
        }

        
        if (!name || !category || !contact || !priceRange) {
            return res.status(400).json({
                message: "Required fields: name, category, contact, priceRange"
            })
        }


        let image: string | undefined
        if (req.file) {
            image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`
        }

        // prevent duplicate vendor for same user
        const existingVendor = await Vendor.findOne({ userId })
        if (existingVendor) {
            return res.status(400).json({
                message: "This user already has a vendor profile"
            })
        }

        const newVendor = new Vendor({
            userId: userId,
            name,
            category,
            contact,
            priceRange,
            description:description || undefined,
            image,
            isAvailable: isAvailable !== undefined
                ? isAvailable === "true" || isAvailable === true
                : true,
            addedBy: req.user._id     
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


// get vendor by logged-in user
export const getVendorByUserId = async (req: AuthRequest, res: Response) => {
    try {

        console.log("getVendorByUserId called for user:", req.user)
        
        if (!req.user?._id) {
            return res.status(401).json({
                message: "User not authenticated"
            })
        }

        // find vendor by the logged-in user's ID
        const vendor = await Vendor.findOne({ 
            userId: req.user._id 
        })
        .populate("addedBy", "fullname email")


        if (!vendor) {
            return res.status(200).json({
                success: true,
                data: null  
            })
        }

        return res.status(200).json({
            success: true,
            data: vendor
        })

    } catch (err: any) {
        console.error("Error in getVendorByUserId:", err)
        return res.status(500).json({
            message: err?.message || "Internal server error"
        })
    }
}


// get all vendors function (public)
export const getAllVendors = async (req: AuthRequest, res: Response) => {
    try {

        const page = Math.max(parseInt(req.query.page as string) || 1, 1)
        const limit = Math.max(parseInt(req.query.limit as string) || 6, 1)
        const skip = (page - 1) * limit


        const filter: any = {}

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
export const getVendorById = async (req: Request, res: Response) => {
    try {

        const { id } = req.params
        
        // validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid vendor ID format"
            })
        }

        const vendor = await Vendor.findById(id)
            .populate("addedBy", "fullname email")

        if (!vendor) {
            return res.status(404).json({
                message: "Vendor not found"
            })
        }

        return res.status(200).json({
            success: true,
            data: vendor
        })

    } catch (err: any) {
        console.error("Get vendor by ID error:", err)
        return res.status(500).json({
            message: err?.message || "Internal server error"
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


// get vendor own profile
export const getOwnVendorProfile = async (req: AuthRequest, res: Response) => {
    try {

        if (!req.user?._id) {
            return res.status(401).json({ 
                message: "User not authenticated" 
            });
        }

        const vendor = await Vendor.findOne({ addedBy: req.user?._id })

        if (!vendor) 
            return res.status(404).json({ 
                message: "Vendor profile not found" 
        })

        res.json({ 
            success: true, 
            data: vendor 
        })

    } catch (err) {
        console.error(err)
        res.status(500).json({ 
            message: "Server error" 
        })
    }
}


// vendor update own profile
export const updateOwnVendorProfile = async (req: AuthRequest, res: Response) => {
    try {

        if (!req.user?._id) {
            return res.status(401).json({ 
                message: "User not authenticated" 
            });
        }

        const vendor = await Vendor.findOne({ addedBy: req.user?._id })

        if (!vendor) 
        return res.status(404).json({ 
            message: "Vendor profile not found" 
        })

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
            vendor.image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`
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


// for dropdown select vendors
export const getAllVendorsForSelect = async (req: Request, res: Response) => {
    try {
        
        console.log("Dropdown called for selct vendors")

        const vendors = await Vendor.find({ isAvailable: true })
            .select("_id name category image priceRange")
            .sort({ name: 1 })

        
        return res.status(200).json({
            success: true,
            count: vendors.length,
            data: vendors
        })
        
    } catch (err: any) {
        console.error("Get vendors for dropdown error:", err)
        res.status(500).json({ 
            message: err?.message 
        })
    }
}