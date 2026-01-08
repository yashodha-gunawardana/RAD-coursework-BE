"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllVendorsForSelect = exports.deleteVendor = exports.updateOwnVendorProfile = exports.getOwnVendorProfile = exports.updateVendor = exports.getVendorById = exports.getAllVendors = exports.getVendorByUserId = exports.createVendor = void 0;
const vendorModel_1 = __importDefault(require("../models/vendorModel"));
const userModel_1 = require("../models/userModel");
const userModel_2 = __importDefault(require("../models/userModel"));
const mongoose_1 = __importDefault(require("mongoose"));
// create a vendor function (only admin)
const createVendor = async (req, res) => {
    try {
        if (!req.user?.roles.includes(userModel_1.Role.ADMIN)) {
            return res.status(403).json({
                message: "Only admin can add vendors.."
            });
        }
        const { userId, name, category, contact, priceRange, description, isAvailable } = req.body;
        const user = await userModel_2.default.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        if (!user.roles.includes(userModel_1.Role.VENDOR)) {
            user.roles.push(userModel_1.Role.VENDOR);
            user.vendorStatus = userModel_1.VendorStatus.APPROVED;
            await user.save();
        }
        if (!name || !category || !contact || !priceRange) {
            return res.status(400).json({
                message: "Required fields: name, category, contact, priceRange"
            });
        }
        let image;
        if (req.file) {
            image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
        }
        const newVendor = new vendorModel_1.default({
            name,
            category,
            contact,
            priceRange,
            description: description || undefined,
            image,
            isAvailable: isAvailable !== undefined
                ? isAvailable === "true" || isAvailable === true
                : true,
            addedBy: req.user._id // track which admin added the vendor
        });
        await newVendor.save();
        return res.status(201).json({
            message: "Vendor created successfully..",
            data: newVendor
        });
    }
    catch (err) {
        console.error("Create vendor: ", err);
        return res.status(500).json({
            message: err?.message
        });
    }
};
exports.createVendor = createVendor;
// Get vendor by logged-in user
/*export const getVendorByUserId = async (req: AuthRequest, res: Response) => {
    try {
        const vendor = await Vendor.findOne({ addedBy: req.user?._id }).populate("addedBy", "name email");

        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found for this user" });
        }

        return res.status(200).json({ success: true, data: vendor });
    } catch (err: any) {
        console.error("Error fetching vendor by user:", err);
        return res.status(500).json({ message: err?.message });
    }
};*/
// vendorController.ts - getVendorByUserId function
const getVendorByUserId = async (req, res) => {
    try {
        console.log("getVendorByUserId called for user:", req.user);
        if (!req.user?._id) {
            return res.status(401).json({
                message: "User not authenticated"
            });
        }
        // Find vendor by the logged-in user's ID
        const vendor = await vendorModel_1.default.findOne({
            addedBy: req.user._id
        }).populate("addedBy", "fullname email");
        if (!vendor) {
            // For create form, it's OK if no vendor exists
            return res.status(200).json({
                success: true,
                data: null // Explicitly return null
            });
        }
        return res.status(200).json({
            success: true,
            data: vendor
        });
    }
    catch (err) {
        console.error("Error in getVendorByUserId:", err);
        return res.status(500).json({
            message: err?.message || "Internal server error"
        });
    }
};
exports.getVendorByUserId = getVendorByUserId;
// get all vendors function (public)
const getAllVendors = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit) || 6, 1);
        const skip = (page - 1) * limit;
        const filter = {};
        if (req.query.search) {
            filter.$or = [
                { name: { $regex: req.query.search, $options: "i" } },
                { contact: { $regex: req.query.search, $options: "i" } },
                { description: { $regex: req.query.search, $options: "i" } },
            ];
        }
        if (req.query.category) {
            filter.category = req.query.category;
        }
        if (req.query.isAvailable !== undefined) {
            filter.isAvailable = req.query.isAvailable === "true";
        }
        const vendors = await vendorModel_1.default.find(filter)
            .select("-addedBy")
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip);
        const total = await vendorModel_1.default.countDocuments(filter);
        return res.status(200).json({
            success: true,
            page,
            limit,
            totalItems: total,
            totalPages: Math.ceil(total / limit),
            count: vendors.length,
            data: vendors
        });
    }
    catch (err) {
        console.error("Get all vendors error:", err);
        return res.status(500).json({
            message: err?.message
        });
    }
};
exports.getAllVendors = getAllVendors;
// get vendor by id function (public)
/*export const getVendorById = async (req: AuthRequest, res: Response) => {
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
}*/
const getVendorById = async (req, res) => {
    try {
        const { id } = req.params;
        // Validate ObjectId
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid vendor ID format"
            });
        }
        const vendor = await vendorModel_1.default.findById(id)
            .populate("addedBy", "fullname email");
        if (!vendor) {
            return res.status(404).json({
                message: "Vendor not found"
            });
        }
        return res.status(200).json({
            success: true,
            data: vendor
        });
    }
    catch (err) {
        console.error("Get vendor by ID error:", err);
        return res.status(500).json({
            message: err?.message || "Internal server error"
        });
    }
};
exports.getVendorById = getVendorById;
// update vendor function (only admin)'
const updateVendor = async (req, res) => {
    try {
        if (!req.user?.roles?.includes(userModel_1.Role.ADMIN)) {
            return res.status(403).json({
                message: "Only admin can update vendors.."
            });
        }
        // find vendor by id
        const vendor = await vendorModel_1.default.findById(req.params.id);
        if (!vendor) {
            return res.status(404).json({
                message: "Vendor not found.."
            });
        }
        const { name, category, contact, priceRange, description, isAvailable, imageRemoved } = req.body;
        if (name !== undefined)
            vendor.name = name;
        if (category !== undefined)
            vendor.category = category;
        if (contact !== undefined)
            vendor.contact = contact;
        if (priceRange !== undefined)
            vendor.priceRange = priceRange;
        if (description !== undefined)
            vendor.description = description;
        if (isAvailable !== undefined) {
            vendor.isAvailable = isAvailable === "true" || isAvailable === true;
        }
        if (imageRemoved === "true") {
            vendor.image = undefined;
        }
        else if (req.file) {
            // New image uploaded
            vendor.image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
        }
        await vendor.save();
        return res.status(201).json({
            message: "Vendor updated successfully..",
            data: vendor
        });
    }
    catch (err) {
        console.error("Update vendor error:", err);
        return res.status(500).json({
            message: err?.message
        });
    }
};
exports.updateVendor = updateVendor;
const getOwnVendorProfile = async (req, res) => {
    try {
        if (!req.user?._id) {
            return res.status(401).json({
                message: "User not authenticated"
            });
        }
        const vendor = await vendorModel_1.default.findOne({ addedBy: req.user?._id });
        if (!vendor)
            return res.status(404).json({
                message: "Vendor profile not found"
            });
        res.json({
            success: true,
            data: vendor
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Server error"
        });
    }
};
exports.getOwnVendorProfile = getOwnVendorProfile;
// vendor update own profile
const updateOwnVendorProfile = async (req, res) => {
    try {
        if (!req.user?._id) {
            return res.status(401).json({
                message: "User not authenticated"
            });
        }
        const vendor = await vendorModel_1.default.findOne({ addedBy: req.user?._id });
        if (!vendor)
            return res.status(404).json({
                message: "Vendor profile not found"
            });
        const { name, category, contact, priceRange, description, isAvailable } = req.body;
        if (name !== undefined)
            vendor.name = name;
        if (category !== undefined)
            vendor.category = category;
        if (contact !== undefined)
            vendor.contact = contact;
        if (priceRange !== undefined)
            vendor.priceRange = priceRange;
        if (description !== undefined)
            vendor.description = description;
        if (isAvailable !== undefined) {
            vendor.isAvailable = isAvailable === "true" || isAvailable === true;
        }
        if (req.file) {
            vendor.image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
        }
        await vendor.save();
        return res.status(200).json({
            message: "Vendor profile updated successfully..",
            data: vendor
        });
    }
    catch (err) {
        console.error("Update own vendor error:", err);
        return res.status(500).json({
            message: err?.message
        });
    }
};
exports.updateOwnVendorProfile = updateOwnVendorProfile;
// delete vendor function (only admin)
const deleteVendor = async (req, res) => {
    try {
        if (!req.user?.roles?.includes(userModel_1.Role.ADMIN)) {
            return res.status(403).json({
                message: "Only admin can delete vendors.."
            });
        }
        const vendor = await vendorModel_1.default.findById(req.params.id);
        if (!vendor) {
            return res.status(404).json({
                message: "Vendor not found.."
            });
        }
        await vendor.deleteOne();
        return res.status(201).json({
            message: "Vendor deleted successfully.."
        });
    }
    catch (err) {
        console.error("Delete vendor error:", err);
        return res.status(500).json({
            message: err?.message
        });
    }
};
exports.deleteVendor = deleteVendor;
// for dropdown 
const getAllVendorsForSelect = async (req, res) => {
    try {
        console.log("Dropdown called for selct vendors");
        const vendors = await vendorModel_1.default.find({ isAvailable: true })
            .select("_id name category image priceRange")
            .sort({ name: 1 });
        return res.status(200).json({
            success: true,
            count: vendors.length,
            data: vendors
        });
    }
    catch (err) {
        console.error("Get vendors for dropdown error:", err);
        res.status(500).json({
            message: err?.message
        });
    }
};
exports.getAllVendorsForSelect = getAllVendorsForSelect;
