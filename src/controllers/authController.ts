import { Request, Response } from "express";
import User, { Role, VendorStatus } from "../models/userModel";
import bcrypt from "bcryptjs";
import { signAccessToken } from "../utils/tokens";
import { AuthRequest } from "../middleware/authMiddleware";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/email";
import Vendor, { VendorCategory } from "../models/vendorModel";


const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string


// register user function
export const registerUser = async (req: Request, res: Response) => {
    try {

        const { fullname, email, password} = req.body

        if (!fullname || !email || !password) {
            return res.status(400).json({
                message: "All fields are required.."
            })
        }
    
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({
                message: "Email already exists.."
            })
        }

        const hashedPassowrd = await bcrypt.hash(password, 10)

        const newUser = new User({
            fullname,
            email,
            password: hashedPassowrd,
            roles: [Role.USER],
            vendorStatus: VendorStatus.NOT_REQUESTED
        })
        await newUser.save()

        try {
            await sendEmail(
                newUser.email,
                "Welcome to Eventora",
                `Hi ${newUser.fullname},\n\nWelcome to Eventora! You can now log in and book events.`
            )

        } catch (err) {
            console.error("Welcome email failed:", err)
        }

        res.status(201).json({
            message: "Registration successfull..You can now log in.",
            data: {
                id: newUser._id,
                fullname: newUser.fullname,
                email: newUser.email,
                roles: newUser.roles,
                approved: newUser.vendorStatus
            }        
        })

    } catch (err: any) {
        console.error("Registration error: ", err)
        res.status(500).json({
            message: "Server error during registration"
        })
    }
}


// login user function
export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required.."
            });
        }

        // find the user in the database using the provided email
        const user = await User.findOne({ email })

        if (!user) {
            return res.status(401).json({
                message: "Invalid credentials.."
            })
        }

        // compare the entered passsword with the stored hashed password
        const valid = await bcrypt.compare(password, user.password)

        if (!valid) {
            return res.status(401).json({
                message: "Invalid credentials.."
            })
        }

        // generate JWT access token for the authenticated user
        const accessToken = signAccessToken(user)

        res.status(200).json({
            message: "Login successfully..",
            data: {
                id: user._id,
                fullname: user.fullname,
                email: user.email,
                roles: user.roles,
                approved: user.vendorStatus,
                accessToken
            }
        })

    } catch (err: any) {
        console.error("Login error:", err)
        res.status(500).json({
            message: err?.message
        })
    }
}


// get own details function
export const getMyDetails = async (req: AuthRequest, res: Response) => {
    try {

        if (!req.user?._id) {
            return res.status(401).json({
                message: "Unauthorized.."
            });
        }

        // req.user._id is now properly set by authMiddleware
        const user = await User.findById(req.user._id).select("-password")

        if (!user) {
            return res.status(404).json({
                message: "User not found.."
            });
        }

        res.status(200).json({
            message: "OK..",
            data: {
                id: user._id,
                fullname: user.fullname,
                email: user.email,
                roles: user.roles,
                approved: user.vendorStatus
            }
        })

    } catch (err: any) {
        console.error("Get my details error:", err)
        res.status(500).json({
            message: err?.message || "Server error"
        });
    }
}


// request to become vendor
export const requestVendor = async (req: AuthRequest, res: Response) => {
    try {

        if (!req.user?._id) {
            return res.status(401).json({
                message: "Unauthorized"
            })
        }

        const user = await User.findById(req.user._id)
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }

        if (user.vendorStatus === VendorStatus.PENDING) {
            return res.status(400).json({
                message: "Your vendor request is already pending"
            })
        }

        if (user.vendorStatus === VendorStatus.APPROVED) {
            return res.status(400).json({
                message: "You are already and approved vendor"
            })
        }

        user.vendorStatus = VendorStatus.PENDING
        await user.save()


         // notify admins about new vendor request
        try {
            const admins = await User.find({ roles: Role.ADMIN })

            for (const admin of admins) {
                await sendEmail(
                    admin.email,
                    "New Vendor Request",
                    `${user.fullname} has requested to become a vendor. Please review the request.`
                )
            }

        } catch (err) {
            console.error("Admin notification email failed:", err)
        }

        res.status(200).json({
            message: "Vendor request sumbitted successfully, Awaiting admin approval.",
            data: { VendorStatus: user.vendorStatus }
        })

    } catch (err) {
        console.error("Vendor request error:", err)
        res.status(500).json({ 
            message: "Server error" 
        })
    }
}


// get all users
export const getAllUsers = async (req: AuthRequest, res: Response) => {
    try {

        if (!req.user?.roles.includes(Role.ADMIN)) {
            return res.status(403).json({
                message: "Only admins can access this resource"
            })
        }

        const page = Math.max(parseInt(req.query.page as string) || 1, 1)
        const limit = Math.max(parseInt(req.query.limit as string) || 6, 1)
        const skip = (page - 1) * limit


        const totalUsers = await User.countDocuments()

        const admins = await User.countDocuments({ roles: Role.ADMIN })
        const vendors = await User.countDocuments({ roles: Role.VENDOR })
        const pending = await User.countDocuments({ vendorStatus: VendorStatus.PENDING })


        const users = await User.find({})
            .sort({ createdAt: -1 }) 
            .skip(skip)
            .limit(limit)
            .select("-password")


        const formattedUsers = users.map(user => ({
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            roles: user.roles,
            vendorStatus: user.vendorStatus,
            createdAt: user.createdAt

        }))

        res.status(200).json({
            success: true,
            page,
            limit,
            totalItems: totalUsers,          
            totalPages: Math.ceil(totalUsers / limit),
            count: formattedUsers.length,  
            stats: {
                totalUsers,
                admins,
                vendors,
                pending
            },
            data: formattedUsers
        })

    } catch (err: any) {
        console.error("Get all users error:", err)
        res.status(500).json({ 
            message: "Server error" 
        })
    }
}

      
// approve vendor request (admin only)
export const approveVendor = async (req: AuthRequest, res: Response) => {
    try {

        if (!req.user?.roles.includes(Role.ADMIN)) {
            return res.status(403).json({ 
                message: "Only admin can approve vendors" 
            })
        }

        const user = await User.findById(req.params.id)
        if (!user) {
            return res.status(404).json({ 
                message: "User not found" 
            })
        }

        if (user.vendorStatus !== VendorStatus.PENDING) {
            return res.status(400).json({ 
                message: "No pending vendor request" 
            })
        }

        // add VENDOR role if not already present.
        if (!user.roles.includes(Role.VENDOR)) {
            user.roles.push(Role.VENDOR);
        }

        user.vendorStatus = VendorStatus.APPROVED
        await user.save()

        // create vendor profile automatically upon approval.
        const newVendor = new Vendor({
            name: user.fullname,  
            category: VendorCategory.OTHER,  
            contact: user.email,  
            priceRange: "Contact for pricing",  
            description: "Vendor profile auto-created upon approval.",  
            isAvailable: true,  
            addedBy: req.user._id,  
            userId: user._id  
        })

        await newVendor.save()


        // send approval email 
        try {
            await sendEmail(
                user.email,
                "Vendor Request Approved",
                `Dear ${user.fullname},\n\nYour request to become a vendor has been approved!\nYou can now access vendor features.`
            )

        } catch (err) {
            console.error("Approval email failed for:", user.email, err)
        }

        res.status(200).json({ 
            message: "Vendor approved successfully" 
        })

    } catch (err) {
        console.error("Approve vendor error:", err)
        res.status(500).json({ 
            message: "Server error" 
        })
    }
}


// reject vendor request
export const rejectVendor = async (req: AuthRequest, res: Response) => {
    try {

        if (!req.user?.roles.includes(Role.ADMIN)) {
            return res.status(403).json({ 
                message: "Only admin can reject vendor request" 
            })
        }

        const { id } = req.params

        const user = await User.findById(id)
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }

        if (user.vendorStatus !== VendorStatus.PENDING) {
            return res.status(400).json({ 
                message: "No pending vendor request for this user" 
            })
        }

        user.vendorStatus = VendorStatus.REJECTED
        await user.save()


        // send rejection email
        try {
            await sendEmail(
                user.email,
                "Vendor Request Rejected",
                `Dear ${user.fullname},\n\nUnfortunately, your request to become a vendor has been rejected.\nPlease contact support for more information.`
            )

        } catch (err) {
            console.error("Rejection email failed for:", user.email, err);
        }

        res.status(200).json({ 
            message: "Vendor request rejected successfully"
        })

    } catch (err) {
        console.error("Reject vendor error:", err)
        res.status(500).json({ 
            message: "Server error" 
        })
    }
};


// delete users
export const deleteUser = async (req: AuthRequest, res: Response) => {
    try {

        const { id } = req.params

        if (!req.user?.roles.includes(Role.ADMIN)) {
            return res.status(403).json({
                message: "Only admin can delete users"
            })
        }

        const user = await User.findById(id)

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }

        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                message: "Admin cannot delete themselves"
            })
        }

        await User.findByIdAndDelete(id)

        res.status(200).json({
            message: "User deleted successfully",
            data: {
                id: user._id,
                fullname: user.fullname,
                email: user.email
            }
        })

    } catch (err) {
        console.error("Delete user error:", err)
        res.status(500).json({
            message: "Server error"
        })
    }
}


// refresh token & generate a new access token function
export const handleRefreshToken = async (req: AuthRequest, res: Response) => {
    try {
        
        const { token: refreshToken } = req.body

        if (!refreshToken) {
            return res.status(400).json({
                message: "Refresh token required.."
            })
        }

        // verify the token using JWT_REFRESH_SECRET
        const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET)

        // find user in database by ID from token payload
        const user = await User.findById(payload.sub)

        if (!user) {
            return res.status(400).json({
                message: "Invalid refresh token.."
            })
        }

        // generate a new access token 
        const accessToken = signAccessToken(user)

        res.status(200).json({
            accessToken
        })

    } catch (err) {
        res.status(403).json({
            message: "Invalid or expired token.."
        })
    }
}

