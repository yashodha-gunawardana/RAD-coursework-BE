import { Request, Response } from "express";
import User, { Role, VendorStatus } from "../models/userModel";
import bcrypt from "bcryptjs";
import { signAccessToken } from "../utils/tokens";
import { AuthRequest } from "../middleware/authMiddleware";
import jwt from "jsonwebtoken";
import { sendEmail } from "..utils/email";


const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string


// register user function
export const registerUser = async (req: Request, res: Response) => {
    try {
        const { fullname, email, password} = req.body;

        if (!fullname || !email || !password) {
            return res.status(400).json({
                message: "All fields are required.."
            })
        }

        // only user and vendor roles allowed at registration
       /* if (role !== Role.USER && role !== Role.VENDOR) {
            return res.status(400).json({
                message: "Invalid role. Only USER or VENDOR allowed during registration."
            })
        }*/
    
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "Email already exists.."
            })
        }

        const hashedPassowrd = await bcrypt.hash(password, 10);

        const newUser = new User({
            fullname,
            email,
            password: hashedPassowrd,
            // address,
            // phone,
            roles: [Role.USER],
            vendorStatus: VendorStatus.NOT_REQUESTED
        })
        await newUser.save();

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
        console.error("Login error:", err);
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
        const user = await User.findById(req.user._id).select("-password");

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
        });

    } catch (err: any) {
        console.error("Get my details error:", err);
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
        const users = await User.find({}).select("-password")

        const formattedUsers = users.map(user => ({
            id: user._id,
            fullname: user.fullname,
            email: user.email,
            roles: user.roles,
            vendorStatus: user.vendorStatus
        }));

        res.status(200).json({
            message: "Users fetched successfully",
            data: formattedUsers
        });

    } catch (err: any) {
        console.error("Get all users error:", err)
        res.status(500).json({ 
            message: "Server error" 
        })
    }
}


// approved vendor request
export const approveVendor = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params

        const user = await User.findById(id)
        if (!user) {
            return res.status(404).json({
                message: "User not found."
            })
        }

        if (user.vendorStatus !== VendorStatus.PENDING) {
            return res.status(400).json({ 
                message: "No pending vendor request for this user" 
            })
        }


        // vendor role approve
        if (!user.roles.includes(Role.VENDOR)) {
            user.roles.push(Role.VENDOR)
        }

        user.vendorStatus = VendorStatus.APPROVED
        await user.save()

    } catch (err) {

    }
}

// refresh token & generate a new access token function
export const handleRefreshToken = async (req: AuthRequest, res: Response) => {
    try {
        // get the refresh token sent by the client
        const { token: refreshToken } = req.body

        if (!refreshToken) {
            return res.status(400).json({
                message: "Refresh token required.."
            })
        }

        // Verify the token using JWT_REFRESH_SECRET
        // jwt.verify will decode the token and check its validity
        const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET)

         // Find user in database by ID from token payload
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

